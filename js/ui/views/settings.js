import { appBar } from '../components.js';
import { allSettings, setSetting } from '../../settings/settings.js';
import { termCount } from '../../medical/dictionary.js';
import { getToken, disconnect, wasConnected, googleConfigured } from '../../google/oauth.js';
import { requestNotificationPermission } from '../../reminders/reminders.js';
import { storageEstimate, requestPersistence } from '../../storage/db.js';
import { installAvailable, promptInstall, isStandalone } from '../install.js';
import { resolveEngine, processQueue } from '../../transcription/index.js';
import { queueApi } from '../../app-services.js';
import { toast } from '../dialogs.js';
import { navigate } from '../router.js';
import { esc } from '../../core/util.js';
import { icon } from '../../core/icons.js';

const LANGS = [['es-ES', 'España'], ['es-MX', 'México'], ['es-AR', 'Argentina'], ['es-CO', 'Colombia'], ['es-CL', 'Chile'], ['es-PE', 'Perú'], ['es-US', 'Estados Unidos'], ['es-VE', 'Venezuela']];
const ENGINE_NAMES = { whisper: 'Servidor (Whisper + vocabulario médico)', webspeech: 'Navegador (Web Speech)', none: 'Ninguno disponible' };
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
          <div class="field"><label for="s-lang">Idioma / variante</label>
            <select id="s-lang">${LANGS.map(([c, n]) => `<option value="${c}" ${s.language === c ? 'selected' : ''}>Español (${n})</option>`).join('')}</select></div>
          <div class="field"><label for="s-engine">Motor</label>
            <select id="s-engine">
              <option value="auto" ${s.engine === 'auto' ? 'selected' : ''}>Automático (recomendado)</option>
              <option value="whisper" ${s.engine === 'whisper' ? 'selected' : ''}>Servidor Whisper (mejor con términos médicos)</option>
              <option value="webspeech" ${s.engine === 'webspeech' ? 'selected' : ''}>Navegador (gratis, en vivo)</option>
            </select><small>En uso ahora: ${ENGINE_NAMES[resolveEngine()]}</small></div>
          <div class="field"><label for="s-endpoint">URL de tu servicio de transcripción</label>
            <input id="s-endpoint" type="url" inputmode="url" placeholder="https://tu-proxy.workers.dev" value="${esc(s.transcriptionEndpoint)}">
            <small>Ver carpeta <b>server/</b>. La clave de OpenAI vive solo en el servidor, nunca en la app.</small></div>
          <div class="field"><label for="s-token">Token de acceso a tu servicio (opcional)</label>
            <input id="s-token" type="password" autocomplete="off" value="${esc(s.transcriptionToken)}"></div>
          <div style="padding:8px 16px"><button class="btn tonal" data-act="save-tx">Guardar transcripción</button></div>
        </section>

        <section class="settings-group"><h2>Diccionario médico (${termCount()} términos base + los tuyos)</h2>
          <div class="field"><label for="s-terms">Tus términos (uno por línea)</label>
            <textarea id="s-terms" rows="6" spellcheck="false" placeholder="Ejemplo:&#10;Madopar&#10;sinemet=Sinemet&#10;rotigotina">${esc(s.customTerms)}</textarea>
            <small>Se envían como contexto al motor de transcripción. Con <b>alias=Término</b> también corriges errores habituales.</small></div>
          <div style="padding:8px 16px"><button class="btn tonal" data-act="save-terms">Guardar diccionario</button></div>
        </section>

        <section class="settings-group"><h2>Google Tasks</h2>
          <div class="field"><label for="s-gid">Client ID de OAuth (Google Cloud)</label>
            <input id="s-gid" placeholder="xxxx.apps.googleusercontent.com" value="${esc(s.googleClientId)}" autocomplete="off"><small>Es público; no pegues aquí ningún «client secret».</small></div>
          <label class="switch-row"><span class="grow">Crear tarea al añadir recordatorio<small>Usa solo el permiso de Google Tasks</small></span>
            <input class="switch" type="checkbox" id="s-sync" ${s.googleTasksSync ? 'checked' : ''}></label>
          <div style="padding:8px 16px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn tonal" data-act="save-g">Guardar</button>
            ${wasConnected() ? '<button class="btn outlined" data-act="g-off">Desconectar Google</button>' : `<button class="btn filled" data-act="g-on" ${googleConfigured() ? '' : 'disabled'}>Conectar con Google</button>`}
          </div>
          <p class="note-info">${wasConnected() ? '✅ Cuenta conectada.' : 'No conectado.'} Google Tasks solo guarda la <b>fecha</b> de vencimiento, no la hora.</p>
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
          await setSetting('language', $('s-lang').value); await setSetting('engine', $('s-engine').value);
          await setSetting('transcriptionEndpoint', $('s-endpoint').value.trim().replace(/\/$/, ''));
          await setSetting('transcriptionToken', $('s-token').value.trim());
          toast('Transcripción guardada'); render(); processQueue(queueApi()); break;
        case 'save-terms': await setSetting('customTerms', $('s-terms').value); toast('Diccionario guardado'); render(); break;
        case 'save-g': await setSetting('googleClientId', $('s-gid').value.trim()); await setSetting('googleTasksSync', $('s-sync').checked); toast('Guardado'); render(); break;
        case 'g-on':
          await setSetting('googleClientId', $('s-gid').value.trim());
          try { await getToken(true); toast('Google conectado'); } catch (err) { toast(err.message); }
          render(); break;
        case 'g-off': await disconnect(); toast('Google desconectado'); render(); break;
        case 'notif': toast(`Notificaciones: ${await requestNotificationPermission()}`); render(); break;
        case 'persist': toast((await requestPersistence()) ? 'Almacenamiento protegido' : 'El navegador no lo concedió'); render(); break;
        case 'install': await promptInstall(); render(); break;
        case 'trash': navigate('/trash'); break;
      }
    });
    return {};
  },
};
