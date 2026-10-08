import * as Notes from '../../notes/notes.js';
import { appBar, cardList, emptyState, filterBar, bindFilters } from '../components.js';
import { bindCards, sel } from '../selection.js';
import { icon } from '../../core/icons.js';
import { debounce, esc } from '../../core/util.js';

let lastQuery = '';
const F = { fav: 'all', status: 'all', priority: 'all', kind: 'all' };
const KEYS = ['fav', 'status', 'priority', 'kind'];

// Los filtros se aplican sobre los resultados SIN cambiar el orden por relevancia.
const applyFilters = (list) => list.filter((n) =>
  (F.fav === 'all' || n.favorite) && (F.status === 'all' || (F.status === 'done') === n.done) && (F.priority === 'all' || n.priority === F.priority)
  && (F.kind === 'all' || (F.kind === 'none' ? !n.kind : n.kind === F.kind)));

export default {
  nav: true,
  mount(root) {
    root.innerHTML = `
      ${appBar({ title: 'Buscar', large: true })}
      <div class="searchbar" role="search">${icon('search')}
        <input id="q" type="search" inputmode="search" enterkeyhint="search" placeholder="Título, texto o contenido…" autocomplete="off" aria-label="Buscar notas" value="${esc(lastQuery)}">
        <button class="iconbtn" data-act="clear" aria-label="Borrar búsqueda">${icon('close')}</button>
      </div>
      <div id="fbar"></div>
      <div id="results"></div>`;
    const input = root.querySelector('#q'), out = root.querySelector('#results');
    const run = () => {
      lastQuery = input.value.trim();
      if (!lastQuery) { out.innerHTML = emptyState('search', 'Escribe para buscar', 'Busca en títulos y en el texto transcrito, ej. «levodopa».'); return; }
      const res = applyFilters(Notes.search(lastQuery));
      out.innerHTML = res.length
        ? `<p class="nav-hint">${res.length} resultado${res.length > 1 ? 's' : ''}</p>${cardList(res, { query: lastQuery, selecting: sel.active, selectedIds: sel.ids })}`
        : emptyState('search', 'Sin resultados', `Nada coincide con «${lastQuery}».`);
    };
    const drawBar = () => { root.querySelector('#fbar').innerHTML = filterBar(F, KEYS); };
    drawBar();
    bindFilters(root, F, KEYS, () => { drawBar(); run(); });
    input.addEventListener('input', debounce(run, 90));
    root.querySelector('[data-act=clear]').onclick = () => { input.value = ''; run(); input.focus(); };
    bindCards(out);
    run();
    if (!lastQuery) input.focus({ preventScroll: true });
    return { update: run };
  },
};
