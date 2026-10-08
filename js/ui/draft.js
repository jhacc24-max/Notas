// Borrador: grabación recién terminada, aún sin guardar. El audio se persiste en cuanto se detiene
// la grabación, de modo que no se pierde si se cierra la app antes de pulsar "Guardar".
import { dbGet, dbPut, dbDelete } from '../storage/db.js';
import { emit } from '../core/events.js';

let draft = null;
const KEY = '__draft__';

export const getDraft = () => draft;
export function setDraft(d) {
  draft = d;
  emit('draft:changed');
  if (d?.blob) {
    dbPut('audio', { id: KEY, blob: d.blob, mime: d.mime, duration: d.duration }).catch(() => {});
    dbPut('settings', { key: KEY, value: { text: d.text, status: d.status, at: d.at } }).catch(() => {});
  }
}
export function patchDraft(p) {
  if (!draft) return;
  Object.assign(draft, p);
  emit('draft:changed');
  dbPut('settings', { key: KEY, value: { text: draft.text, status: draft.status, at: draft.at } }).catch(() => {});
}
export async function clearDraft() {
  draft?.abort?.();
  draft = null;
  await Promise.all([dbDelete('audio', KEY), dbDelete('settings', KEY)]).catch(() => {});
  emit('draft:changed');
}
export async function restoreDraft() {
  if (draft) return draft;
  const [a, meta] = await Promise.all([dbGet('audio', KEY), dbGet('settings', KEY)]);
  if (!a?.blob) return null;
  const m = meta?.value || {};
  const status = m.status === 'transcribing' ? 'pending' : (m.status || 'none');
  draft = { blob: a.blob, mime: a.mime, duration: a.duration, text: m.text || '', status, at: m.at || Date.now() };
  return draft;
}
export const hasSavedDraft = async () => !!(draft || (await dbGet('audio', KEY)));
