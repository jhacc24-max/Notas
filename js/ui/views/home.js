import * as Notes from '../../notes/notes.js';
import { appBar, iconBtn, cardList, emptyState } from '../components.js';
import { bindCards, sel } from '../selection.js';
import { esc, fmtTime, relDay } from '../../core/util.js';
import { icon } from '../../core/icons.js';
import { navigate } from '../router.js';
import { startRecordingFlow } from '../recording.js';
import { getDraft, hasSavedDraft, restoreDraft } from '../draft.js';
import { installAvailable, promptInstall } from '../install.js';
import { on } from '../../core/events.js';

const section = (title, notes, more, query = '') => notes.length ? `
  <section class="section"><div class="section-head"><h2>${title}</h2>${more ? `<a class="btn text" href="#/notes${query}">Ver todas</a>` : ''}</div>
  ${cardList(notes, { selecting: sel.active, selectedIds: sel.ids })}</section>` : '';

export default {
  nav: true, fab: true,
  mount(root) {
    let savedDraft = false;
    const render = () => {
      const act = Notes.active();
      const pending = act.filter((n) => !n.done);
      const high = pending.filter((n) => n.priority === 'high').sort(Notes.byRecent).slice(0, 3);
      const shown = new Set(high.map((n) => n.id));
      const pend = [...pending].sort(Notes.byPriority).filter((n) => !shown.has(n.id)).slice(0, 4);
      pend.forEach((n) => shown.add(n.id));
      const recent = [...act].sort(Notes.byRecent).slice(0, 4);
      const upcoming = act.filter((n) => !n.done && n.reminder && n.reminder.at > Date.now() - 3600e3)
        .sort((a, b) => a.reminder.at - b.reminder.at).slice(0, 3);
      const todayReminders = upcoming.filter((n) => relDay(n.reminder.at) === 'Hoy').length;
      root.innerHTML = `
        ${appBar({ title: 'Mis notas', large: true, actions: iconBtn('trash', 'delete', 'Papelera') + iconBtn('settings', 'settings', 'Ajustes') })}
        ${savedDraft || getDraft() ? `<div class="banner" role="status">${icon('mic')}<span>Tienes una grabación sin guardar.</span><button class="btn tonal" data-act="draft">Revisar</button></div>` : ''}
        ${installAvailable() ? `<div class="banner" role="status">${icon('download')}<span>Instala la app en tu teléfono para usarla sin conexión.</span><button class="btn tonal" data-act="install">Instalar</button></div>` : ''}
        <div class="hero">
          <h2>${act.length ? 'Hola 👋' : 'Bienvenido'}</h2>
          <p>${act.length ? `${pending.length} pendientes${todayReminders ? ` · ${todayReminders} recordatorio${todayReminders > 1 ? 's' : ''} hoy` : ''}` : 'Graba tu primera nota hablando: se transcribe sola.'}</p>
          <button class="btn big" data-act="rec">${icon('mic')} Nueva nota</button>
        </div>
        <div class="stats">
          <a class="stat" href="#/notes?s=pending" style="text-decoration:none;color:inherit"><b>${pending.length}</b><span>Pendientes</span></a>
          <a class="stat" href="#/notes?p=high" style="text-decoration:none;color:inherit"><b>${act.filter((n) => !n.done && n.priority === 'high').length}</b><span>Prioridad alta</span></a>
          <a class="stat" href="#/favorites" style="text-decoration:none;color:inherit"><b>${Notes.favorites().length}</b><span>Favoritas</span></a>
        </div>
        ${upcoming.length ? `<section class="section"><div class="section-head"><h2>Próximos recordatorios</h2><a class="btn text" href="#/calendar">Calendario</a></div>
          ${cardList(upcoming, { selecting: sel.active, selectedIds: sel.ids })}</section>` : ''}
        ${section('Prioridad alta', high, true, '?p=high')}
        ${section('Pendientes', pend, true, '?s=pending')}
        ${section('Recientes', recent.filter((n) => !shown.has(n.id)), true)}
        ${act.length ? '' : emptyState('mic', 'Aún no hay notas', 'Pulsa «Nueva nota» y empieza a hablar.')}`;
    };
    hasSavedDraft().then((v) => { if (v && !savedDraft) { savedDraft = v; render(); } });
    render();
    bindCards(root);
    root.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'rec') startRecordingFlow();
      if (act === 'settings') navigate('/settings');
      if (act === 'trash') navigate('/trash');
      if (act === 'draft') { await restoreDraft(); navigate('/review'); }
      if (act === 'install') { await promptInstall(); render(); }
    });
    const off = [on('install:changed', render), on('draft:changed', render)];
    return { update: render, destroy: () => off.forEach((f) => f()) };
  },
};
