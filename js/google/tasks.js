// Cliente mínimo de la API de Google Tasks (https://developers.google.com/tasks/reference/rest).
// LIMITACIÓN DE LA API: el campo `due` solo conserva la FECHA; la hora se descarta. Por eso la hora
// exacta se escribe en el título/notas de la tarea, y para un aviso a la hora exacta se ofrece además
// "Añadir a Google Calendar / .ics" (ver reminders.js).
import { getToken, forgetToken } from './oauth.js';
import { fmtDateTime } from '../core/util.js';

const BASE = 'https://tasks.googleapis.com/tasks/v1';

async function api(path, { method = 'GET', body } = {}, retry = true) {
  const token = await getToken(true);
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && retry) { forgetToken(); return api(path, { method, body }, false); }
  if (res.status === 404 && method === 'DELETE') return null;
  if (!res.ok) throw new Error(`Google Tasks ${res.status}`);
  return res.status === 204 ? null : res.json();
}

const deepLink = (noteId) => `${location.origin}${location.pathname}#/note/${noteId}`;

function payload(note, at) {
  // Privacidad: se envía el título y la hora; el texto completo solo si el usuario lo permite (por defecto no).
  const due = new Date(Date.UTC(new Date(at).getFullYear(), new Date(at).getMonth(), new Date(at).getDate())).toISOString();
  return {
    title: note.title,
    notes: `⏰ ${fmtDateTime(at)}\nAbrir nota: ${deepLink(note.id)}`,
    due,
    status: note.done ? 'completed' : 'needsAction',
  };
}

export async function createTask(note, at) {
  const t = await api('/lists/@default/tasks', { method: 'POST', body: payload(note, at) });
  return { taskId: t.id, taskListId: '@default' };
}
export async function updateTask(rec, note, at) {
  const body = payload(note, at);
  if (!note.done) body.completed = null;
  return api(`/lists/${rec.taskListId || '@default'}/tasks/${rec.taskId}`, { method: 'PATCH', body });
}
export async function deleteTask(rec) {
  return api(`/lists/${rec.taskListId || '@default'}/tasks/${rec.taskId}`, { method: 'DELETE' });
}
