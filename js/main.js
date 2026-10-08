import { loadSettings } from './settings/settings.js';
import { initNotes, get as getNote, active } from './notes/notes.js';
import { requestPersistence } from './storage/db.js';
import { startReminderWatcher } from './reminders/reminders.js';
import { processQueue } from './transcription/index.js';
import { queueApi } from './app-services.js';
import { addRoute, start, onRoute, back } from './ui/router.js';
import { buildShell } from './ui/shell.js';
import home from './ui/views/home.js';
import { notesView, favoritesView } from './ui/views/notes.js';
import search from './ui/views/search.js';
import calendar from './ui/views/calendar.js';
import note from './ui/views/note.js';
import review from './ui/views/review.js';
import settings from './ui/views/settings.js';
import trash from './ui/views/trash.js';
import { toast } from './ui/dialogs.js';
import { startRecordingFlow } from './ui/recording.js';
import './ui/install.js';

async function boot() {
  await loadSettings();
  await initNotes();
  const shell = buildShell();
  addRoute('/', home);
  addRoute('/notes', notesView);
  addRoute('/favorites', favoritesView);
  addRoute('/search', search);
  addRoute('/calendar', calendar);
  addRoute('/note/:id', note);
  addRoute('/review', review);
  addRoute('/settings', settings);
  addRoute('/trash', trash);
  onRoute(shell.onRoute);

  const outlet = document.getElementById('view');
  start(outlet);
  outlet.addEventListener('scroll', () => outlet.querySelector('.appbar')?.classList.toggle('scrolled', outlet.scrollTop > 4), { passive: true });

  requestAnimationFrame(() => document.getElementById('splash').classList.add('hide'));
  setTimeout(() => document.getElementById('splash')?.remove(), 600);

  if (location.hash.includes('new=1')) { location.replace('#/'); setTimeout(startRecordingFlow, 300); } // atajo "Grabar"
  requestPersistence();
  startReminderWatcher(getNote);
  const runQueue = () => processQueue(queueApi());
  window.addEventListener('online', () => { toast('Conexión recuperada'); runQueue(); });
  window.addEventListener('offline', () => toast('Sin conexión: puedes seguir grabando y consultando notas.'));
  runQueue();

  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data?.type === 'open-note' && getNote(e.data.id)) location.hash = `/note/${e.data.id}`;
      });
    } catch (err) { console.warn('SW no registrado', err.name); }
  }
  window.__notas = { ready: true, count: () => active().length, back };
}
boot().catch((e) => {
  console.error('Error al iniciar', e.name);
  document.getElementById('splash').innerHTML = '<p style="padding:24px;text-align:center">No se pudo iniciar la app. Recarga la página.</p>';
});
