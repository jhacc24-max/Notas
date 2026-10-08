import { appBar } from '../components.js';
import { allSettings, setSetting } from '../../settings/settings.js';
import { termCount } from '../../medical/dictionary.js';
import { getToken, disconnect, wasConnected, googleConfigured } from '../../google/oauth.js';
import { requestNotificationPermission } from '../../reminders/reminders.js';
import { storageEstimate, requestPersistence } from '../../storage/db.js';
import { installAvailable, promptInstall, isStandalone } from '../install.js';
import { resolveEngine, processQueue, modelKey } from '../../transcription/index.js';
import { modelReady, prepareModel, downloadState, MODELS } from '../../transcription/local.js';
import { on } from '../../core/events.js';
import { queueApi } from '../../app-services.js';
import { toast, menuSheet } from '../dialogs.js';
import { foldHead, foldBodyStart, bindFolds } from '../fold.js';
import { enableNtfy, sendTestNtfy, subscribeLink } from '../../reminders/ntfy.js';

const foldOpen = (id, title, def) => `<section class="settings-group fold">${foldHead(id, title, { def })}${foldBodyStart(id, def)}`;
const foldClose = () => '</div></section>';
import { loadDemo, clearDemo, demoIds } from '../../notes/demo.js';
import { navigate } from '../router.js';
import { esc } from '../../core/util.js';
import { icon } from '../../core/icons.js';

const LANGS = [['es-ES', 'España'], ['es-MX', 'México'], ['es-AR', 'Argentina'], ['es-CO', 'Colombia'], ['es-CL', 'Chile'], ['es-PE', 'Perú'], ['es-US', 'Estados Unidos'], ['es-VE', 'Venezuela']];
const ENGINE_NAMES = { local: 'En tu teléfono (Whisper, gratis)', whisper: 'Whisper grande en la nube (Groq o tu servidor, con vocabulario médico)', webspeech: 'Navegador (en vivo)', none: 'Ninguno disponible' };
function asrStatus() {
  const e = resolveEngine();
  if (e === 'whisper') return `✅ <b>${ENGINE_NAMES.whisper}</b> activo. Si falla o no hay Internet, se usa el motor del teléfono.`;
  if (e !== 'local') return `Motor activo: <b>${ENGINE_NAMES[e]}</b>.`;
  if (downloadState.busy) return `<span class="spinner" style="display:inline-block;vertical-align:middle"></span> Descargando el motor de voz… <b>${downloadState.pct}%</b>`;
  if (modelReady(modelKey())) return '✅ <b>Transcripción gratuita lista</b>. Funciona sin conexión y el audio no sale de tu teléfono.';
  return `Transcripción gratuita en tu teléfono. Falta descargar el motor una vez (~${MODELS[modelKey()].mb} MB, mejor con Wi-Fi). ${downloadState.error ? '<br>Error: ' + esc(downloadState.error) : ''}<br><button class="btn filled" data-act="asr-dl" style="margin-top:8px">Descargar ahora</button>`;
}
const ENGINE_CHOICES = { auto: 'Automático (recomendado)', local: 'En el teléfono (gratis)', whisper: 'Nube: Groq o mi servidor', webspeech: 'Navegador en vivo (experimental)' };
function pickField(id, label, value, hint = '', hintId = '') {
  return `<div class="field"><label id="pl-${id}">${esc(label)}</label>
    <button class="select-btn" data-pick="${id}" aria-haspopup="listbox" aria-labelledby="pl-${id}"><span>${esc(value)}</span>${icon('down')}</button>
    ${hint ? `<small ${hintId ? `id="${hintId}"` : ''}>${esc(hint)}</small>` : ''}</div>`;
}
const THEMES = { system: 'Igual que el teléfono', light: 'Claro', dark: 'Oscuro' };
const adv = { tx: false, g: false }; // secciones avanzadas abiertas
const mb = (n) => (n / 1048576).toFixed(1) + ' MB';

