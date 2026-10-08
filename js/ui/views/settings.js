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
import { toast } from '../dialogs.js';
import { loadDemo, clearDemo, demoIds } from '../../notes/demo.js';
import { navigate } from '../router.js';
import { esc } from '../../core/util.js';
import { icon } from '../../core/icons.js';

const LANGS = [['es-ES', 'España'], ['es-MX', 'México'], ['es-AR', 'Argentina'], ['es-CO', 'Colombia'], ['es-CL', 'Chile'], ['es-PE', 'Perú'], ['es-US', 'Estados Unidos'], ['es-VE', 'Venezuela']];
const ENGINE_NAMES = { local: 'En tu teléfono (Whisper, gratis)', whisper: 'Tu servidor (Whisper + vocabulario médico)', webspeech: 'Navegador (en vivo)', none: 'Ninguno disponible' };
function asrStatus() {
  const e = resolveEngine();
  if (e !== 'local') return `Motor activo: <b>${ENGINE_NAMES[e]}</b>.`;
  if (downloadState.busy) return `<span class="spinner" style="display:inline-block;vertical-align:middle"></span> Descargando el motor de voz… <b>${downloadState.pct}%</b>`;
  if (modelReady(modelKey())) return '✅ <b>Transcripción gratuita lista</b>. Funciona sin conexión y el audio no sale de tu teléfono.';
  return `Transcripción gratuita en tu teléfono. Falta descargar el motor una vez (~${MODELS[modelKey()].mb} MB, mejor con Wi-Fi). ${downloadState.error ? '<br>Error: ' + esc(downloadState.error) : ''}<br><button class="btn filled" data-act="asr-dl" style="margin-top:8px">Descargar ahora</button>`;
}
const mb = (n) => (n / 1048576).toFixed(1) + ' MB';

