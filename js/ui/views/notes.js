// Lista de notas con filtros (estado, prioridad) y orden. También se usa para Favoritos.
import * as Notes from '../../notes/notes.js';
import { appBar, iconBtn, cardList, emptyState, PRIORITIES } from '../components.js';
import { bindCards, sel } from '../selection.js';
import { hashQuery, navigate } from '../router.js';

export const makeListView = ({ title, source, emptyIcon, emptyText, back = false }) => ({
  nav: !back, fab: true,
  mount(root) {
    const q = hashQuery();
    const f = { status: q.get('s') || 'all', priority: q.get('p') || 'all', sort: q.get('o') || 'recent' };
    const render = () => {
      const base = source();
      const list = Notes.filterNotes(base, f);
      const chip = (k, v, label, extra = '') => `<button class="chip ${extra}" data-f="${k}" data-v="${v}" aria-pressed="${f[k] === v}">${label}</button>`;
      root.innerHTML = `
        ${appBar({ title, large: true, back, actions: iconBtn('sort', 'sort', f.sort === 'priority' ? 'Orden: prioridad (cambiar a recientes)' : 'Orden: recientes (cambiar a prioridad)', f.sort === 'priority' ? 'primary' : '') })}
        <div class="chips" role="group" aria-label="Filtros">
          ${chip('status', 'all', 'Todas')}${chip('status', 'pending', 'Pendientes')}${chip('status', 'done', '☑ Realizadas')}
          ${PRIORITIES.map((p) => `<button class="chip p-${p.id}" data-f="priority" data-v="${f.priority === p.id ? 'all' : p.id}" aria-pressed="${f.priority === p.id}"><i class="dot"></i>${p.label}</button>`).join('')}
        </div>
        ${f.sort === 'priority' ? '<p class="nav-hint">Ordenadas: Alta → Media → Baja</p>' : ''}
        ${list.length ? cardList(list, { selecting: sel.active, selectedIds: sel.ids }) : emptyState(emptyIcon, emptyText, base.length ? 'Prueba a quitar algún filtro.' : '')}`;
    };
    render();
    bindCards(root);
    root.addEventListener('click', (e) => {
      const fb = e.target.closest('[data-f]');
      if (fb) { f[fb.dataset.f] = fb.dataset.v; render(); }
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'sort') { f.sort = f.sort === 'priority' ? 'recent' : 'priority'; render(); }
      if (act === 'back') history.length > 1 ? history.back() : navigate('/');
    });
    return { update: render };
  },
});

export const notesView = makeListView({ title: 'Todas las notas', source: Notes.active, emptyIcon: 'select', emptyText: 'No hay notas', back: true });
export const favoritesView = makeListView({ title: '⭐ Favoritos', source: Notes.favorites, emptyIcon: 'starO', emptyText: 'Aún no tienes favoritos' });
