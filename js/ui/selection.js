// Selección múltiple global + manejo delegado de tarjetas (toque, pulsación larga, favorito, hecho).
import { emit } from '../core/events.js';
import * as Notes from '../notes/notes.js';
import { navigate, setNavContext } from './router.js';

export const sel = { active: false, ids: new Set() };

export function startSelection(id) {
  sel.active = true;
  if (id) sel.ids.add(id);
  navigator.vibrate?.(15);
  emit('selection:changed');
}
export function clearSelection() { sel.active = false; sel.ids.clear(); emit('selection:changed'); }
export function toggleSelected(id) {
  sel.ids.has(id) ? sel.ids.delete(id) : sel.ids.add(id);
  if (!sel.ids.size) sel.active = false;
  emit('selection:changed');
}

/** Conecta los eventos de las tarjetas dentro de `root`. `onChange` se llama tras acciones rápidas. */
export function bindCards(root) {
  let timer = null, moved = false, longFired = false, startX = 0, startY = 0;
  const cardOf = (e) => e.target.closest?.('.card[data-id]');

  root.addEventListener('pointerdown', (e) => {
    const card = cardOf(e);
    if (!card || e.target.closest('[data-act]')) return;
    moved = false; longFired = false; startX = e.clientX; startY = e.clientY;
    timer = setTimeout(() => {
      if (moved) return;
      longFired = true;
      sel.active ? toggleSelected(card.dataset.id) : startSelection(card.dataset.id);
    }, 480);
  });
  root.addEventListener('pointermove', (e) => {
    if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) { moved = true; clearTimeout(timer); }
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => root.addEventListener(t, () => clearTimeout(timer)));
  root.addEventListener('contextmenu', (e) => cardOf(e) && e.preventDefault());

  root.addEventListener('click', (e) => {
    const card = cardOf(e);
    if (!card) return;
    const id = card.dataset.id;
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'fav') { e.stopPropagation(); return Notes.toggleFavorite(id); }
    if (act === 'done') { e.stopPropagation(); return Notes.toggleDone(id); }
    if (longFired) { longFired = false; return; }
    if (sel.active) return toggleSelected(id);
    const ids = [...card.closest('[data-nav-list]').querySelectorAll('.card[data-id]')].map((c) => c.dataset.id);
    setNavContext(ids);
    navigate(`/note/${id}`);
  });
  root.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('card')) { e.preventDefault(); e.target.click(); }
  });
}
