// E2E: transcripción gratuita en el dispositivo (motor Whisper simulado), "Añadir al diccionario" y Google Calendar/Tasks (API simulada).
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';
const require = createRequire((process.env.PW_MODULE || process.cwd() + '/node_modules') + '/');
const { chromium } = require('playwright');
const results = [];
const check = (name, ok, extra = '') => { results.push([name, ok]); console.log(`${ok ? '✅' : '❌'} ${name} ${extra}`); };

const server = await serve(8282);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
const ctx = await browser.newContext({ viewport: { width: 393, height: 800 }, hasTouch: true, isMobile: true, permissions: ['microphone'], serviceWorkers: 'block' });
const errors = [];
const gcalls = [];

// Motor Whisper simulado (la librería real y el modelo se descargan de Internet en el teléfono).
await ctx.route('https://cdn.jsdelivr.net/**', (r) => r.fulfill({
  status: 200, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' },
  body: `export const env = {};
    export async function pipeline(task, model, opts) {
      for (const l of [20, 60, 100]) { opts.progress_callback?.({ status: 'progress', file: 'm.onnx', loaded: l, total: 100 }); await new Promise((r) => setTimeout(r, 120)); }
      return async (audio, o) => ({ text: 'Control de presion arterial, levo dopa cada ocho horas. Paciente con parkinson y atorbastatina. [' + model + ' ' + o.language + ' ' + (audio.length > 8000) + ']' });
    }` }));
// Google simulado
await ctx.route(/googleapis\.com/, async (r) => {
  const req = r.request();
  gcalls.push({ method: req.method(), url: req.url(), body: req.postData() ? JSON.parse(req.postData()) : null, auth: req.headers().authorization });
  await r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }, body: JSON.stringify({ id: req.url().includes('calendar') ? 'ev1' : 'tk1' }) });
});
await ctx.addInitScript(() => {
  window.google = { accounts: { oauth2: {
    initTokenClient: (cfg) => ({ requestAccessToken: () => setTimeout(() => cfg.callback({ access_token: 'tok-123', expires_in: '3600' }), 30) }),
    revoke: () => {},
  } } };
});
const page = await ctx.newPage();
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
const shot = (n) => page.screenshot({ path: `${process.env.SHOTS || '/tmp'}/${n}.png` });

await page.goto('http://localhost:8282/');
await page.waitForFunction(() => window.__notas?.ready);
await page.waitForTimeout(400);

// 1) Motor gratuito: descarga única con progreso
check('Inicio ofrece descargar el motor gratuito', (await page.textContent('.banner')).includes('descarga'));
page.on('console', (m) => console.log('  [console]', m.text()));
await page.click('[data-act=asr]');
await page.waitForFunction(() => !document.querySelector('[data-act=asr]') && !document.querySelector('.banner .spinner'), null, { timeout: 8000 });
check('Descarga del motor completada (el aviso desaparece)', !(await page.$('[data-act=asr]')));

// 2) Grabar → transcribe en el teléfono
await page.click('#fab');
await page.waitForSelector('.rec-screen');
await page.waitForTimeout(1800);
await page.click('#rec-stop');
await page.waitForFunction(() => document.querySelector('.transcript')?.textContent.includes('levodopa'), null, { timeout: 10000 });
const txt = await page.textContent('.transcript');
check('Transcribe sin servidor ni cuentas (motor local)', txt.includes('whisper-base') && txt.includes('spanish') && txt.includes('true'), txt.slice(-60));
check('Corrección médica sobre la transcripción local', txt.includes('presión') && txt.includes('levodopa') && txt.includes('Parkinson') && txt.includes('atorvastatina'), txt.slice(0, 80));
await shot('20-local');

// 3) Añadir al diccionario seleccionando una palabra
await page.evaluate(() => {
  const el = document.querySelector('.transcript'); const node = el.firstChild; const w = 'cada ocho';
  const i = node.textContent.indexOf(w); const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + w.length);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
});
await page.waitForSelector('.dict-chip:not([hidden])', { timeout: 3000 });
check('Al seleccionar texto aparece «Añadir al diccionario»', (await page.textContent('.dict-chip')).includes('Añadir'));
await shot('21-dict-chip');
await page.click('.dict-chip');
await page.waitForSelector('#td-term');
await page.fill('#td-term', 'cada 8 horas');
check('El diálogo ofrece corregir siempre', !(await page.$eval('#td-fix', (e) => e.hidden)));
await page.click('.dialog [data-ok]');
await page.waitForTimeout(400);
const terms = await page.evaluate(async () => (await import('/js/settings/settings.js')).getSetting('customTerms'));
check('Término guardado en el diccionario personal', terms.includes('cada ocho=cada 8 horas'), terms);
check('Se aplica en el texto actual', (await page.textContent('.transcript')).includes('cada 8 horas'));
await page.click('#save-btn');
await page.waitForSelector('.card');



