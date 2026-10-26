// Grabación de audio con MediaRecorder. Devuelve un Blob + duración medida (los WebM de
// MediaRecorder no traen duración en la cabecera, por eso la medimos nosotros).
const MIMES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
export const pickMime = () => MIMES.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || '';
export const recordingSupported = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

export class Recorder {
  constructor() { this.level = 0; this.onLevel = null; }

  /** Pide permiso de micrófono (si falta) y empieza a grabar. Lanza Error con `.code` legible. */
  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      const err = new Error(e.name === 'NotAllowedError' ? 'Permiso de micrófono denegado. Actívalo en los ajustes del sitio.'
        : e.name === 'NotFoundError' ? 'No se encontró ningún micrófono.' : 'No se pudo acceder al micrófono.');
      err.code = e.name;
      throw err;
    }
    this.mime = pickMime();
    this.chunks = [];
    this.rec = new MediaRecorder(this.stream, this.mime ? { mimeType: this.mime } : undefined);
    this.mime = this.rec.mimeType || this.mime || 'audio/webm';
    this.rec.ondataavailable = (e) => e.data?.size && this.chunks.push(e.data);
    this.rec.start(1000);
    this.t0 = performance.now();
    this._meter();
    try { this.wake = await navigator.wakeLock?.request('screen'); } catch { /* opcional */ }
  }

  get elapsed() { return this.t0 ? (performance.now() - this.t0) / 1000 : 0; }

  _meter() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      const src = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      src.connect(this.analyser);
      const buf = new Uint8Array(this.analyser.frequencyBinCount);
      const tick = () => {
        if (!this.analyser) return;
        this.analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
        this.level = peak / 128;
        this.onLevel?.(this.level);
        this.raf = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* el medidor es solo visual */ }
  }

  _cleanup() {
    cancelAnimationFrame(this.raf);
    this.analyser = null;
    this.ctx?.close?.().catch(() => {});
    this.stream?.getTracks().forEach((t) => t.stop());
    this.wake?.release?.().catch(() => {});
  }

  stop() {
    return new Promise((resolve) => {
      const duration = this.elapsed;
      const finish = () => {
        this._cleanup();
        resolve({ blob: new Blob(this.chunks, { type: this.mime }), mime: this.mime, duration });
      };
      if (!this.rec || this.rec.state === 'inactive') return finish();
      this.rec.onstop = finish;
      this.rec.stop();
    });
  }

  cancel() {
    try { if (this.rec?.state !== 'inactive') this.rec.stop(); } catch { /* ya parado */ }
    this._cleanup();
  }
}
