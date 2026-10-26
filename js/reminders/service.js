// Coordina el recordatorio local + Google Calendar (aviso a la hora exacta) + Google Tasks (lista de tareas).
import { saveReminder, removeReminder as rmLocal, getReminder } from './reminders.js';
import * as Tasks from '../google/tasks.js';
import * as Cal from '../google/calendar.js';
import { googleConfigured, wasConnected } from '../google/oauth.js';
import { getSetting } from '../settings/settings.js';
import { emit } from '../core/events.js';
import { scheduleNtfy, cancelNtfy, ntfyOn } from './ntfy.js';

const linked = () => googleConfigured() && wasConnected();
const useCal = () => linked() && getSetting('googleCalendarSync');
const useTasks = () => linked() && getSetting('googleTasksSync');
export const googleSyncActive = () => useCal() || useTasks();

/** Texto para avisar al usuario de lo que se hizo con el recordatorio. */
export const reminderToast = (r) => `Recordatorio guardado${r.push ? ' · aviso push programado' : ''}${r.google ? ' · añadido a Google' : ''}`;

/** Crea/modifica el recordatorio. Devuelve { synced, push, google, error? }. */
export async function setReminder(note, at) {
  const prev = await getReminder(note.id);
  const rec = { ...prev, noteId: note.id, at, notified: false };
  await saveReminder(rec); // primero lo local: nunca se pierde el recordatorio por fallar la red
  let synced = false, push = false;
  if (ntfyOn()) {
    try { rec.ntfyAt = (await scheduleNtfy(note, at)) ? at : null; await saveReminder(rec); push = rec.ntfyAt != null; }
    catch { emit('toast', { text: 'No se pudo programar el aviso push (¿sin Internet?). Se reintentará al abrir la app.' }); }
  }
  try {
    if (useCal()) { rec.eventId ? await Cal.updateEvent(rec.eventId, note, at) : (rec.eventId = await Cal.createEvent(note, at)); synced = true; }
    if (useTasks()) {
      if (rec.taskId) await Tasks.updateTask(rec, note, at); else Object.assign(rec, await Tasks.createTask(note, at));
      synced = true;
    }
    if (synced) await saveReminder(rec);
    return { synced, push, google: synced };
  } catch (e) {
    if (synced) await saveReminder(rec);
    emit('toast', { text: 'Recordatorio guardado, pero no se pudo sincronizar con Google.' });
    return { synced: false, push, google: false, error: e.message };
  }
}

export async function clearReminder(note) {
  const prev = await getReminder(note.id);
  await rmLocal(note.id);
  if (prev?.ntfyAt) cancelNtfy(note.id);
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

/** Programa en ntfy los recordatorios que ya entran en la ventana de 3 días (se llama al abrir la app). */
export async function scheduleDueNtfy(getNote) {
  if (!ntfyOn() || !navigator.onLine) return;
  const { listReminders } = await import('./reminders.js');
  for (const r of await listReminders()) {
    if (r.ntfyAt === r.at || r.at < Date.now()) continue;
    const note = getNote(r.noteId);
    if (!note || note.done || note.deletedAt) continue;
    try { if (await scheduleNtfy(note, r.at)) await saveReminder({ ...r, ntfyAt: r.at }); } catch { /* reintento en la próxima apertura */ }
  }
}