// 4) Google: conectar desde el propio diálogo del recordatorio y crear evento + tarea
await page.evaluate(async () => { await (await import('/js/settings/settings.js')).setSetting('googleClientId', 'test.apps.googleusercontent.com'); });
await page.click('.card');
await page.waitForSelector('.note-title');
await page.click('[data-act=reminder]');
await page.waitForSelector('[data-connect]');
check('El recordatorio ofrece «Conectar con Google» sin ir a Ajustes', true);
await page.click('[data-connect]');
await page.waitForFunction(() => !document.querySelector('[data-connect]'));
const d = new Date(Date.now() + 86400000); d.setHours(10, 30, 0, 0);
const p2 = (n) => String(n).padStart(2, '0');
await page.fill('#rem-at', `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T10:30`);
await page.click('[data-ok]');
await page.waitForSelector('.reminder-row');
await page.waitForTimeout(400);
const ev = gcalls.find((c) => c.method === 'POST' && c.url.includes('/calendar/'));
const tk = gcalls.find((c) => c.method === 'POST' && c.url.includes('/tasks/'));
check('Crea evento en Google Calendar con hora exacta y aviso', ev?.body?.start?.dateTime === d.toISOString() && ev.body.reminders?.overrides?.[0]?.minutes === 0 && ev.auth === 'Bearer tok-123', JSON.stringify(ev?.body?.start));
check('Crea tarea en Google Tasks', !!tk?.body?.title);
check('El evento no incluye el texto clínico', !JSON.stringify(ev?.body).includes('atorvastatina'));
check('Muestra que está sincronizado', (await page.textContent('.reminder-row')).includes('Sincronizado'));
await page.click('[data-act=rm-reminder]');
await page.waitForTimeout(400);
check('Eliminar recordatorio borra evento y tarea', gcalls.some((c) => c.method === 'DELETE' && c.url.includes('/calendar/')) && gcalls.some((c) => c.method === 'DELETE' && c.url.includes('/tasks/')));

// 5) Ajustes simples
await page.goto('http://localhost:8282/#/settings');
await page.waitForSelector('#asr-status');
check('Ajustes: estado del motor claro', (await page.textContent('#asr-status')).includes('lista'));
check('Ajustes: Google conectado con interruptores', !!(await page.$('[data-sw=googleCalendarSync]')));
await shot('22-ajustes');
await page.click('[data-pick=model]');
await page.waitForSelector('.sheet .menu-item');
await page.click('.sheet .menu-item:has-text("Alta precisión")');
await page.waitForTimeout(300);
check('Ajustes: el selector de calidad se despliega y cambia', (await page.textContent('[data-pick=model]')).includes('Alta precisión'));
await page.click('[data-adv=tx]');
await page.click('[data-pick=engine]');
await page.click('.sheet .menu-item >> nth=2');
await page.waitForTimeout(300);
check('Ajustes: opciones avanzadas se despliegan y el motor cambia', (await page.textContent('[data-pick=engine]')).includes('Nube'));
await page.click('[data-pick=lang]');
await page.click('.sheet .menu-item >> nth=1');
await page.waitForTimeout(300);
check('Ajustes: el idioma cambia', (await page.textContent('[data-pick=lang]')).includes('México'));
await shot('23-selector');

