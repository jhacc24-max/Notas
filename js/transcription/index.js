// Orquestador de transcripción: elige motor, aplica el corrector médico y gestiona la cola sin conexión.
import { getSetting } from '../settings/settings.js';
import { LiveRecognizer, webSpeechSupported } from './webspeech.js';
import { transcribeRemote } from './whisper.js';
import { localSupported, transcribeLocal, modelReady, MODELS } from './local.js';
import { contextTerms } from '../medical/dictionary.js';
import { correctMedical } from '../medical/corrector.js';

/**
 * Motor a usar: 'local' | 'whisper' | 'webspeech' | 'none'.
 * Automático: servidor propio si está configurado (admite contexto médico); si no, Whisper en el
 * dispositivo (gratis y fiable); si el navegador no lo soporta, el reconocimiento del navegador.
 */
export function resolveEngine() {
  const pref = getSetting('engine');
  const hasRemote = !!getSetting('transcriptionEndpoint');
  if (pref === 'webspeech' && webSpeechSupported()) return 'webspeech';
  if (pref === 'whisper' && hasRemote) return 'whisper';
  if (pref === 'local' && localSupported()) return 'local';
  if (hasRemote) return 'whisper';
  if (localSupported()) return 'local';
  return webSpeechSupported() ? 'webspeech' : 'none';
}
export const modelKey = () => (MODELS[getSetting('localModel')] ? getSetting('localModel') : 'base');

export const createLiveRecognizer = (handlers) =>
  new LiveRecognizer({ lang: getSetting('language'), terms: contextTerms(300), ...handlers });

/** Transcribe un audio con el motor activo y aplica el corrector médico. onProgress({phase,pct}). */
export async function transcribeBlob(blob, onProgress) {
  const engine = resolveEngine();
  let text = '';
  if (engine === 'whisper') {
    try {
      text = await transcribeRemote(blob, {
        endpoint: getSetting('transcriptionEndpoint'), token: getSetting('transcriptionToken'), lang: getSetting('language'),
      });
    } catch (e) {
      if (!localSupported()) throw e; // el servidor falló: se intenta en el dispositivo
      text = await transcribeLocal(blob, { key: modelKey(), lang: getSetting('language'), onProgress });
    }
  } else if (engine === 'local') {
    text = await transcribeLocal(blob, { key: modelKey(), lang: getSetting('language'), onProgress });
  } else throw new Error('No hay motor de transcripción disponible.');
  return correctMedical(text).text;
}
/** ¿Se puede transcribir ahora mismo (para la cola)? Local: modelo ya descargado o con Internet. */
export function canTranscribeNow() {
  const e = resolveEngine();
  if (e === 'whisper') return navigator.onLine;
  if (e === 'local') return modelReady(modelKey()) || navigator.onLine;
  return false;
}
export const polish = (text) => correctMedical(text).text;

/**
 * Cola: notas con transcriptStatus === 'pending' se transcriben cuando hay conexión y servicio.
 * `api` evita dependencias circulares: { pending(), audio(id), apply(id, text|null, status) }.
 */
let running = false;
export async function processQueue(api) {
  if (running || !canTranscribeNow()) return;
  running = true;
  try {
    for (const n of api.pending()) {
      const a = await api.audio(n.id);
      if (!a?.blob) { await api.apply(n.id, null, 'none'); continue; }
      await api.apply(n.id, null, 'processing');
      try {
        await api.apply(n.id, await transcribeBlob(a.blob), 'done');
      } catch {
        await api.apply(n.id, null, 'pending');
        break; // reintentar en la próxima conexión
      }
    }
  } finally { running = false; }
}
