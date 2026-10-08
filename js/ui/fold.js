// Secciones plegables: tocar el título las despliega/pliega. El estado se recuerda en el dispositivo.
import { icon } from '../core/icons.js';
import { esc } from '../core/util.js';

const key = (id) => `fold:${id}`;
export const isOpen = (id, def = true) => {
  try { const v = localStorage.getItem(key(id)); return v == null ? def : v === '1'; } catch { return def; }
};
const store = (id, open) => { try { localStorage.setItem(key(id), open ? '1' : '0'); } catch { /* sin almacenamiento */ } };

/** Cabecera plegable. `extra` va a la derecha (p. ej. «Ver todas»). */
export function foldHead(id, title, { count, def = true, extra = '' } = {}) {
  const open = isOpen(id, def);
  return `<div class="section-head fold-row"><button class="fold-head" data-fold="${id}" aria-expanded="${open}">
    <h2>${title}${count != null ? ` <span class="count">${count}</span>` : ''}</h2>${icon('down', 'chev')}</button>${extra}</div>`;
}
export const foldBodyStart = (id, def = true) => `<div class="fold-body" data-fold-body="${id}" ${isOpen(id, def) ? '' : 'hidden'}>`;
export const foldSection = (id, title, body, opts = {}) =>
  `<section class="section fold">${foldHead(id, title, opts)}${foldBodyStart(id, opts.def ?? true)}${body}</div></section>`;
/** Para ajustes: grupo plegable con el mismo estilo de títulos. */
export const foldGroup = (id, title, body, def = false) =>
  `<section class="settings-group fold">${foldHead(id, esc(title), { def })}${foldBodyStart(id, def)}${body}</div></section>`;

/** Un único listener: alterna el cuerpo sin volver a dibujar la pantalla. */
export function bindFolds(root) {
  root.addEventListener('click', (e) => {
    const h = e.target.closest('[data-fold]');
    if (!h || !root.contains(h)) return;
    const id = h.dataset.fold;
    const body = root.querySelector(`[data-fold-body="${id}"]`);
    if (!body) return;
    const open = body.hidden;
    body.hidden = !open;
    h.setAttribute('aria-expanded', String(open));
    store(id, open);
  });
}
