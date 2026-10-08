// Lista de notas con filtros desplegables (estado, prioridad, tipo, orden). También se usa para Favoritos.
import * as Notes from '../../notes/notes.js';
import { appBar, cardList, emptyState, filterBar, bindFilters } from '../components.js';
import { bindCards, sel } from '../selection.js';
import { hashQuery, navigate } from '../router.js';

const KEYS = ['status', 'priority', 'kind', 'sort'];

export const makeListView = ({ title, source, emptyIcon, emptyText, back = false }) => ({
  nav: !back,
  mount(root) {
    const q = hashQuery();
    const f = { status: q.get('s') || 'all', priority: q.get('p') || 'all', kind: q.get('k') || 'all', sort: q.get('o') || 'recent' };
    const render = () => {
      const base = source();
      const list = Notes.filterNotes(base, f);
      root.innerHTML = `
        ${appBar({ title, large: true, back })}
        ${filterBar(f, KEYS)}
        <p class="nav-hint">${list.length} de ${base.length} nota${base.length === 1 ? '' : 's'}</p>
        ${list.length ? cardList(list, { selecting: sel.active, selectedIds: sel.ids }) : emptyState(emptyIcon, emptyText, base.length ? 'Prueba a quitar algún filtro.' : '')}`;
    };
    render();
    bindCards(root);
    bindFilters(root, f, KEYS, render);
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-act=back]')) history.length > 1 ? history.back() : navigate('/');
    });
    return { update: render };
  },
});

export const notesView = makeListView({ title: 'Todas las notas', source: Notes.active, emptyIcon: 'select', emptyText: 'No hay notas', back: true });
export const favoritesView = makeListView({ title: '⭐ Favoritos', source: Notes.favorites, emptyIcon: 'starO', emptyText: 'Aún no tienes favoritos' });
