// Compartir con Web Share API; alternativas: portapapeles y WhatsApp/correo.
import { fmtDate, fmtTime } from '../core/util.js';
import { getAudio } from '../notes/notes.js';

const PRIO = { high: 'Alta', medium: 'Media', low: 'Baja' };

export function noteToText(n) {
  return [
    n.title,
    `${fmtDate(n.createdAt)} · ${fmtTime(n.createdAt)}`,
    `Prioridad: ${PRIO[n.priority]} · Estado: ${n.done ? 'Realizada' : 'Pendiente'}`,
    '', n.text || '(sin texto)',
  ].join('\n');
}
export const notesToText = (notes) => notes.map(noteToText).join('\n\n— — —\n\n');

async function audioFiles(notes) {
  const files = [];
  for (const n of notes) {
    if (!n.hasAudio) continue;
    const a = await getAudio(n.id);
    if (!a?.blob) continue;
    const ext = a.mime.includes('mp4') ? 'm4a' : a.mime.includes('ogg') ? 'ogg' : 'webm';
    files.push(new File([a.blob], `${n.title.slice(0, 40).replace(/[^\w\- ]+/g, '')}.${ext}`, { type: a.mime.split(';')[0] }));
  }
  return files;
}

/** @returns {'shared'|'copied'|'cancelled'|'unavailable'} */
export async function shareNotes(notes, { withAudio = false } = {}) {
  const text = notesToText(notes);
  const data = { title: notes.length === 1 ? notes[0].title : `${notes.length} notas`, text };
  if (withAudio) {
    const files = await audioFiles(notes);
    if (files.length && navigator.canShare?.({ files })) data.files = files;
  }
  if (navigator.share) {
    try { await navigator.share(data); return 'shared'; }
    catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  try { await navigator.clipboard.writeText(text); return 'copied'; } catch { return 'unavailable'; }
}

export const whatsappUrl = (notes) => `https://wa.me/?text=${encodeURIComponent(notesToText(notes))}`;
export const mailUrl = (notes) =>
  `mailto:?subject=${encodeURIComponent(notes.length === 1 ? notes[0].title : `${notes.length} notas`)}&body=${encodeURIComponent(notesToText(notes))}`;