export default {
  nav: false,
  mount(root) {
    const render = async () => {
      const s = allSettings();
      const est = await storageEstimate();
      const notif = typeof Notification === 'undefined' ? 'no disponible' : Notification.permission;
      root.innerHTML = `
        ${appBar({ title: 'Ajustes', back: true })}
        ${foldOpen('set-ap', 'Apariencia', false)}
          ${pickField('theme', 'Tema', THEMES[s.theme] ?? 'Sistema')}
        ${foldClose()}

        ${foldOpen('set-tx', 'Transcripción', true)}
          <div class="note-info" id="asr-status">${asrStatus()}</div>
          <div class="note-info"><b>Opción rápida y más precisa (gratis)</b><br>
            Con una clave gratuita de Groq, la transcripción usa Whisper grande: tarda segundos y entiende mejor los términos médicos.
            El audio se envía a Groq solo para transcribir.<br>
            1) Entra a <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a> · 2) «Create API Key» · 3) Pégala aquí.</div>
          <div class="field"><label for="s-groq">Clave de Groq</label>
            <input id="s-groq" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="gsk_…" value="${esc(s.groqKey)}"></div>
          <div style="padding:8px 16px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn filled" data-act="save-groq">Guardar y probar</button>${s.groqKey ? '<button class="btn outlined" data-act="rm-groq">Quitar clave</button>' : ''}</div>
          ${pickField('model', 'Calidad del motor gratuito', `${MODELS[modelKey()].label} (~${MODELS[modelKey()].mb} MB)${modelReady(modelKey()) ? ' · descargado' : ''}`, '«Alta precisión» reconoce mejor los términos médicos pero tarda más y ocupa más.')}
          ${pickField('lang', 'Idioma / variante', `Español (${LANGS.find(([c]) => c === s.language)?.[1] ?? s.language})`)}
          <button class="adv-toggle" data-adv="tx" aria-expanded="${adv.tx}">Opciones avanzadas ${icon(adv.tx ? 'left' : 'right')}</button>
          <div class="adv-body" ${adv.tx ? '' : 'hidden'}>
            ${pickField('engine', 'Motor', ENGINE_CHOICES[s.engine] ?? 'Automático', `En uso ahora: ${ENGINE_NAMES[resolveEngine()]}`, 's-engine-note')}
            <div class="field"><label for="s-endpoint">URL de tu servidor de transcripción (opcional)</label>
              <input id="s-endpoint" type="url" inputmode="url" placeholder="https://tu-proxy.workers.dev" value="${esc(s.transcriptionEndpoint)}">
              <small>Ver carpeta <b>server/</b>. Permite Whisper grande con vocabulario médico como contexto.</small></div>
            <div class="field"><label for="s-token">Token de acceso a tu servidor</label>
              <input id="s-token" type="password" autocomplete="off" value="${esc(s.transcriptionToken)}"></div>
            <div style="padding:8px 16px"><button class="btn tonal" data-act="save-tx">Guardar</button></div>
          </div>
        ${foldClose()}

        ${foldOpen('set-dic', `Diccionario médico (${termCount()} términos base + los tuyos)`, false)}
          <div class="field"><label for="s-terms">Tus términos (uno por línea)</label>
            <textarea id="s-terms" rows="6" spellcheck="false" placeholder="Ejemplo:&#10;Madopar&#10;sinemet=Sinemet&#10;rotigotina">${esc(s.customTerms)}</textarea>
            <small>Se envían como contexto al motor de transcripción. Con <b>alias=Término</b> también corriges errores habituales.</small></div>
          <div style="padding:8px 16px"><button class="btn tonal" data-act="save-terms">Guardar diccionario</button></div>
        ${foldClose()}

        ${foldOpen('set-av', 'Recordatorios y avisos', true)}
          <p class="note-info"><b>Tres formas de que te avise, todas gratis y sin cuentas técnicas:</b><br>
            1) <b>Dentro de la app</b> (siempre, con la app abierta).<br>
            2) <b>Calendario del teléfono</b>: al crear un recordatorio, toca «📅 Calendario del teléfono» y guárdalo. Tu calendario avisa con la app cerrada.<br>
            3) <b>Avisos push con ntfy</b> (abajo): automático, a la hora exacta, con la app cerrada.</p>
          <div style="padding:0 16px"><button class="btn tonal" data-act="notif">${icon('bell')} Notificaciones de la app: ${notif}</button></div>
          <label class="switch-row"><span class="grow">Avisos push con ntfy<small>Gratis, sin registrarte</small></span>
            <input class="switch" type="checkbox" data-act-sw="ntfy" ${s.ntfyOn ? 'checked' : ''}></label>
          ${s.ntfyOn && s.ntfyTopic ? `
            <div class="note-info">
              <b>Para activarlo (una vez):</b><br>
              1. Instala la app gratuita <b>ntfy</b> desde Google Play (o F-Droid).<br>
              2. Pulsa el botón de abajo: se abrirá ntfy y te suscribirá a tu tema privado <code class="selectable">${esc(s.ntfyTopic)}</code>.<br>
              3. Pulsa «Enviar aviso de prueba».<br>
              <small>Si el botón no abre ntfy: en ntfy toca «+» y escribe el tema exacto.</small></div>
            <div style="padding:0 16px;display:flex;gap:8px;flex-wrap:wrap">
              <a class="btn filled" href="${esc(subscribeLink())}">Abrir ntfy y suscribirme</a>
              <button class="btn tonal" data-act="ntfy-test">Enviar aviso de prueba</button>
              <button class="btn outlined" data-act="ntfy-copy">Copiar tema</button></div>
            <label class="switch-row"><span class="grow">Mostrar el título de la nota en el aviso<small>Desactivado: solo dice «Tienes un recordatorio» (más privado)</small></span>
              <input class="switch" type="checkbox" data-sw="ntfyShowTitle" ${s.ntfyShowTitle ? 'checked' : ''}></label>
            <p class="note-info">ntfy programa cada aviso con hasta <b>3 días</b> de antelación; los más lejanos se programan solos cuando abres la app.
              Si cambias o borras un recordatorio ya programado, el aviso antiguo puede llegar igualmente.</p>` : ''}
        ${foldClose()}

        ${foldOpen('set-g', 'Google Calendar y Tasks (avanzado)', false)}
          ${googleConfigured() ? (wasConnected() ? `
            <p class="note-info">✅ Cuenta de Google conectada.</p>
            <label class="switch-row"><span class="grow">Añadir recordatorios a Google Calendar<small>Te avisa a la hora exacta, con la app cerrada</small></span>
              <input class="switch" type="checkbox" data-sw="googleCalendarSync" ${s.googleCalendarSync ? 'checked' : ''}></label>
            <label class="switch-row"><span class="grow">Crear tarea en Google Tasks<small>Aparece en tu lista de tareas (solo con la fecha)</small></span>
              <input class="switch" type="checkbox" data-sw="googleTasksSync" ${s.googleTasksSync ? 'checked' : ''}></label>
            <div style="padding:8px 16px"><button class="btn outlined" data-act="g-off">Desconectar Google</button></div>`
          : `<p class="note-info">Conecta tu cuenta para que los recordatorios aparezcan en Google Calendar y Google Tasks. Se abrirá la ventana normal de Google: eliges tu cuenta, entras con tu usuario y contraseña y pulsas «Permitir».</p>
            <div style="padding:0 16px"><button class="btn filled big" data-act="g-on">Conectar con Google</button></div>`)
          : '<p class="note-info">Google todavía no está configurado en esta app (lo hace una sola vez quien la publica; ver README). Mientras tanto los recordatorios funcionan dentro de la app y con Google Calendar manual/.ics.</p>'}
          <button class="adv-toggle" data-adv="g" aria-expanded="${adv.g}">Opciones avanzadas ${icon(adv.g ? 'left' : 'right')}</button>
          <div class="adv-body" ${adv.g ? '' : 'hidden'}>
            <div class="field"><label for="s-gid">Client ID de OAuth (Google Cloud)</label>
              <input id="s-gid" placeholder="xxxx.apps.googleusercontent.com" value="${esc(s.googleClientId)}" autocomplete="off"><small>Es público; nunca pegues un «client secret».</small></div>
            <div style="padding:8px 16px"><button class="btn tonal" data-act="save-g">Guardar</button></div>
          </div>
        ${foldClose()}

        ${foldOpen('set-pr', 'Privacidad: qué sale del dispositivo', false)}
          <div class="note-info selectable">
            <b>Siempre local:</b> notas, audios, ajustes y recordatorios (IndexedDB de este navegador).<br><br>
            <b>Motor «Navegador»:</b> el audio mientras grabas lo procesa el servicio de voz de tu navegador (Google en Chrome/Android).<br><br>
            <b>Motor «Servidor»:</b> el audio de cada grabación se envía a <i>tu</i> proxy y de ahí a OpenAI para transcribirlo, junto con una lista de términos médicos (nunca el texto de tus notas).<br><br>
            <b>Google Tasks:</b> solo título, fecha/hora y un enlace a la nota; no el texto completo ni el audio.<br><br>
            No hay analítica ni anuncios. Las notas no se registran en logs.
          </div>${foldClose()}

        ${foldOpen('set-al', 'Almacenamiento', false)}
          <p class="note-info">Usado: ${mb(est.usage)} de ${mb(est.quota)} · ${est.persisted ? 'Persistente ✅' : 'No persistente (el navegador podría liberar espacio)'}</p>
          ${est.persisted ? '' : '<div style="padding:0 16px"><button class="btn tonal" data-act="persist">Proteger mis notas</button></div>'}
          <div style="padding:8px 16px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn outlined" data-act="demo">Cargar notas de ejemplo</button>
            ${demoIds().length ? '<button class="btn outlined danger" data-act="demo-clear">Quitar ejemplos</button>' : ''}
            <button class="btn outlined" data-act="trash">${icon('delete')} Papelera</button>
            ${installAvailable() ? `<button class="btn filled" data-act="install">${icon('download')} Instalar app</button>` : ''}
          </div>
          ${isStandalone() ? '<p class="note-info">Estás usando la app instalada ✅</p>' : ''}
        ${foldClose()}`;
    };
    // Selectores propios (hoja inferior): más fiables en móvil que el <select> nativo.
    const CHOICES = {
      theme: { title: 'Tema', key: 'theme', cur: () => allSettings().theme, opts: () => Object.entries(THEMES) },
      model: { title: 'Calidad del motor gratuito', key: 'localModel', cur: () => modelKey(), opts: () => Object.entries(MODELS).map(([k, m]) => [k, `${m.label} (~${m.mb} MB)${modelReady(k) ? ' · descargado' : ''}`]) },
      lang: { title: 'Idioma / variante', key: 'language', cur: () => allSettings().language, opts: () => LANGS.map(([c, n]) => [c, `Español (${n})`]) },
      engine: { title: 'Motor de transcripción', key: 'engine', cur: () => allSettings().engine, opts: () => Object.entries(ENGINE_CHOICES) },
    };
    async function choose(id) {
      const c = CHOICES[id];
      const v = await menuSheet({ title: c.title, items: c.opts().map(([k, label]) => ({ id: k, label, icon: k === c.cur() ? 'check' : 'blank' })) });
      if (v === undefined) return;
      await setSetting(c.key, v);
      await render();
    }
    render();
    bindFolds(root);
    root.addEventListener('click', async (e) => {
      const pick = e.target.closest('[data-pick]');
      if (pick) { await choose(pick.dataset.pick); return; }
      const advBtn = e.target.closest('[data-adv]');
      if (advBtn) { adv[advBtn.dataset.adv] = !adv[advBtn.dataset.adv]; await render(); return; }
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const $ = (id) => root.querySelector('#' + id);
      switch (b.dataset.act) {
        case 'back': history.length > 1 ? history.back() : navigate('/'); break;
        case 'save-tx':
          await setSetting('transcriptionEndpoint', $('s-endpoint').value.trim().replace(/\/$/, ''));
          await setSetting('transcriptionToken', $('s-token').value.trim());
          toast('Transcripción guardada'); render(); processQueue(queueApi()); break;
        case 'save-terms': await setSetting('customTerms', $('s-terms').value); toast('Diccionario guardado'); render(); break;
        case 'save-g': await setSetting('googleClientId', $('s-gid').value.trim()); toast('Guardado'); render(); break;
        case 'save-groq': {
          const key = $('s-groq').value.trim();
          await setSetting('groqKey', key);
          if (!key) { toast('Clave quitada'); render(); break; }
          toast('Comprobando la clave…');
          try {
            const r = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
            toast(r.ok ? 'Clave válida ✅ La transcripción usará Groq' : r.status === 401 ? 'La clave no es válida' : `Groq respondió ${r.status}`);
          } catch { toast('Clave guardada, pero no se pudo comprobar (¿sin Internet?)'); }
          render(); break;
        }
        case 'ntfy-test': try { await sendTestNtfy(); toast('Aviso enviado: míralo en la app ntfy'); } catch (err) { toast(err.message); } break;
        case 'ntfy-copy': try { await navigator.clipboard.writeText(allSettings().ntfyTopic); toast('Tema copiado'); } catch { toast(allSettings().ntfyTopic); } break;
        case 'rm-groq': await setSetting('groqKey', ''); toast('Clave quitada'); render(); break;
        case 'asr-dl': prepareModel(modelKey()).catch((err) => toast(`No se pudo descargar: ${err.message}`)); break;
        case 'g-on':
          try { await getToken(true); toast('Google conectado'); } catch (err) { toast(err.message); }
          render(); break;
        case 'g-off': await disconnect(); toast('Google desconectado'); render(); break;
        case 'notif': toast(`Notificaciones: ${await requestNotificationPermission()}`); render(); break;
        case 'persist': toast((await requestPersistence()) ? 'Almacenamiento protegido' : 'El navegador no lo concedió'); render(); break;
        case 'install': await promptInstall(); render(); break;
        case 'demo': await loadDemo(); toast('Notas de ejemplo cargadas'); render(); break;
        case 'demo-clear': await clearDemo(); toast('Ejemplos eliminados'); render(); break;
        case 'trash': navigate('/trash'); break;
      }
    });
    root.addEventListener('change', async (e) => {
      const t = e.target;
      if (t.dataset.sw) await setSetting(t.dataset.sw, t.checked);
      if (t.dataset.actSw === 'ntfy') { if (t.checked) await enableNtfy(); else await setSetting('ntfyOn', false); render(); }
    });
    const off = [on('asr:progress', () => { const el = root.querySelector('#asr-status'); if (el) el.innerHTML = asrStatus(); })];
    return { destroy: () => off.forEach((f) => f()) };
  },
};
