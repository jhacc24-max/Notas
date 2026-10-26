// Motor 2: transcripción en servidor (modelo Whisper de OpenAI a través de TU proxy, ver /server).
// Ventaja clave: acepta un `prompt` con vocabulario médico -> el modelo usa los términos como contexto
// al decodificar (mucho mejor que corregir después). Límite: el audio viaja a tu proxy y a OpenAI.
import { whisperPrompt } from '../medical/dictionary.js';

export async function transcribeRemote(blob, { endpoint, token, model, lang = 'es', prompt = whisperPrompt(), signal } = {}) {
  if (!endpoint) throw new Error('No hay servicio de transcripción configurado.');
  const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
  const form = new FormData();
  form.append('file', blob, `nota.${ext}`);
  if (model) form.append('model', model); // directo a Groq/OpenAI; con el proxy lo añade el servidor
  form.append('language', lang.slice(0, 2));
  form.append('temperature', '0');
  form.append('prompt', prompt);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 120000);
  signal?.addEventListener('abort', () => ctl.abort());
  try {
    const res = await fetch(endpoint, {
      method: 'POST', body: form, signal: ctl.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.status === 401) throw new Error('La clave no es válida (401).');
    if (res.status === 429) throw new Error('Límite de uso gratuito alcanzado; prueba en unos minutos (429).');
    if (!res.ok) throw new Error(`El servicio respondió ${res.status}.`);
    const data = await res.json();
    return String(data.text ?? '').trim();
  } finally { clearTimeout(timer); }
}
