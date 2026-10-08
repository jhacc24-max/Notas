// Motor 3 (GRATIS y por defecto): Whisper en el propio teléfono, sin cuentas ni servidores.
// No depende de compartir el micrófono con el reconocimiento del navegador (que falla en muchos Android):
// primero se graba el audio y después se transcribe ese audio.
import { emit } from '../core/events.js';

export const MODELS = {
  base: { id: 'Xenova/whisper-base', mb: 80, label: 'Estándar' },
  small: { id: 'Xenova/whisper-small', mb: 250, label: 'Alta precisión' },
};
export const localSupported = () =>
  typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);

const flag = (k) => `asr-ready:${k}`;
export const modelReady = (k) => { try { return localStorage.getItem(flag(k)) === '1'; } catch { return false; } };
const setReady = (k) => { try { localStorage.setItem(flag(k), '1'); } catch { /* sin almacenamiento */ } };

let worker = null, seq = 0;
const jobs = new Map();
const ensureWorker = () => {
  if (worker) return worker;
  worker = new Worker(new URL('./asr-worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    const j = jobs.get(data.id);
    if (!j) return;
    if (data.type === 'progress') j.onProgress?.({ phase: 'download', pct: data.pct });
    else if (data.type === 'status') j.onProgress?.({ phase: data.phase });
    else if (data.type === 'ready') { jobs.delete(data.id); j.resolve(); }
    else if (data.type === 'result') { jobs.delete(data.id); j.resolve(data.text); }
    else if (data.type === 'error') {
      jobs.delete(data.id);
      j.reject(new Error(/fetch|network|load failed/i.test(data.message) ? 'No se pudo descargar el motor de voz. Revisa tu conexión a Internet.' : data.message));
    }
  };
  worker.onerror = (e) => {
    for (const j of jobs.values()) j.reject(new Error(e.message || 'Error del motor de voz'));
    jobs.clear(); worker = null;
  };
  return worker;
};
const call = (msg, onProgress, transfer = []) => new Promise((resolve, reject) => {
  const id = ++seq;
  jobs.set(id, { resolve, reject, onProgress });
  ensureWorker().postMessage({ ...msg, id }, transfer);
});

/** Audio grabado (webm/mp4) -> Float32Array mono a 16 kHz, el formato que espera Whisper. */
export async function decodeAudio(blob) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx({ sampleRate: 16000 });
  try {
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    const n = buf.length, out = new Float32Array(n);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < n; i++) out[i] += ch[i] / buf.numberOfChannels;
    }
    return out;
  } finally { ctx.close?.().catch(() => {}); }
}

// Estado global de la descarga (para mostrar progreso en Inicio/Ajustes sin acoplar pantallas).
export const downloadState = { busy: false, pct: 0, error: '' };

export async function prepareModel(key, onProgress) {
  if (downloadState.busy) return;
  downloadState.busy = true; downloadState.error = ''; downloadState.pct = 0;
  const tick = (p) => { if (p.pct != null) downloadState.pct = p.pct; onProgress?.(p); emit('asr:progress'); };
  emit('asr:progress');
  try {
    await call({ type: 'load', model: MODELS[key].id }, tick);
    setReady(key);
  } catch (e) { downloadState.error = e.message; throw e; }
  finally { downloadState.busy = false; emit('asr:progress'); }
}

export async function transcribeLocal(blob, { key = 'base', lang = 'es-ES', onProgress } = {}) {
  const audio = await decodeAudio(blob);
  if (!audio.length) return '';
  const language = { es: 'spanish' }[lang.slice(0, 2)] || 'spanish';
  const wasReady = modelReady(key);
  const text = await call({ type: 'run', model: MODELS[key].id, audio, language }, (p) => {
    if (p.phase === 'download') downloadState.pct = p.pct;
    onProgress?.(p);
  }, [audio.buffer]);
  if (!wasReady) setReady(key);
  return text;
}
