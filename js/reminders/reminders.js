// Recordatorios: almacén propio, separado de las notas. Una nota tiene como máximo uno.
// Registro: { noteId, at (ms), taskId?, taskListId?, notified? }
import { dbAll, dbPut, dbDelete, dbGet } from '../storage/db.js';
import { emit, on } from '../core/events.js';
import { fmtDateTime } from '../core/util.js';

export const listReminders = () => dbAll('reminders');
export const getReminder = (noteId) => dbGet('reminders', noteId);

export async function saveReminder(rec) {
  await dbPut('reminders', rec);
  emit('reminders:changed', { noteId: rec.noteId });
}
export async function removeReminder(noteId) {
  await dbDelete('reminders', noteId);
  emit('reminders:changed', { noteId });
}

// --- Avisos locales mientras la app está abierta (o instalada y en segundo plano reciente) ---
// Limitación PWA: sin servidor push no se puede despertar la app cerrada a una hora exacta.
// Por eso el recordatorio "fiable" con la app cerrada lo da Google Tasks / Google Calendar.
let timer;
export function startReminderWatcher(getNote) {
  const check = async () => {
    const now = Date.now();
    for (const r of await listReminders()) {
      if (r.notified || r.at > now || now - r.at > 24 * 3600e3) continue;
      const note = getNote(r.noteId);
      if (!note || note.done || note.deletedAt) continue;
      await notify(note, r);
      await dbPut('reminders', { ...r, notified: true });
      emit('reminders:changed', { noteId: r.noteId });
    }
  };
  clearInterval(timer);
  timer = setInterval(check, 20000);
  check();
  on('visibility', check);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check());
}

async function notify(note, r) {
  // Evita volcar texto médico en la notificación: solo título y hora.
  const body = `Recordatorio · ${fmtDateTime(r.at)}`;
  emit('toast', { text: `⏰ ${note.title}` });
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    const opts = { body, tag: `rem-${note.id}`, icon: 'icons/icon-192.png', data: { noteId: note.id } };
    if (reg) await reg.showNotification(note.title, opts); else new Notification(note.title, opts);
  } catch { /* ignorar */ }
}

export async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'default') return Notification.requestPermission();
  return Notification.permission;
}

/** Enlace para añadir el evento a Google Calendar (sí respeta la hora y avisa con notificación). */
export function googleCalendarUrl(note, at) {
  const f = (ms) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const p = new URLSearchParams({
    action: 'TEMPLATE', text: note.title, dates: `${f(at)}/${f(at + 15 * 60000)}`,
    details: (note.text || '').slice(0, 800),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

/** Archivo .ics (compatible con cualquier app de calendario Android). */
export function icsFile(note, at) {
  const f = (ms) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const t = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => '\\' + c);
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Notas//ES', 'BEGIN:VEVENT',
    `UID:${note.id}@notas`, `DTSTAMP:${f(Date.now())}`, `DTSTART:${f(at)}`, `DTEND:${f(at + 15 * 60000)}`,
    `SUMMARY:${t(note.title)}`, `DESCRIPTION:${t((note.text || '').slice(0, 800))}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Recordatorio', 'TRIGGER:PT0M', 'END:VALARM',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Recordatorio en 10 minutos', 'TRIGGER:-PT10M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return new File([body], 'recordatorio.ics', { type: 'text/calendar' });
}
