// Prueba de extremo a extremo en Chromium (micrófono simulado + servicio de transcripción simulado).
// Uso: PW_MODULE=/ruta/a/node_modules node tests/e2e.mjs
import { createRequire } from 'node:module';
import http from 'node:http';
import { serve } from './serve.mjs';
const require = createRequire((process.env.PW_MODULE || process.cwd() + '/node_modules') + '/');
const { chromium } = require('playwright');

const results = [];
const check = (name, ok, extra = '') => { results.push([name, ok]); console.log(`${ok ? '✅' : '❌'} ${name} ${extra}`); };

// Transcripción simulada: devuelve texto con errores típicos para comprobar el corrector médico.
let lastPrompt = '';
const asr = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('latin1');
    lastPrompt = /Vocabulario médico[^\r]*/.exec(Buffer.concat(chunks).toString('utf8'))?.[0] || '';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ text: 'Control de presión arterial y levo dopa cada ocho horas. Paciente con parkinson.' + (body.length ? '' : '') }));
  });
}).listen(9099);

const server = await serve(8181);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
});
const ctx = await browser.newContext({ viewport: { width: 393, height: 800 }, hasTouch: true, isMobile: true, permissions: ['microphone'], serviceWorkers: 'allow' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
const pickOpt = async (filter, text) => { await page.click(`[data-filter=${filter}]`); await page.click(`.sheet .menu-item:has-text("${text}")`); await page.waitForTimeout(250); };
const shot = (n) => page.screenshot({ path: `${process.env.SHOTS || '/tmp'}/${n}.png` });

await page.goto('http://localhost:8181/');
await page.waitForFunction(() => window.__notas?.ready);
await page.waitForTimeout(600);
check('La app arranca (sin notas)', (await page.textContent('.hero')).includes('Bienvenido'));
await shot('01-home-vacio');
check('Ya no hay botón flotante', !(await page.$('#fab')) && !(await page.$('.fab')));
const navItems = await page.$$('#nav > *');
const rb = await page.locator('#nav-rec').boundingBox();
check('Menú inferior con 5 elementos y «Grabar» en el centro', navItems.length === 5 && Math.abs(rb.x + rb.width / 2 - 393 / 2) < 4, `x=${Math.round(rb.x + rb.width / 2)}`);

// Configurar servicio de transcripción
await page.click('[data-act=settings]');
await page.click('[data-adv=tx]');
await page.fill('#s-endpoint', 'http://localhost:9099/transcribe');
await page.click('[data-act=save-tx]');
await page.waitForTimeout(200);
check('Ajustes: motor servidor activo', (await page.textContent('#s-engine-note')).includes('Whisper'));
await page.goto('http://localhost:8181/#/');
await page.waitForTimeout(300);

// Grabar
await page.click('#nav-rec');
await page.waitForSelector('.rec-screen');
await page.waitForTimeout(2300);
const t = await page.textContent('#rec-time');
check('Grabando: temporizador avanza', t !== '0:00', t);
await shot('02-grabando');
await page.click('#rec-stop');
await page.waitForSelector('textarea.transcript, .transcript', { timeout: 8000 });
await page.waitForFunction(() => document.querySelector('.transcript')?.textContent.includes('levodopa'), null, { timeout: 8000 });
const txt = await page.textContent('.transcript');
check('Transcripción mostrada y corregida (levo dopa → levodopa, Parkinson)', txt.includes('levodopa') && txt.includes('Parkinson'), txt);
check('El vocabulario médico viaja como contexto (prompt)', /levodopa|carbidopa|metformina/.test(lastPrompt) || lastPrompt.length > 20, lastPrompt.slice(0, 80));
await page.waitForSelector('.player');
await shot('03-revision');

// Reproductor
await page.waitForSelector('[data-p=play]:not([disabled])');
await page.click('[data-p=play]');
await page.waitForTimeout(1600);
const playing = await page.evaluate(() => { const a = [...document.querySelectorAll('audio')]; return true; });
const curTime = await page.textContent('[data-p=cur]');
check('Reproductor: reproduce audio', curTime !== '0:00', curTime);
await page.click('[data-p=play]');

// Editar y guardar
await page.click('[data-act=edit]');
await page.fill('#txt', 'Control de presión arterial y levodopa cada ocho horas. Llamar al neurólogo.');
await page.click('[data-act=edit]');
check('Edición manual', (await page.textContent('.transcript')).includes('neurólogo'));
await page.click('#save-btn');
await page.waitForSelector('.card');
check('Nota guardada y visible en inicio', (await page.textContent('.card-title')).startsWith('Control de presión arterial'), await page.textContent('.card-title'));
await shot('04-home');

// Más notas para probar listas
const mk = async (text) => page.evaluate(async (text) => {
  const m = await import('/js/notes/notes.js');
  return (await m.create({ text, priority: 'low' })).id;
}, text);
const idB = await mk('Comprar metformina y ácido fólico en la farmacia');
const idC = await mk('Llamar al cardiólogo por la fibrilación auricular');
await page.evaluate(async (id) => { const m = await import('/js/notes/notes.js'); await m.setPriority(id, 'high'); }, idC);
await page.waitForTimeout(300);

// Búsqueda (en texto, no en título)
await page.goto('http://localhost:8181/#/search');
await page.fill('#q', 'levodopa');
await page.waitForTimeout(300);
check('Búsqueda por palabra del texto', (await page.$$('#results .card')).length === 1);
await page.fill('#q', 'dopa');
await page.waitForTimeout(300);
check('Búsqueda por subcadena', (await page.$$('#results .card')).length === 1);
await page.fill('#q', 'FIBRILACIÓN');
await page.waitForTimeout(300);
check('Búsqueda ignora mayúsculas y acentos', (await page.$$('#results .card')).length === 1);
await shot('05-busqueda');

// Favoritos, hecho, prioridad
await page.goto('http://localhost:8181/#/');
await page.waitForSelector('.card');
await page.click('.card [data-act=fav]');
await page.goto('http://localhost:8181/#/favorites');
await page.waitForSelector('.card');
const navBox = await page.locator('#nav').boundingBox();
const fbBox = await page.locator('.fbar').boundingBox();
check('Favoritos: los filtros quedan fijos abajo, justo sobre el menú', Math.abs(fbBox.y + fbBox.height - navBox.y) <= 2 && fbBox.y > 500, `fbar bottom=${Math.round(fbBox.y + fbBox.height)} nav top=${Math.round(navBox.y)}`);
await page.click('[data-filter=priority]');
const sheetBox = await page.locator('.sheet').boundingBox();
check('La lista de opciones se abre abajo', sheetBox.y + sheetBox.height >= 790);
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
check('Favoritos', (await page.$$('.card')).length === 1);
await page.click('.card [data-act=done]');
await page.waitForTimeout(200);
check('Marcar como realizada (se mantiene visible)', await page.$eval('.card', (c) => c.classList.contains('done')));
await page.waitForTimeout(200);
await page.click('.card [data-act=done]');
await page.waitForTimeout(200);
check('Volver a pendiente', await page.$eval('.card', (c) => !c.classList.contains('done')));

// Lista con orden por prioridad
await page.goto('http://localhost:8181/#/notes');
await pickOpt('sort', 'Prioridad');
const first = await page.textContent('.card .card-title');
check('Orden por prioridad: Alta primero', first.includes('cardiólogo'), first);
await shot('06-lista-prioridad');

// Abrir nota, swipe
await page.click('.card');
await page.waitForSelector('.note-title');
const title0 = await page.textContent('.note-title');
await shot('07-nota');
const box = await page.locator('#reader').boundingBox();
const swipe = async (dx) => {
  await page.mouse.move(box.x + box.width / 2, box.y + 120);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx / 2, box.y + 124, { steps: 4 });
  await page.mouse.move(box.x + box.width / 2 + dx, box.y + 126, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(500);
};
await swipe(-150);
const title1 = await page.textContent('.note-title');
check('Deslizar izquierda → siguiente nota', title1 !== title0, `${title0} → ${title1}`);
await swipe(150);
check('Deslizar derecha → nota anterior', (await page.textContent('.note-title')) === title0);

// Prioridad en nota
await page.click('[data-prio=medium]');
await page.waitForTimeout(200);
check('Cambiar prioridad', await page.$eval('[data-prio=medium]', (b) => b.getAttribute('aria-pressed') === 'true'));
// Estado
await page.click('.status-toggle');
await page.waitForTimeout(250);
check('Estado realizada en la nota', (await page.textContent('.status-toggle')).includes('Realizada'));
// Pantalla completa
await page.click('[data-act=fs]');
check('Modo lectura / pantalla completa', !!(await page.$('.reader-full')));
await shot('08-pantalla-completa');
await page.click('.reader-full [data-act=fs]');

// Recordatorio
await page.click('[data-act=reminder]');
await page.waitForSelector('#rem-at');
const tomorrow = new Date(Date.now() + 86400000); tomorrow.setHours(9, 0, 0, 0);
const pad = (n) => String(n).padStart(2, '0');
await page.fill('#rem-at', `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T09:00`);
await page.click('[data-ok]');
await page.waitForSelector('.reminder-row');
check('Recordatorio creado', true);
await shot('09-recordatorio');
await page.click('[data-act=rm-reminder]');
await page.waitForTimeout(200);
check('Recordatorio eliminado', !(await page.$('.reminder-row')));
await page.click('[data-act=reminder]');
await page.fill('#rem-at', `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T09:00`);
await page.click('[data-ok]');
await page.waitForSelector('.reminder-row');

// Calendario
await page.goto('http://localhost:8181/#/calendar');
await page.waitForSelector('.cal-cell');
check('Calendario: días con notas marcados', (await page.$$('.cal-cell .ev')).length >= 2);
const todayKey = new Date(); const tk = `${todayKey.getFullYear()}-${pad(todayKey.getMonth() + 1)}-${pad(todayKey.getDate())}`;
await page.click('[data-act=today]');
await page.click(`.cal-cell[data-day="${tk}"]`);
check('Calendario: lista del día seleccionado', (await page.$$('.agenda-item')).length >= 2);

// Calendario v2: semana, títulos, alta rápida, filtros, deslizar
await page.goto('http://localhost:8181/#/calendar');
await page.waitForSelector('.cal-cell');
await page.click('[data-act=today]');
check('Calendario mensual muestra títulos en las celdas', (await page.$$('.cal-cell .ev')).length >= 2);
await pickOpt('mode', 'Semana');
await page.waitForSelector('.day');
check('Vista semanal: 7 días con títulos', (await page.$$('.day')).length === 7 && (await page.$$('.day .agenda-item')).length >= 2);
await shot('10b-semana');
await pickOpt('mode', 'Mes');
await page.click(`.cal-cell[data-day="${tk}"]`);
await page.click(`.day [data-add=reminder]`);
await page.fill('#qa-title', 'Llamar al médico');
await page.click('.dialog [data-ok]');
await page.waitForTimeout(300);
check('Crear recordatorio desde un día', (await page.textContent('.day')).includes('Llamar al médico'));
await page.click(`.day [data-add=note]`);
await page.fill('#qa-title', 'Nota creada en el calendario');
await page.click('.dialog [data-prio=high]');
await page.click('.dialog [data-ok]');
await page.waitForTimeout(300);
check('Crear nota desde un día', (await page.textContent('.day')).includes('Nota creada en el calendario'));
const before2 = (await page.$$('.day .agenda-item')).length;
await pickOpt('priority', 'Alta');
await page.waitForTimeout(150);
const afterHigh = (await page.$$('.day .agenda-item')).length;
check('Filtro por prioridad en el calendario', afterHigh >= 1 && afterHigh < before2, `${before2} → ${afterHigh}`);
await page.click('[data-filter-clear]');
await pickOpt('status', 'Realizadas');
await page.waitForTimeout(150);
check('Filtro por estado en el calendario', (await page.$$('.day .agenda-item')).length < before2);
await pickOpt('status', 'Todas');
const m0 = await page.textContent('.cal-head h2');
const cb = await page.locator('.cal-body').boundingBox();
const cswipe = async (dx) => { await page.mouse.move(cb.x + 200, cb.y + 40); await page.mouse.down(); await page.mouse.move(cb.x + 200 + dx / 2, cb.y + 44, { steps: 4 }); await page.mouse.move(cb.x + 200 + dx, cb.y + 46, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(350); };
await cswipe(-150);
const m1 = await page.textContent('.cal-head h2');
check('Deslizar izquierda → mes siguiente', m1 !== m0, `${m0} → ${m1}`);
await cswipe(150);
check('Deslizar derecha → mes anterior', (await page.textContent('.cal-head h2')) === m0);
await shot('10c-mes-titulos');
await page.click('[data-act=today]');

// Selección múltiple
await page.goto('http://localhost:8181/#/notes');
await page.waitForSelector('.card');
const c0 = page.locator('.card').first();
const b = await c0.boundingBox();
await page.mouse.move(b.x + b.width / 2, b.y + 40);
await page.mouse.down(); await page.waitForTimeout(650); await page.mouse.up();
check('Selección múltiple (pulsación larga)', !(await page.$('#selbar[hidden]')));
await page.click('.card >> nth=1');
const countTxt = await page.textContent('#selbar h1');
check('Selección múltiple: contador', countTxt.startsWith('2'), countTxt);
await shot('11-seleccion');
await page.click('[data-s=prio]'); await page.click('.menu-item >> nth=2');
await page.waitForTimeout(250);
check('Cambiar prioridad en lote', (await page.$$('.card .p-low')).length >= 2);
// Compartir (sin Web Share API en headless → portapapeles/alternativa)
await page.evaluate(() => { window.__shared = null; navigator.share = async (d) => { window.__shared = d; }; });
await page.mouse.move(b.x + b.width / 2, b.y + 40);
await page.mouse.down(); await page.waitForTimeout(650); await page.mouse.up();
await page.click('.card >> nth=1');
await page.click('[data-s=share]');
await page.click('.dialog [data-ok]');
await page.waitForTimeout(300);
const shared = await page.evaluate(() => window.__shared);
check('Compartir varias notas (Web Share API)', shared?.text?.includes('Prioridad') && shared.text.includes('Estado'), (shared?.text || '').slice(0, 60));
await page.evaluate(() => document.querySelector('#selbar [data-s=close]')?.click());

// Eliminar con confirmación + papelera
await page.goto('http://localhost:8181/#/notes');
await page.waitForSelector('.card');
const before = (await page.$$('.card')).length;
await page.click('.card');
await page.waitForSelector('.note-title');
await page.click('[data-act=more]');
await page.click('.menu-item.danger');
const dlg = await page.textContent('.dialog h2');
check('Confirmación de eliminación', dlg.includes('¿Quieres eliminar esta nota?'), dlg);
await shot('12-confirmar');
await page.click('.dialog [data-r="1"]');
await page.waitForTimeout(500);
await page.goto('http://localhost:8181/#/trash');
check('Nota en papelera', (await page.$$('.card')).length === 1);
await page.click('[data-act=restore]');
await page.goto('http://localhost:8181/#/notes');
await page.waitForSelector('.card');
check('Restaurar desde papelera', (await page.$$('.card')).length === before);

// Persistencia tras recargar
await page.reload();
await page.waitForFunction(() => window.__notas?.ready);
check('Persistencia tras recargar', (await page.evaluate(() => window.__notas.count())) === before);
// Audio persistido
const hasAudio = await page.evaluate(async () => { const m = await import('/js/notes/notes.js'); const n = m.active().find((x) => x.hasAudio); const a = n && await m.getAudio(n.id); return !!a?.blob?.size; });
check('Audio guardado con la nota', hasAudio);

// PWA
const pwa = await page.evaluate(async () => {
  const mf = await (await fetch('/manifest.webmanifest')).json();
  const reg = await navigator.serviceWorker.ready;
  return { display: mf.display, icons: mf.icons.length, sw: !!reg.active };
});
check('PWA: manifest standalone + iconos + service worker activo', pwa.display === 'standalone' && pwa.icons >= 3 && pwa.sw, JSON.stringify(pwa));

// Offline
await page.waitForTimeout(800);
await ctx.setOffline(true);
await page.reload();
await page.waitForFunction(() => window.__notas?.ready, null, { timeout: 8000 });
check('Funciona sin conexión (recarga offline)', (await page.evaluate(() => window.__notas.count())) === before);
// Nota sin conexión
await page.evaluate(() => { location.hash = '#/'; });
await page.waitForSelector('#nav-rec', { state: 'visible' });
await page.click('#nav-rec');
await page.waitForSelector('.rec-screen');
await page.waitForTimeout(1200);
await page.click('#rec-stop');
await page.waitForSelector('.note-info');
check('Offline: se indica que la transcripción queda pendiente', (await page.textContent('.note-info')).includes('Sin conexión'));
await page.click('#save-btn');
await page.waitForSelector('.card');
await ctx.setOffline(false);
await page.evaluate(() => window.dispatchEvent(new Event('online')));
await page.waitForFunction(() => [...document.querySelectorAll('.badge.pending')].length === 0, null, { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(800);
const queued = await page.evaluate(async () => { const m = await import('/js/notes/notes.js'); return m.active().filter((n) => n.transcriptStatus === 'pending').length; });
check('Al volver la conexión se transcriben las notas pendientes', queued === 0);

// Datos de ejemplo
await page.goto('http://localhost:8181/#/settings');
await page.click('[data-fold=set-al]');
await page.click('[data-act=demo]');
await page.waitForTimeout(600);
check('Cargar notas de ejemplo', (await page.evaluate(() => window.__notas.count())) >= before + 10);
await page.click('[data-act=demo-clear]');
await page.waitForTimeout(400);

// Avisos push gratuitos con ntfy (servidor simulado)
const ntfyCalls = [];
await ctx.route('https://ntfy.sh/**', async (r) => {
  const q = r.request();
  ntfyCalls.push({ method: q.method(), url: q.url(), h: q.headers(), body: q.postData() || '' });
  await r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }, body: '{}' });
});
await page.goto('http://localhost:8181/#/settings');
await page.waitForSelector('[data-act-sw=ntfy]');
await page.click('[data-act-sw=ntfy]');
await page.waitForSelector('[data-act=ntfy-test]');
const topic = await page.evaluate(async () => (await import('/js/settings/settings.js')).getSetting('ntfyTopic'));
check('ntfy: se crea un tema privado aleatorio', /^notas-[a-z0-9]{12,}$/.test(topic), topic);
check('ntfy: ofrece abrir la app ntfy suscrita al tema', (await page.getAttribute('a[href^="ntfy://"]', 'href')).endsWith('/' + topic));
await page.click('[data-act=ntfy-test]');
await page.waitForTimeout(300);
check('ntfy: aviso de prueba enviado al tema', ntfyCalls.some((c) => c.method === 'POST' && c.url === `https://ntfy.sh/${topic}`));
const nid = await page.evaluate(async () => { const m = await import('/js/notes/notes.js'); return (await m.create({ title: 'Control con el neurólogo', text: 'texto médico privado' })).id; });
const setRem = async (ms) => page.evaluate(async ({ nid, ms }) => {
  const m = await import('/js/notes/notes.js'); const r = await import('/js/reminders/service.js');
  return r.setReminder(m.get(nid), ms);
}, { nid, ms });
const at2h = Date.now() + 2 * 3600e3;
const res2h = await setRem(at2h);
const sched = ntfyCalls.find((c) => c.method === 'POST' && c.h.delay);
check('ntfy: programa el aviso con la hora exacta (Delay)', Number(sched?.h.delay) === Math.floor(at2h / 1000), sched?.h.delay);
check('ntfy: por privacidad no envía el título ni el texto', sched && !JSON.stringify(sched).includes('neurólogo') && !JSON.stringify(sched).includes('privado') && sched.h.title === 'Tienes un recordatorio');
check('ntfy: el aviso abre la nota (Click)', sched?.h.click?.includes(`#/note/${nid}`));
check('El aviso confirma «aviso push programado»', res2h.push === true);
const before5 = ntfyCalls.length;
const at5d = Date.now() + 5 * 86400e3;
const res5d = await setRem(at5d);
check('ntfy: un recordatorio a más de 3 días no se programa aún', ntfyCalls.length === before5 && res5d.push === false);
// al acercarse (ventana de 3 días) se programa al abrir la app
await page.evaluate(async ({ nid }) => {
  const rem = await import('/js/reminders/reminders.js'); const svc = await import('/js/reminders/service.js'); const m = await import('/js/notes/notes.js');
  const r = await rem.getReminder(nid); await rem.saveReminder({ ...r, at: Date.now() + 86400e3, ntfyAt: null });
  await svc.scheduleDueNtfy(m.get);
}, { nid });
check('ntfy: los recordatorios que entran en la ventana se programan solos', ntfyCalls.slice(before5).some((c) => c.method === 'POST' && c.h.click?.includes(`#/note/${nid}`)));
await page.evaluate(async ({ nid }) => { const m = await import('/js/notes/notes.js'); const r = await import('/js/reminders/service.js'); await r.clearReminder(m.get(nid)); }, { nid });
await page.waitForTimeout(300);
check('ntfy: al borrar el recordatorio se intenta cancelar el aviso', ntfyCalls.some((c) => c.method === 'DELETE' && c.url.startsWith(`https://ntfy.sh/${topic}/`)));
// Diálogo: «Calendario del teléfono»
await page.evaluate(async ({ nid }) => { await import('/js/settings/settings.js').then((s) => s.setSetting('ntfyOn', false)); }, { nid });
await page.goto(`http://localhost:8181/#/note/${nid}`);
await page.waitForSelector('[data-act=reminder]');
await page.click('[data-act=reminder]');
await page.waitForSelector('[data-cal]');
check('El recordatorio ofrece «Calendario del teléfono» y .ics', (await page.textContent('[data-cal]')).includes('Calendario del teléfono') && !!(await page.$('[data-ics]')));
const calHref = await page.evaluate(() => { const a = document.querySelector('[data-cal]'); a.addEventListener('click', (e) => e.preventDefault(), { once: true }); a.click(); return a.href; });
check('El enlace abre Google Calendar con el evento y la hora', calHref.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE') && /dates=\d{8}T\d{6}Z/.test(calHref), calHref.slice(0, 90));
await page.click('[data-cancel]');

// Modo oscuro
await page.emulateMedia({ colorScheme: 'dark' });
await page.goto('http://localhost:8181/#/');
await page.waitForTimeout(400);
await shot('13-oscuro');
check('Tema oscuro', await page.evaluate(() => getComputedStyle(document.body).backgroundColor) === 'rgb(14, 21, 20)');

check('Sin errores en consola', errors.length === 0, errors.join(' | '));
await browser.close(); server.close(); asr.close();
const failed = results.filter((r) => !r[1]).length;
console.log(`\n${results.length - failed}/${results.length} comprobaciones OK`);
process.exit(failed ? 1 : 0);
