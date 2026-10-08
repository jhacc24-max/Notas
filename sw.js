// Service worker: precache del "app shell" (funciona sin conexión) + actualización por versión.
const VERSION = 'v1.1.0';
const CACHE = `notas-${VERSION}`;
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/tokens.css', 'css/base.css',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/icon-180.png',
  'js/main.js', 'js/config.js', 'js/app-services.js',
  'js/core/util.js', 'js/core/events.js', 'js/core/icons.js',
  'js/storage/db.js', 'js/settings/settings.js',
  'js/notes/notes.js', 'js/notes/titles.js', 'js/notes/demo.js',
  'js/audio/recorder.js',
  'js/transcription/index.js', 'js/transcription/webspeech.js', 'js/transcription/whisper.js',
  'js/medical/terms.js', 'js/medical/dictionary.js', 'js/medical/corrector.js',
  'js/calendar/calendar.js', 'js/reminders/reminders.js', 'js/reminders/service.js',
  'js/google/oauth.js', 'js/google/tasks.js', 'js/search/search-index.js', 'js/share/share.js',
  'js/ui/router.js', 'js/ui/shell.js', 'js/ui/components.js', 'js/ui/dialogs.js', 'js/ui/player.js', 'js/ui/selection.js',
  'js/ui/actions.js', 'js/ui/draft.js', 'js/ui/recording.js', 'js/ui/install.js',
  'js/ui/views/home.js', 'js/ui/views/notes.js', 'js/ui/views/search.js', 'js/ui/views/calendar.js',
  'js/ui/views/note.js', 'js/ui/views/review.js', 'js/ui/views/settings.js', 'js/ui/views/trash.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // Solo recursos propios (nunca se cachean APIs de transcripción ni de Google).
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (req.mode === 'navigate') {
      try { const fresh = await fetch(req); cache.put('index.html', fresh.clone()); return fresh; }
      catch { return (await cache.match('index.html')) || (await cache.match('./')); }
    }
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) {
      // stale-while-revalidate: rápido y se actualiza solo
      fetch(req).then((r) => r.ok && cache.put(req, r)).catch(() => {});
      return hit;
    }
    try { const r = await fetch(req); if (r.ok) cache.put(req, r.clone()); return r; }
    catch { return new Response('', { status: 504 }); }
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const id = e.notification.data?.noteId;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const c = all[0];
    if (c) { await c.focus(); if (id) c.postMessage({ type: 'open-note', id }); }
    else await self.clients.openWindow(id ? `./#/note/${id}` : './');
  })());
});
