import * as Notes from '../../notes/notes.js';
import { appBar, cardList, emptyState } from '../components.js';
import { bindCards, sel } from '../selection.js';
import { icon } from '../../core/icons.js';
import { debounce, esc } from '../../core/util.js';

let lastQuery = '';

export default {
  nav: true, fab: true,
  mount(root) {
    root.innerHTML = `
      ${appBar({ title: 'Buscar', large: true })}
      <div class="searchbar" role="search">${icon('search')}
        <input id="q" type="search" inputmode="search" enterkeyhint="search" placeholder="Título, texto o contenido…" autocomplete="off" aria-label="Buscar notas" value="${esc(lastQuery)}">
        <button class="iconbtn" data-act="clear" aria-label="Borrar búsqueda">${icon('close')}</button>
      </div>
      <div id="results"></div>`;
    const input = root.querySelector('#q'), out = root.querySelector('#results');
    const run = () => {
      lastQuery = input.value.trim();
      if (!lastQuery) { out.innerHTML = emptyState('search', 'Escribe para buscar', 'Busca en títulos y en el texto transcrito, ej. «levodopa».'); return; }
      const res = Notes.search(lastQuery);
      out.innerHTML = res.length
        ? `<p class="nav-hint">${res.length} resultado${res.length > 1 ? 's' : ''}</p>${cardList(res, { query: lastQuery, selecting: sel.active, selectedIds: sel.ids })}`
        : emptyState('search', 'Sin resultados', `Nada coincide con «${lastQuery}».`);
    };
    input.addEventListener('input', debounce(run, 90));
    root.querySelector('[data-act=clear]').onclick = () => { input.value = ''; run(); input.focus(); };
    bindCards(out);
    run();
    if (!lastQuery) input.focus({ preventScroll: true });
    return { update: run };
  },
};
