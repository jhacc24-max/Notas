// Coordina el recordatorio local + Google Calendar (aviso a la hora exacta) + Google Tasks (lista de tareas).
import { saveReminder, removeReminder as rmLocal, getReminder } from './reminders.js';
import * as Tasks from '../google/tasks.js';
import * as Cal from '../google/calendar.js';
import { googleConfigured, wasConnected } from '../google/oauth.js';
import { getSetting } from '../settings/settings.js';
import { emit } from '../core/events.js';

const linked = () => googleConfigured() && wasConnected();
const useCal = () => linked() && getSetting('googleCalendarSync');
const useTasks = () => linked() && getSetting('googleTasksSync');
export const googleSyncActive = () => useCal() || useTasks();

/** Crea/modifica el recordatorio. Devuelve { synced: boolean, error?: string }. */
export async function setReminder(note, at) {
  const prev = await getReminder(note.id);
  const rec = { ...prev, noteId: note.id, at, notified: false };
  await saveReminder(rec); // primero lo local: nunca se pierde el recordatorio por fallar la red
  let synced = false;
  try {
    if (useCal()) { rec.eventId ? await Cal.updateEvent(rec.eventId, note, at) : (rec.eventId = await Cal.createEvent(note, at)); synced = true; }
    if (useTasks()) {
      if (rec.taskId) await Tasks.updateTask(rec, note, at); else Object.assign(rec, await Tasks.createTask(note, at));
      synced = true;
    }
    if (synced) await saveReminder(rec);
    return { synced };
  } catch (e) {
    if (synced) await saveReminder(rec);
    emit('toast', { text: 'Recordatorio guardado, pero no se pudo sincronizar con Google.' });
    return { synced: false, error: e.message };
  }
}

export async function clearReminder(note) {
  const prev = await getReminder(note.id);
  await rmLocal(note.id);
  if (!prev || !linked()) return;
  try { if (prev.eventId) await Cal.deleteEvent(prev.eventId); } catch { /* sin conexión: queda en Google */ }
  try { if (prev.taskId) await Tasks.deleteTask(prev); } catch { /* idem */ }
}

/** Mantiene Google al día cuando cambia el estado/título de la nota. */
export async function syncNoteChange(note) {
  const rec = note.reminder;
  if (!rec || !linked()) return;
  try { if (rec.eventId && useCal()) await Cal.updateEvent(rec.eventId, note, rec.at); } catch { /* reintento en el próximo cambio */ }
  try { if (rec.taskId && useTasks()) await Tasks.updateTask(rec, note, rec.at); } catch { /* idem */ }
}