export default {
  nav: false, fab: false,
  mount(root) {
    const render = async () => {
      const s = allSettings();
      const est = await storageEstimate();
      const notif = typeof Notification === 'undefined' ? 'no disponible' : Notification.permission;
      root.innerHTML = `
        ${appBar({ title: 'Ajustes', back: true })}
        <section class="settings-group"><h2>Apariencia</h2>
          <div class="seg" role="group" aria-label="Tema">
            ${[['system', 'Sistema'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([v, l]) => `<button data-theme="${v}" aria-pressed="${s.theme === v}">${l}</button>`).join('')}
          </div></section>

        <section class="settings-group"><h2>Transcripción</h2>
          <div class="note-info" id="asr-status">${asrStatus()}</div>
          <div class="field"><label for="s-model">Calidad del motor gratuito</label>
            <select id="s-model">
              ${Object.entries(MODELS).map(([k, m]) => `<option value="${k}" ${modelKey() === k ? 'selected' : ''}>${m.label} (~${m.mb} MB)${modelReady(k) ? ' · descargado' : ''}</option>`).join('')}
            </select><small>«Alta precisión» reconoce mejor los términos médicos pero tarda más y ocupa más.</small></div>
          <div class="field"><label for="s-lang">Idioma / variante</label>
            <select id="s-lang">${LANGS.map(([c, n]) => `<option value="${c}" ${s.language === c ? 'selected' : ''}>Español (${n})</option>`).join('')}</select></div>
          <details class="adv"><summary>Opciones avanzadas</summary>
            <div class="field"><label for="s-engine">Motor</label>
              <select id="s-engine">
                <option value="auto" ${s.engine === 'auto' ? 'selected' : ''}>Automático (recomendado)</option>
                <option value="local" ${s.engine === 'local' ? 'selected' : ''}>En el teléfono (gratis)</option>
                <option value="whisper" ${s.engine === 'whisper' ? 'selected' : ''}>Mi servidor Whisper</option>
                <option value="webspeech" ${s.engine === 'webspeech' ? 'selected' : ''}>Navegador en vivo (experimental)</option>
              </select><small>En uso ahora: ${ENGINE_NAMES[resolveEngine()]}</small></div>
            <div class="field"><label for="s-endpoint">URL de tu servidor de transcripción (opcional)</label>
              <input id="s-endpoint" type="url" inputmode="url" placeholder="https://tu-proxy.workers.dev" value="${esc(s.transcriptionEndpoint)}">
              <small>Ver carpeta <b>server/</b>. Permite Whisper grande con vocabulario médico como contexto.</small></div>
            <div class="field"><label for="s-token">Token de acceso a tu servidor</label>
              <input id="s-token" type="password" autocomplete="off" value="${esc(s.transcriptionToken)}"></div>
            <div style="padding:8px 16px"><button class="btn tonal" data-act="save-tx">Guardar</button></div>
          </details>
        </section>

        <section class="settings-group"><h2>Diccionario médico (${termCount()} términos base + los tuyos)</h2>
          <div class="field"><label for="s-terms">Tus términos (uno por línea)</label>
            <textarea id="s-terms" rows="6" spellcheck="false" placeholder="Ejemplo:&#10;Madopar&#10;sinemet=Sinemet&#10;rotigotina">${esc(s.customTerms)}</textarea>
            <small>Se envían como contexto al motor de transcripción. Con <b>alias=Término</b> también corriges errores habituales.</small></div>
          <div style="padding:8px 16px"><button class="btn tonal" data-act="save-terms">Guardar diccionario</button></div>
        </section>

        <section class="settings-group"><h2>Google (Calendar y Tasks)</h2>
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
          <details class="adv"><summary>Opciones avanzadas</summary>
            <div class="field"><label for="s-gid">Client ID de OAuth (Google Cloud)</label>
              <input id="s-gid" placeholder="xxxx.apps.googleusercontent.com" value="${esc(s.googleClientId)}" autocomplete="off"><small>Es público; nunca pegues un «client secret».</small></div>
            <div style="padding:8px 16px"><button class="btn tonal" data-act="save-g">Guardar</button></div>
          </details>
        </section>

        <section class="settings-group"><h2>Avisos</h2>
          <div style="padding:0 16px"><button class="btn tonal" data-act="notif">${icon('bell')} Permiso de notificaciones: ${notif}</button></div>
          <p class="note-info">Una PWA no puede despertarse sola con la app cerrada. Con la app abierta avisa a la hora exacta; para avisos con la app cerrada usa Google Tasks / Google Calendar.</p></section>

        <section class="settings-group"><h2>Privacidad: qué sale del dispositivo</h2>
          <div class="note-info selectable">
            <b>Siempre local:</b> notas, audios, ajustes y recordatorios (IndexedDB de este navegador).<br><br>
            <b>Motor «Navegador»:</b> el audio mientras grabas lo procesa el servicio de voz de tu navegador (Google en Chrome/Android).<br><br>
            <b>Motor «Servidor»:</b> el audio de cada grabación se envía a <i>tu</i> proxy y de ahí a OpenAI para transcribirlo, junto con una lista de términos médicos (nunca el texto de tus notas).<br><br>
            <b>Google Tasks:</b> solo título, fecha/hora y un enlace a la nota; no el texto completo ni el audio.<br><br>
            No hay analítica ni anuncios. Las notas no se registran en logs.
          </div></section>

        <section class="settings-group"><h2>Almacenamiento</h2>
          <p class="note-info">Usado: ${mb(est.usage)} de ${mb(est.quota)} · ${est.persisted ? 'Persistente ✅' : 'No persistente (el navegador podría liberar espacio)'}</p>
          ${est.persisted ? '' : '<div style="padding:0 16px"><button class="btn tonal" data-act="persist">Proteger mis notas</button></div>'}
          <div style="padding:8px 16px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn outlined" data-act="demo">Cargar notas de ejemplo</button>
            ${demoIds().length ? '<button class="btn outlined danger" data-act="demo-clear">Quitar ejemplos</button>' : ''}
            <button class="btn outlined" data-act="trash">${icon('delete')} Papelera</button>
            ${installAvailable() ? `<button class="btn filled" data-act="install">${icon('download')} Instalar app</button>` : ''}
          </div>
          ${isStandalone() ? '<p class="note-info">Estás usando la app instalada ✅</p>' : ''}
        </section>`;
    };
    render();
    root.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act],[data-theme]');
      if (!b) return;
      const $ = (id) => root.querySelector('#' + id);
      if (b.dataset.theme) { await setSetting('theme', b.dataset.theme); return render(); }
      switch (b.dataset.act) {
        case 'back': history.length > 1 ? history.back() : navigate('/'); break;
        case 'save-tx':
          await setSetting('engine', $('s-engine').value);
          await setSetting('transcriptionEndpoint', $('s-endpoint').value.trim().replace(/\/$/, ''));
          await setSetting('transcriptionToken', $('s-token').value.trim());
          toast('Transcripción guardada'); render(); processQueue(queueApi()); break;
        case 'save-terms': await setSetting('customTerms', $('s-terms').value); toast('Diccionario guardado'); render(); break;
        case 'save-g': await setSetting('googleClientId', $('s-gid').value.trim()); toast('Guardado'); render(); break;
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
      if (t.id === 's-lang') await setSetting('language', t.value);
      if (t.id === 's-model') { await setSetting('localModel', t.value); render(); }
      if (t.dataset.sw) await setSetting(t.dataset.sw, t.checked);
    });
    const off = [on('asr:progress', () => { const el = root.querySelector('#asr-status'); if (el) el.innerHTML = asrStatus(); })];
    return { destroy: () => off.forEach((f) => f()) };
  },
};
