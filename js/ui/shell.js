// Cromo de la app: navegación inferior, FAB, barra de selección y estado del router.
import { icon } from '../core/icons.js';
import { sel, clearSelection } from './selection.js';
import { on } from '../core/events.js';
import { startRecordingFlow } from './recording.js';
import * as Notes from '../notes/notes.js';
import { shareUI, deleteNotes, pickPriority, pickKind } from './actions.js';
import { toast } from './dialogs.js';
import { syncNoteChange } from '../reminders/service.js';

// Quinto elemento del menú, en el centro: grabar una nota de voz (id 'rec').
const NAV = [['/', 'home', 'Inicio'], ['/calendar', 'calendar', 'Calendario'], ['rec', 'mic', 'Grabar'], ['/favorites', 'star', 'Favoritos'], ['/search', 'search', 'Buscar']];

export function buildShell() {
  const nav = document.getElementById('nav');
  nav.innerHTML = NAV.map(([href, ic, label]) => href === 'rec'
    ? `<button id="nav-rec" class="rec-item" aria-label="Grabar nota de voz"><span class="pill">${icon(ic)}</span>${label}</button>`
    : `<a href="#${href}" data-nav="${href}"><span class="pill">${icon(ic)}</span>${label}</a>`).join('');
  nav.querySelector('#nav-rec').addEventListener('click', startRecordingFlow);

  const bar = document.getElementById('selbar');
  const paint = () => {
    bar.hidden = !sel.active;
    if (!sel.active) { bar.innerHTML = ''; return; }
    bar.innerHTML = `
      <button class="iconbtn" data-s="close" aria-label="Cancelar selección">${icon('close')}</button>
      <h1>${sel.ids.size} seleccionada${sel.ids.size === 1 ? '' : 's'}</h1>
      <button class="iconbtn" data-s="share" aria-label="Compartir">${icon('share')}</button>
      <button class="iconbtn" data-s="done" aria-label="Marcar como realizadas">${icon('checkCircle')}</button>
      <button class="iconbtn" data-s="prio" aria-label="Cambiar prioridad">${icon('flag')}</button>
      <button class="iconbtn" data-s="kind" aria-label="Cambiar tipo">${icon('label')}</button>
      <button class="iconbtn" data-s="del" aria-label="Eliminar">${icon('delete')}</button>`;
  };
  on('selection:changed', paint);
  bar.addEventListener('click', async (e) => {
    const k = e.target.closest('[data-s]')?.dataset.s;
    if (!k) return;
    const ids = [...sel.ids], notes = ids.map(Notes.get).filter(Boolean);
    if (k === 'close') return clearSelection();
    if (k === 'share') { await shareUI(notes); clearSelection(); }
    if (k === 'done') {
      const allDone = notes.every((n) => n.done);
      for (const n of notes) { await Notes.update(n.id, { done: !allDone }); syncNoteChange(Notes.get(n.id)); }
      toast(allDone ? 'Marcadas como pendientes' : 'Marcadas como realizadas'); clearSelection();
    }
    if (k === 'prio' && await pickPriority(ids)) clearSelection();
    if (k === 'kind' && await pickKind(ids)) clearSelection();
    if (k === 'del' && await deleteNotes(ids)) clearSelection();
  });

  return {
    onRoute(path, view) {
      nav.classList.toggle('hidden', !view.nav);
      nav.querySelectorAll('a').forEach((a) => (a.dataset.nav === path ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
      if (sel.active) clearSelection();
    },
  };
}
