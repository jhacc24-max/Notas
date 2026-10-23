import { fmtDate, fmtTime } from '../core/util.js';

const FILLERS = /^(bueno|pues|eh+|um+|a ver|vale|nota|nota de voz|anotar|apunta|apuntar|recordar|recordatorio|recuerda|recordarme|recuérdame|tengo que|hay que|que|el|la)\b[\s,:.-]*/i;

/** Título corto a partir del contenido: primera frase, sin muletillas, ≤ 8 palabras. */
export function autoTitle(text, at = Date.now()) {
  let t = String(text || '').trim().replace(/\s+/g, ' ');
  if (!t) return `Nota de voz · ${fmtDate(at)} ${fmtTime(at)}`;
  t = t.split(/[.!?\n]/)[0];
  for (let i = 0; i < 3; i++) t = t.replace(FILLERS, '');
  const words = t.split(' ').filter(Boolean);
  let title = words.slice(0, 8).join(' ').replace(/[,;:]+$/, '');
  if (words.length > 8) title += '…';
  if (!title) title = `Nota de voz · ${fmtDate(at)}`;
  return title.charAt(0).toUpperCase() + title.slice(1).slice(0, 80);
}
