// Motor 1: reconocimiento de voz del navegador (Web Speech API, en Chrome/Android lo procesa Google).
// Ventajas: en vivo y gratuito. Límites: requiere Internet, el audio sale del dispositivo hacia Google,
// y en algunos móviles no puede compartir el micrófono con MediaRecorder (se avisa y se usa el respaldo).
const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition;
export const webSpeechSupported = () => !!SR();

export class LiveRecognizer {
  /** @param {{lang:string, terms?:string[], onUpdate?:(text:string,interim:string)=>void, onError?:(code:string)=>void}} o */
  constructor(o) { this.o = o; this.final = ''; this.interim = ''; this.active = false; this.failed = null; }

  start() {
    const rec = (this.rec = new (SR())());
    rec.lang = this.o.lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    // Sesgo contextual con terminología médica (Chrome ≥ 142; si no existe se ignora sin error).
    try {
      if (this.o.terms?.length && 'phrases' in rec && window.SpeechRecognitionPhrase) {
        rec.phrases = this.o.terms.slice(0, 500).map((t) => new window.SpeechRecognitionPhrase(t, 5.0));
      }
    } catch { /* no soportado */ }
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) this.final += (this.final ? ' ' : '') + r[0].transcript.trim();
        else interim += r[0].transcript;
      }
      this.interim = interim;
      this.o.onUpdate?.(this.final, interim);
    };
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      this.failed = e.error;
      this.o.onError?.(e.error);
    };
    rec.onend = () => {
      // Chrome corta tras unos segundos de silencio: reanudar mientras el usuario siga grabando.
      if (this.active && !this.failed) { try { rec.start(); } catch { /* ya iniciado */ } }
      else this._resolve?.();
    };
    this.active = true;
    try { rec.start(); } catch (e) { this.failed = e.name; this.o.onError?.(e.name); }
  }

  /** Detiene y devuelve el texto final (incluye lo provisional pendiente). */
  stop() {
    return new Promise((resolve) => {
      if (!this.rec || !this.active) return resolve(this.final);
      this.active = false;
      const done = () => { clearTimeout(t); resolve((this.final + ' ' + this.interim).trim()); };
      const t = setTimeout(done, 1500);
      this._resolve = done;
      try { this.rec.stop(); } catch { done(); }
    });
  }
  abort() { this.active = false; try { this.rec?.abort(); } catch { /* nada */ } }
}
