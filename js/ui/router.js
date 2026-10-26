// Router por hash con transiciones. Cada ruta: { mount(root, params) -> {update?, destroy?}, nav, fab }.
import { on } from '../core/events.js';

const routes = [];
let current = null, navCtx = [], direction = '', lastPath = '';
const listeners = new Set();

export const addRoute = (pattern, view) => {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '$');
  routes.push({ re, keys, view });
};
export const navigate = (path, { replace = false, dir = '' } = {}) => {
  direction = dir;
  if (replace) location.replace('#' + path); else location.hash = path;
};
export const currentPath = () => (location.hash.slice(1) || '/').split('?')[0];
export const hashQuery = () => new URLSearchParams((location.hash.split('?')[1]) || '');
export const onRoute = (fn) => listeners.add(fn);
export const setNavContext = (ids) => { navCtx = ids; };
export const getNavContext = () => navCtx;
export const back = () => (history.length > 1 ? history.back() : navigate('/'));

export function start(outlet) {
  const render = () => {
    const path = currentPath();
    let match = null;
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) { match = { r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) }; break; }
    }
    if (!match) return navigate('/', { replace: true });
    current?.destroy?.();
    outlet.scrollTop = 0;
    // Contenedor nuevo por vista: así los listeners de la vista anterior desaparecen con ella.
    const host = document.createElement('div');
    host.className = direction ? `view-enter-${direction}` : 'view-enter';
    outlet.replaceChildren(host);
    outlet.classList.toggle('no-nav', !match.r.view.nav);
    current = match.r.view.mount(host, match.params) || {};
    listeners.forEach((fn) => fn(path, match.r.view));
    direction = '';
    lastPath = path;
  };
  window.addEventListener('hashchange', render);
  on('notes:changed', () => current?.update?.());
  on('selection:changed', () => current?.update?.());
  render();
  return { rerender: render, lastPath: () => lastPath };
}
