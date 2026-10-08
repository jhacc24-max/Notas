// Google Calendar (eventos). A diferencia de Tasks, un evento SÍ guarda la hora exacta y avisa con
// notificación del móvil a esa hora: es el mejor "recordatorio con la app cerrada".
import { getToken, forgetToken } from './oauth.js';

const BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

async function api(url, { method = 'GET', body } = {}, retry = true) {
  const token = await getToken(true);
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && retry) { forgetToken(); return api(url, { method, body }, false); }
  if (res.status === 404 || res.status === 410) { if (method === 'DELETE') return null; }
  if (!res.ok) throw new Error(`Google Calendar ${res.status}`);
  return res.status === 204 ? null : res.json();
}

const deepLink = (id) => `${location.origin}${location.pathname}#/note/${id}`;

export function eventPayload(note, at) {
  // Privacidad: solo el título y el enlace a la nota; el texto clínico no sale de la app.
  return {
    summary: note.title,
    description: `Abrir nota: ${deepLink(note.id)}`,
    start: { dateTime: new Date(at).toISOString() },
    end: { dateTime: new Date(at + 15 * 60000).toISOString() },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] },
  };
}
export const createEvent = async (note, at) => (await api(BASE, { method: 'POST', body: eventPayload(note, at) })).id;
export const updateEvent = (eventId, note, at) => api(`${BASE}/${eventId}`, { method: 'PATCH', body: eventPayload(note, at) });
export const deleteEvent = (eventId) => api(`${BASE}/${eventId}`, { method: 'DELETE' });
