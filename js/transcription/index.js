// Orquestador de transcripción: elige motor, aplica el corrector médico y gestiona la cola sin conexión.
import { getSetting } from '../settings/settings.js';
import { LiveRecognizer, webSpeechSupported } from './webspeech.js';
import { transcribeRemote } from './whisper.js';
import { contextTerms } from '../medical/dictionary.js';
import { correctMedical } from '../medical/corrector.js';

/** Motor a usar: 'whisper' | 'webspeech' | 'none'. Con "auto", Whisper (mejor con términos médicos) si está configurado. */
export function resolveEngine() {
  const pref = getSetting('engine');
  const hasRemote = !!getSetting('transcriptionEndpoint');
  if (pref === 'whisper') return hasRemote ? 'whisper' : (webSpeechSupported() ? 'webspeech' : 'none');
  if (pref === 'webspeech') return webSpeechSupported() ? 'webspeech' : (hasRemote ? 'whisper' : 'none');
  if (hasRemote) return 'whisper';
  return webSpeechSupported() ? 'webspeech' : 'none';
}

export const createLiveRecognizer = (handlers) =>
  new LiveRecognizer({ lang: getSetting('language'), terms: contextTerms(300), ...handlers });

export async function transcribeBlob(blob) {
  const text = await transcribeRemote(blob, {
    endpoint: getSetting('transcriptionEndpoint'),
    token: getSetting('transcriptionToken'),
    lang: getSetting('language'),
  });
  return correctMedical(text).text;
}
export const polish = (text) => correctMedical(text).text;

/**
 * Cola: notas con transcriptStatus === 'pending' se transcriben cuando hay conexión y servicio.
 * `api` evita dependencias circulares: { pending(), audio(id), apply(id, text|null, status) }.
 */
let running = false;
export async function processQueue(api) {
  if (running || !navigator.onLine || !getSetting('transcriptionEndpoint')) return;
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
