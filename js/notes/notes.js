// Gestión de notas: caché en memoria + persistencia (IndexedDB) + índice de búsqueda.
// Modelo de nota: { id, title, text, createdAt, updatedAt, done, priority('high'|'medium'|'low'),
//   favorite, category, hasAudio, audioMime, audioDuration, transcriptStatus('done'|'pending'|'processing'|'none'),
//   deletedAt|null }  +  reminder (hidratado desde el almacén "reminders"): { at, taskId?, taskListId?, notified? }
import { dbAll, dbPut, dbGet, dbDelete } from '../storage/db.js';
import { emit, on } from '../core/events.js';
import { uid } from '../core/util.js';
import { searchIndex } from '../search/search-index.js';
import { listReminders } from '../reminders/reminders.js';
import { autoTitle } from './titles.js';

const cache = new Map();
const TRASH_DAYS = 30;
export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const persist = async (note) => {
  const { reminder, ...plain } = note; // el recordatorio vive en su propio almacén
  await dbPut('notes', plain);
};

export async function initNotes() {
  cache.clear(); searchIndex.clear();
  const [notes, reminders] = await Promise.all([dbAll('notes'), listReminders()]);
  const byNote = new Map(reminders.map((r) => [r.noteId, r]));
  for (const n of notes) {
    n.reminder = byNote.get(n.id) || null;
    cache.set(n.id, n);
    if (!n.deletedAt) searchIndex.upsert(n);
  }
  await purgeOld();
  on('reminders:changed', async ({ noteId }) => {
    const n = cache.get(noteId);
    if (!n) return;
    const rs = await listReminders();
    n.reminder = rs.find((r) => r.noteId === noteId) || null;
    emit('notes:changed', { ids: [noteId] });
  });
  emit('notes:changed', {});
}

export const get = (id) => cache.get(id);
export const all = () => [...cache.values()];
export const active = () => all().filter((n) => !n.deletedAt);
export const trashed = () => all().filter((n) => n.deletedAt).sort((a, b) => b.deletedAt - a.deletedAt);
export const favorites = () => active().filter((n) => n.favorite);
export const pendingTranscription = () => active().filter((n) => n.transcriptStatus === 'pending');

export const byRecent = (a, b) => b.createdAt - a.createdAt;
export const byPriority = (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || byRecent(a, b);

/** Crea y guarda una nota (con su audio, si existe). */
export async function create({ text = '', title = '', audio = null, transcriptStatus = 'done', priority = 'medium', createdAt = Date.now(), category = '', kind = '' }) {
  const now = createdAt;
  const note = {
    id: uid(), title: title.trim() || autoTitle(text, now), text, createdAt: now, updatedAt: now,
    done: false, priority, favorite: false, category, kind,
    hasAudio: !!audio, audioMime: audio?.mime || '', audioDuration: audio?.duration || 0,
    transcriptStatus, deletedAt: null, reminder: null, autoTitle: !title.trim(),
  };
  if (audio) await dbPut('audio', { id: note.id, blob: audio.blob, mime: audio.mime, duration: audio.duration });
  await persist(note);
  cache.set(note.id, note);
  searchIndex.upsert(note);
  emit('notes:changed', { ids: [note.id] });
  return note;
}

export async function update(id, patch, { silent = false } = {}) {
  const n = cache.get(id);
  if (!n) return null;
  Object.assign(n, patch, { updatedAt: Date.now() });
  // El título automático sigue al texto mientras el usuario no lo haya fijado manualmente.
  if ('text' in patch && n.autoTitle && !('title' in patch)) n.title = autoTitle(n.text, n.createdAt);
  if ('title' in patch) n.autoTitle = !String(patch.title).trim();
  if (!n.title.trim()) n.title = autoTitle(n.text, n.createdAt);
  await persist(n);
  searchIndex.upsert(n);
  if (!silent) emit('notes:changed', { ids: [id] });
  return n;
}

export const toggleFavorite = (id) => update(id, { favorite: !cache.get(id).favorite });
export const toggleDone = (id) => update(id, { done: !cache.get(id).done });
export const setPriority = (id, priority) => update(id, { priority });

export async function bulk(ids, fn) {
  for (const id of ids) await fn(id);
}

export async function trash(ids) {
  const t = Date.now();
  for (const id of ids) {
    const n = cache.get(id);
    if (!n) continue;
    n.deletedAt = t;
    await persist(n);
    searchIndex.remove(id);
  }
  emit('notes:changed', { ids });
}
export async function restore(ids) {
  for (const id of ids) {
    const n = cache.get(id);
    if (!n) continue;
    n.deletedAt = null;
    await persist(n);
    searchIndex.upsert(n);
  }
  emit('notes:changed', { ids });
}
export async function purge(ids) {
  for (const id of ids) {
    await Promise.all([dbDelete('notes', id), dbDelete('audio', id), dbDelete('reminders', id)]);
    cache.delete(id);
    searchIndex.remove(id);
  }
  emit('notes:changed', { ids });
}
export const emptyTrash = () => purge(trashed().map((n) => n.id));
async function purgeOld() {
  const limit = Date.now() - TRASH_DAYS * 86400000;
  const old = trashed().filter((n) => n.deletedAt < limit).map((n) => n.id);
  if (old.length) await purge(old);
}
export const TRASH_RETENTION_DAYS = TRASH_DAYS;

export const getAudio = (id) => dbGet('audio', id);

// ----- consultas -----
export function filterNotes(list, { status = 'all', priority = 'all', kind = 'all', fav = 'all', sort = 'recent' } = {}) {
  let out = list;
  if (fav === 'fav') out = out.filter((n) => n.favorite);
  if (status === 'pending') out = out.filter((n) => !n.done);
  if (status === 'done') out = out.filter((n) => n.done);
  if (priority !== 'all') out = out.filter((n) => n.priority === priority);
  if (kind === 'none') out = out.filter((n) => !n.kind);
  else if (kind !== 'all') out = out.filter((n) => n.kind === kind);
  return [...out].sort(sort === 'priority' ? byPriority : sort === 'old' ? (a, b) => a.createdAt - b.createdAt : byRecent);
}
export const search = (q) => searchIndex.search(q).map(get).filter((n) => n && !n.deletedAt);
