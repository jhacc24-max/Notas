// Lista de notas con filtros desplegables (estado, prioridad, tipo, orden). También se usa para Favoritos.
import * as Notes from '../../notes/notes.js';
import { appBar, cardList, emptyState, filterBar, bindFilters } from '../components.js';
import { bindCards, sel } from '../selection.js';
import { hashQuery, navigate } from '../router.js';

const KEYS = ['fav', 'status', 'priority', 'kind', 'sort'];

export const makeListView = ({ title, source, emptyIcon, emptyText, back = false }) => ({
  nav: !back,
  mount(root) {
    const q = hashQuery();
    const f = { fav: q.get('f') || 'all', status: q.get('s') || 'all', priority: q.get('p') || 'all', kind: q.get('k') || 'all', sort: q.get('o') || 'recent' };
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

/** Pestaña «Lista»: TODAS las notas; «Favoritas» es un filtro más del menú inferior. */
export const listView = makeListView({ title: 'Lista', source: Notes.active, emptyIcon: 'list', emptyText: 'No hay notas' });

/** Rutas antiguas (#/notes, #/favorites) llevan a la lista conservando los filtros. */
export const redirectTo = (extra = '') => ({
  nav: true,
  mount() {
    const q = new URLSearchParams(hashQuery());
    if (extra) q.set('f', extra);
    navigate(`/list${q.toString() ? '?' + q : ''}`, { replace: true });
    return {};
  },
});
