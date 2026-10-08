import * as Notes from '../../notes/notes.js';
import { appBar, iconBtn, cardList, emptyState, filterBar, bindFilters } from '../components.js';
import { foldSection, bindFolds } from '../fold.js';
import { bindCards, sel } from '../selection.js';
import { esc, fmtTime, relDay } from '../../core/util.js';
import { icon } from '../../core/icons.js';
import { navigate } from '../router.js';
import { startRecordingFlow } from '../recording.js';
import { getDraft, hasSavedDraft, restoreDraft } from '../draft.js';
import { installAvailable, promptInstall } from '../install.js';
import { on } from '../../core/events.js';
import { resolveEngine, modelKey } from '../../transcription/index.js';
import { modelReady, prepareModel, downloadState, MODELS } from '../../transcription/local.js';
import { toast } from '../dialogs.js';

/** Aviso de primera vez: descargar el motor de voz gratuito (una sola vez). */
function asrBanner() {
  if (resolveEngine() !== 'local' || modelReady(modelKey())) return '';
  if (downloadState.busy) return `<div class="banner" role="status"><span class="spinner"></span><span>Descargando el motor de voz… ${downloadState.pct}%</span></div>`;
  return `<div class="banner" role="status">${icon('download')}<span>Para transcribir gratis, descarga una vez el motor de voz (~${MODELS[modelKey()].mb} MB, mejor con Wi-Fi).${downloadState.error ? ' Error: ' + esc(downloadState.error) : ''}</span><button class="btn tonal" data-act="asr">Descargar</button></div>`;
}

/** Sección plegable (toca el título). `total` = cuántas notas hay en total; se muestran solo las primeras. */
const section = (id, title, notes, total, link = '') => notes.length
  ? foldSection(id, title, cardList(notes, { selecting: sel.active, selectedIds: sel.ids }), { count: total, extra: link }) : '';
const F = { kind: 'all' };

export default {
  nav: true,
  mount(root) {
    let savedDraft = false;
    const render = () => {
      const act = Notes.active().filter((n) => F.kind === 'all' || (F.kind === 'none' ? !n.kind : n.kind === F.kind));
      const pending = act.filter((n) => !n.done);
      const highAll = pending.filter((n) => n.priority === 'high').sort(Notes.byRecent);
      const high = highAll.slice(0, 5);
      const shown = new Set(high.map((n) => n.id));
      const pendRest = [...pending].sort(Notes.byPriority).filter((n) => !shown.has(n.id));
      const pend = pendRest.slice(0, 5);
      pend.forEach((n) => shown.add(n.id));
      const recentAll = [...act].sort(Notes.byRecent).filter((n) => !shown.has(n.id));
      const recent = recentAll.slice(0, 5);
      const upcoming = act.filter((n) => !n.done && n.reminder && n.reminder.at > Date.now() - 3600e3)
        .sort((a, b) => a.reminder.at - b.reminder.at);
      const todayReminders = upcoming.filter((n) => relDay(n.reminder.at) === 'Hoy').length;
      root.innerHTML = `
        ${appBar({ title: 'Mis notas', large: true, actions: iconBtn('trash', 'delete', 'Papelera') + iconBtn('settings', 'settings', 'Ajustes') })}
        ${savedDraft || getDraft() ? `<div class="banner" role="status">${icon('mic')}<span>Tienes una grabación sin guardar.</span><button class="btn tonal" data-act="draft">Revisar</button></div>` : ''}
        ${asrBanner()}
        ${installAvailable() ? `<div class="banner" role="status">${icon('download')}<span>Instala la app en tu teléfono para usarla sin conexión.</span><button class="btn tonal" data-act="install">Instalar</button></div>` : ''}
        <div class="hero">
          <h2>${act.length ? 'Hola 👋' : 'Bienvenido'}</h2>
          <p>${act.length ? `${pending.length} pendientes${todayReminders ? ` · ${todayReminders} recordatorio${todayReminders > 1 ? 's' : ''} hoy` : ''}` : 'Graba tu primera nota hablando: se transcribe sola.'}</p>
          <button class="btn big" data-act="rec">${icon('mic')} Nueva nota</button>
        </div>
        <div class="stats">
          <a class="stat" href="#/list?s=pending" style="text-decoration:none;color:inherit"><b>${pending.length}</b><span>Pendientes</span></a>
          <a class="stat" href="#/list?p=high" style="text-decoration:none;color:inherit"><b>${act.filter((n) => !n.done && n.priority === 'high').length}</b><span>Prioridad alta</span></a>
          <a class="stat" href="#/list?f=fav" style="text-decoration:none;color:inherit"><b>${Notes.favorites().length}</b><span>Favoritas</span></a>
        </div>
        ${filterBar(F, ['kind'])}
        ${section('h-upcoming', 'Próximos recordatorios', upcoming.slice(0, 5), upcoming.length, '<a class="btn text" href="#/calendar">Calendario</a>')}
        ${section('h-high', 'Prioridad alta', high, highAll.length, '<a class="btn text" href="#/list?p=high">Ver todas</a>')}
        ${section('h-pending', 'Pendientes', pend, pendRest.length, '<a class="btn text" href="#/list?s=pending">Ver todas</a>')}
        ${section('h-recent', 'Recientes', recent, recentAll.length, '<a class="btn text" href="#/list">Ver todas</a>')}
        ${act.length ? '' : emptyState('mic', 'Aún no hay notas', 'Pulsa «Nueva nota» y empieza a hablar.')}`;
    };
    hasSavedDraft().then((v) => { if (v && !savedDraft) { savedDraft = v; render(); } });
    render();
    bindCards(root);
    bindFolds(root);
    bindFilters(root, F, ['kind'], render);
    root.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'rec') startRecordingFlow();
      if (act === 'settings') navigate('/settings');
      if (act === 'trash') navigate('/trash');
      if (act === 'draft') { await restoreDraft(); navigate('/review'); }
      if (act === 'asr') { prepareModel(modelKey()).catch((err) => toast(`No se pudo descargar: ${err.message}`)); }
      if (act === 'install') { await promptInstall(); render(); }
    });
    const off = [on('install:changed', render), on('draft:changed', render), on('asr:progress', render)];
    return { update: render, destroy: () => off.forEach((f) => f()) };
  },
};
