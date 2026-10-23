// Índice invertido en memoria (token -> ids). Búsqueda por prefijo con búsqueda binaria sobre el
// vocabulario ordenado: rápido con miles de notas. Ignora mayúsculas y acentos.
import { normalize } from '../core/util.js';

const tokenize = (s) => normalize(s).split(/[^a-z0-9ñ]+/).filter((t) => t.length > 0);

export class SearchIndex {
  constructor() { this.clear(); }
  clear() { this.map = new Map(); this.docs = new Map(); this.vocab = null; }

  upsert(note) {
    this.remove(note.id);
    const title = tokenize(note.title), body = tokenize(`${note.text} ${note.category || ''}`);
    const all = new Set([...title, ...body]);
    this.docs.set(note.id, { all, title: new Set(title), norm: normalize(`${note.title} ${note.text}`) });
    for (const t of all) {
      let s = this.map.get(t);
      if (!s) { s = new Set(); this.map.set(t, s); this.vocab = null; }
      s.add(note.id);
    }
  }
  remove(id) {
    const d = this.docs.get(id);
    if (!d) return;
    for (const t of d.all) {
      const s = this.map.get(t);
      s?.delete(id);
      if (s && !s.size) { this.map.delete(t); this.vocab = null; }
    }
    this.docs.delete(id);
  }

  _prefix(prefix) {
    this.vocab ??= [...this.map.keys()].sort();
    const v = this.vocab;
    let lo = 0, hi = v.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (v[m] < prefix) lo = m + 1; else hi = m; }
    const out = [];
    for (let i = lo; i < v.length && v[i].startsWith(prefix); i++) out.push(v[i]);
    return out;
  }

  /** Devuelve ids que contienen TODOS los términos (como prefijo). Orden: coincidencia en título primero. */
  search(query) {
    const qs = tokenize(query);
    if (!qs.length) return [];
    let result = null;
    const titleHits = new Map();
    for (const q of qs) {
      const ids = new Set();
      for (const tok of this._prefix(q)) {
        for (const id of this.map.get(tok)) {
          ids.add(id);
          if (this.docs.get(id).title.has(tok)) titleHits.set(id, (titleHits.get(id) || 0) + 1);
        }
      }
      // coincidencia por subcadena (p. ej. "dopa" dentro de "levodopa")
      if (q.length >= 3) {
        for (const [tok, set] of this.map) if (tok.includes(q) && !tok.startsWith(q)) for (const id of set) ids.add(id);
      }
      result = result ? new Set([...result].filter((id) => ids.has(id))) : ids;
      if (!result.size) return [];
    }
    return [...result].sort((a, b) => (titleHits.get(b) || 0) - (titleHits.get(a) || 0));
  }
}
export const searchIndex = new SearchIndex();

/** Fragmento con el término resaltado (devuelve HTML ya escapado). */
export function snippet(text, query, esc, len = 140) {
  const q = tokenize(query)[0];
  const src = String(text || '');
  if (!q) return esc(src.slice(0, len));
  const idx = normalize(src).indexOf(q);
  if (idx < 0) return esc(src.slice(0, len));
  const start = Math.max(0, idx - 40);
  const piece = src.slice(start, start + len);
  const i = idx - start;
  return `${start ? '…' : ''}${esc(piece.slice(0, i))}<mark>${esc(piece.slice(i, i + q.length))}</mark>${esc(piece.slice(i + q.length))}`;
}
