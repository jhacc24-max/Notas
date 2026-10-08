// Coordina recordatorio local + tarea de Google Tasks (si está conectado y activado).
import { saveReminder, removeReminder as rmLocal, getReminder } from './reminders.js';
import * as Tasks from '../google/tasks.js';
import { googleConfigured, wasConnected } from '../google/oauth.js';
import { getSetting } from '../settings/settings.js';
import { emit } from '../core/events.js';

const syncEnabled = () => getSetting('googleTasksSync') && googleConfigured() && wasConnected();

/** Crea/modifica el recordatorio. Devuelve { synced: boolean, error?: string }. */
export async function setReminder(note, at) {
  const prev = await getReminder(note.id);
  const rec = { noteId: note.id, at, notified: false, taskId: prev?.taskId, taskListId: prev?.taskListId };
  await saveReminder(rec); // primero lo local: nunca se pierde el recordatorio por fallar la red
  if (!syncEnabled()) return { synced: false };
  try {
    if (rec.taskId) await Tasks.updateTask(rec, note, at);
    else Object.assign(rec, await Tasks.createTask(note, at));
    await saveReminder(rec);
    return { synced: true };
  } catch (e) {
    emit('toast', { text: 'Recordatorio guardado, pero no se pudo sincronizar con Google Tasks.' });
    return { synced: false, error: e.message };
  }
}

export async function clearReminder(note) {
  const prev = await getReminder(note.id);
  await rmLocal(note.id);
  if (prev?.taskId && syncEnabled()) { try { await Tasks.deleteTask(prev); } catch { /* sin conexión: la tarea queda en Google */ } }
}

/** Mantiene Google Tasks al día cuando cambia el estado/título de la nota. */
export async function syncNoteChange(note) {
  const rec = note.reminder;
  if (!rec?.taskId || !syncEnabled()) return;
  try { await Tasks.updateTask(rec, note, rec.at); } catch { /* reintento en el próximo cambio */ }
}
