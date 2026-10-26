// Avisos push GRATIS con ntfy (https://ntfy.sh): sin cuentas ni claves. Funcionan con la app CERRADA.
// Cómo: la app programa el aviso en el servidor ntfy (cabecera «Delay») y la app Android «ntfy»,
// suscrita a tu tema privado, lo muestra a la hora exacta.
// Límites de ntfy: un aviso se puede programar con un máximo de 3 días de antelación; los recordatorios
// más lejanos se programan solos cuando abres la app y ya caen dentro de esa ventana.
// Privacidad: el «tema» es un nombre aleatorio largo (hace de contraseña). Por defecto el aviso NO incluye
// el título de la nota (solo «Tienes un recordatorio»); se puede activar en Ajustes.
import { getSetting, setSetting } from '../settings/settings.js';
import { fmtTime } from '../core/util.js';

const MAX_AHEAD = 3 * 86400e3 - 60e3;
const server = () => (getSetting('ntfyServer') || 'https://ntfy.sh').replace(/\/$/, '');
export const ntfyOn = () => !!getSetting('ntfyOn') && !!getSetting('ntfyTopic');

const randomTopic = () => {
  const b = crypto.getRandomValues(new Uint8Array(12));
  return 'notas-' + [...b].map((x) => x.toString(36).padStart(2, '0')).join('').slice(0, 18);
};
export async function enableNtfy() {
  if (!getSetting('ntfyTopic')) await setSetting('ntfyTopic', randomTopic());
  await setSetting('ntfyOn', true);
}
export const subscribeLink = () => `ntfy://${server().replace(/^https?:\/\//, '')}/${getSetting('ntfyTopic')}`;

const deepLink = (noteId) => `${location.origin}${location.pathname}#/note/${noteId}`;
const seqOf = (noteId) => 'n' + noteId.replace(/-/g, '').slice(0, 16);

/** Programa el aviso de una nota. Devuelve true si quedó programado en ntfy. */
export async function scheduleNtfy(note, at) {
  if (!ntfyOn()) return false;
  const ahead = at - Date.now();
  if (ahead > MAX_AHEAD) return false;           // se programará más adelante (ver scheduleDue)
  const when = Math.max(at, Date.now() + 15e3);   // ntfy exige ≥ 10 s de retraso
  const showTitle = !!getSetting('ntfyShowTitle');
  const headers = {
    Title: showTitle ? note.title : 'Tienes un recordatorio',
    Tags: 'bell', Priority: '4', Click: deepLink(note.id), Delay: String(Math.floor(when / 1000)),
  };
  const message = showTitle ? `Recordatorio · ${fmtTime(at)}` : `Recordatorio de las ${fmtTime(at)} · toca para abrir la nota`;
  const base = `${server()}/${getSetting('ntfyTopic')}`;
  const send = async (url) => {
    const res = await fetch(url, { method: 'POST', headers, body: message });
    if (!res.ok) throw new Error(`ntfy ${res.status}`);
  };
  try { await send(`${base}/${seqOf(note.id)}`); }   // con ID de secuencia: permite actualizar/cancelar
  catch { await send(base); }                          // servidores antiguos: aviso simple
  return true;
}

/** Intenta cancelar un aviso programado (mejor esfuerzo: depende de la versión del servidor ntfy). */
export async function cancelNtfy(noteId) {
  if (!ntfyOn()) return;
  try { await fetch(`${server()}/${getSetting('ntfyTopic')}/${seqOf(noteId)}`, { method: 'DELETE' }); } catch { /* sin conexión */ }
}

export async function sendTestNtfy() {
  const res = await fetch(`${server()}/${getSetting('ntfyTopic')}`, {
    method: 'POST', headers: { Title: 'Notas: aviso de prueba', Tags: 'white_check_mark' }, body: 'Si ves esto, los avisos funcionan ✅',
  });
  if (!res.ok) throw new Error(`ntfy ${res.status}`);
}
