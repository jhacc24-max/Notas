// Web Worker: transcripción EN EL DISPOSITIVO con Whisper (transformers.js + ONNX Runtime WASM).
// Corre en segundo plano para no congelar la interfaz. Gratis, sin cuentas y sin enviar audio a nadie.
// Solo necesita Internet la primera vez (descargar la librería y el modelo); después funciona sin conexión.
const LIB = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js';

let tf = null, pipe = null, loaded = null;
const post = (m) => self.postMessage(m);

async function getTf() {
  if (!tf) {
    tf = await import(LIB);
    tf.env.allowLocalModels = false;
    tf.env.useBrowserCache = true; // Cache API: el modelo queda guardado en el teléfono
  }
  return tf;
}

async function load(model, id, expected = 0) {
  if (pipe && loaded === model) return;
  pipe = null; loaded = null;
  const { pipeline } = await getTf();
  const files = new Map();
  let best = 0;
  pipe = await pipeline('automatic-speech-recognition', model, {
    dtype: 'q8', device: 'wasm',
    progress_callback: (p) => {
      if (p.status !== 'progress' || !p.total) return;
      files.set(p.file, [p.loaded, p.total]);
      let l = 0, t = 0;
      for (const [a, b] of files.values()) { l += a; t += b; }
      // Los archivos se descubren de uno en uno: se usa el tamaño esperado para que el % no retroceda.
      best = Math.max(best, Math.min(99, Math.round((l / Math.max(t, expected)) * 100)));
      post({ type: 'progress', id, pct: best });
    },
  });
  loaded = model;
}

self.onmessage = async ({ data }) => {
  const { type, id } = data;
  try {
    if (type === 'load') {
      await load(data.model, id, data.expected);
      post({ type: 'ready', id });
    } else if (type === 'run') {
      await load(data.model, id, data.expected);
      post({ type: 'status', id, phase: 'transcribe' });
      const out = await pipe(data.audio, {
        language: data.language, task: 'transcribe',
        chunk_length_s: 30, stride_length_s: 5, return_timestamps: false,
      });
      const text = Array.isArray(out) ? out.map((o) => o.text).join(' ') : out.text;
      post({ type: 'result', id, text: String(text || '').trim() });
    }
  } catch (e) {
    post({ type: 'error', id, message: String(e?.message || e).slice(0, 200) });
  }
};