// 6) Groq (gratis): clave pegada en Ajustes -> Whisper grande con vocabulario médico
const groqReqs = [];
let slow = false;
await ctx.route('https://api.groq.com/**', async (r) => {
  const req = r.request();
  if (slow && req.url().includes('audio/transcriptions')) await new Promise((r) => setTimeout(r, 1800));
  groqReqs.push({ url: req.url(), auth: req.headers().authorization, body: req.postData() || '' });
  await r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: JSON.stringify(req.url().includes('/models') ? { data: [] } : { text: 'Paciente con levo dopa y presion arterial alta' }) });
});
await page.evaluate(() => window.scrollTo(0, 0));
await page.fill('#s-groq', 'gsk_test_123');
await page.click('[data-act=save-groq]');
await page.waitForTimeout(600);
check('Groq: se comprueba la clave', groqReqs.some((q) => q.url.includes('/models') && q.auth === 'Bearer gsk_test_123'));
await page.goto('http://localhost:8282/#/');
await page.waitForTimeout(300);
await page.click('#fab');
await page.waitForSelector('.rec-screen');
await page.waitForTimeout(1500);
await page.click('#rec-stop');
await page.waitForFunction(() => document.querySelector('.transcript')?.textContent.includes('levodopa'), null, { timeout: 8000 });
const gq = groqReqs.find((q) => q.url.includes('audio/transcriptions'));
check('Groq: transcribe con Whisper grande y corrección médica', !!gq && gq.body.includes('whisper-large-v3') && /Vocabulario m/.test(gq.body) && (await page.textContent('.transcript')).includes('presión'), (await page.textContent('.transcript')).slice(0, 60));
check('Groq: la clave solo viaja a Groq', gq.auth === 'Bearer gsk_test_123');
await page.click('#save-btn');
await page.waitForSelector('.card');

// 7) Guardar mientras aún transcribe: la nota se completa sola al terminar
slow = true;
await page.click('#fab');
await page.waitForSelector('.rec-screen');
await page.waitForTimeout(1200);
await page.click('#rec-stop');
await page.waitForSelector('#prog');
await page.click('#save-btn');
await page.waitForSelector('.card');
const midStatus = await page.evaluate(async () => { const m = await import('/js/notes/notes.js'); return m.active().sort(m.byRecent)[0].transcriptStatus; });
check('Guardar durante la transcripción deja la nota «procesando»', midStatus === 'processing', midStatus);
await page.waitForFunction(async () => { const m = await import('/js/notes/notes.js'); const n = m.active().sort(m.byRecent)[0]; return n.transcriptStatus === 'done' && n.text.includes('levodopa'); }, null, { timeout: 8000 });
check('La nota se completa sola cuando termina la transcripción', true);
slow = false;

// 8) Opciones al guardar: prioridad, estado, favorita y recordatorio desde la pantalla de revisión
await page.goto('http://localhost:8282/#/');
await page.waitForTimeout(300);
await page.click('#fab');
await page.waitForSelector('.rec-screen');
await page.waitForTimeout(1200);
await page.click('#rec-stop');
await page.waitForFunction(() => document.querySelector('.transcript')?.textContent.includes('levodopa'), null, { timeout: 8000 });
check('Revisión muestra estado, prioridad y recordatorio antes de guardar', !!(await page.$('[data-act=opt-done]')) && !!(await page.$('[data-prio=high]')) && !!(await page.$('[data-act=opt-reminder]')));
await shot('24-revision-opciones');
await page.click('[data-prio=high]');
await page.click('[data-act=opt-done]');
await page.click('[data-act=opt-fav]');
await page.click('[data-act=opt-reminder]');
await page.waitForSelector('#rem-at');
const d8 = new Date(Date.now() + 2 * 86400000); d8.setHours(8, 15, 0, 0);
await page.fill('#rem-at', `${d8.getFullYear()}-${p2(d8.getMonth() + 1)}-${p2(d8.getDate())}T08:15`);
await page.click('[data-ok]');
await page.waitForSelector('.reminder-row');
check('El recordatorio queda marcado en la revisión', (await page.textContent('.reminder-row')).includes('08:15'));
await page.click('#save-btn');
await page.waitForSelector('.card');
await page.waitForTimeout(600);
const saved = await page.evaluate(async () => { const m = await import('/js/notes/notes.js'); const n = m.active().sort(m.byRecent)[0]; return { p: n.priority, done: n.done, fav: n.favorite, rem: n.reminder?.at, eventId: n.reminder?.eventId }; });
check('Se guarda con prioridad alta, realizada y favorita', saved.p === 'high' && saved.done === true && saved.fav === true, JSON.stringify(saved));
check('Se guarda con su recordatorio (y evento de Google)', saved.rem === d8.getTime() && saved.eventId === 'ev1', JSON.stringify(saved));

check('Sin errores en consola', errors.length === 0, errors.join(' | '));
await browser.close(); server.close();
const failed = results.filter((r) => !r[1]).length;
console.log(`\n${results.length - failed}/${results.length} comprobaciones OK`);
process.exit(failed ? 1 : 0);
