import { esc, fmtDate, fmtTime, fmtDuration, relDay } from '../core/util.js';
import { icon } from '../core/icons.js';
import { snippet } from '../search/search-index.js';

export const PRIORITIES = [
  { id: 'high', label: 'Alta', emoji: '🔴' },
  { id: 'medium', label: 'Media', emoji: '🟠' },
  { id: 'low', label: 'Baja', emoji: '🟢' },
];
export const prioLabel = (p) => PRIORITIES.find((x) => x.id === p)?.label ?? '';

export const appBar = ({ title, back = false, actions = '', large = false } = {}) => `
  <header class="appbar ${large ? 'large' : ''}">
    ${back ? `<button class="iconbtn" data-act="back" aria-label="Volver">${icon('back')}</button>` : ''}
    <h1>${esc(title)}</h1>${actions}
  </header>`;

export const iconBtn = (act, ic, label, extra = '') =>
  `<button class="iconbtn ${extra}" data-act="${act}" aria-label="${esc(label)}" title="${esc(label)}">${icon(ic)}</button>`;

export function statusBadge(n) {
  if (n.transcriptStatus === 'pending') return `<span class="badge pending" title="Se transcribirá al haber conexión">${icon('cloudOff')} Por transcribir</span>`;
  if (n.transcriptStatus === 'processing') return `<span class="badge pending"><span class="spinner" style="width:12px;height:12px;border-width:2px"></span> Transcribiendo</span>`;
  return '';
}

export function noteCard(n, { selected = false, selecting = false, query = '', i = 0 } = {}) {
  const frag = query ? snippet(n.text, query, esc) : esc((n.text || '').slice(0, 160));
  const title = query ? snippet(n.title, query, esc, 90) : esc(n.title);
  const rem = n.reminder?.at;
  return `
  <article class="card ${n.done ? 'done' : ''} ${selected ? 'selected' : ''}" data-id="${n.id}" role="button" tabindex="0" style="animation-delay:${Math.min(i, 8) * 30}ms"
    aria-label="${esc(n.title)}">
    <div class="card-top">
      <button class="iconbtn check ${n.done ? 'on' : ''}" data-act="done" aria-label="${n.done ? 'Marcar como pendiente' : 'Marcar como realizada'}" aria-pressed="${n.done}">${icon(n.done ? 'checkCircle' : 'circle')}</button>
      <h3 class="card-title">${title}</h3>
      <button class="iconbtn ${n.favorite ? 'on' : ''}" data-act="fav" aria-label="${n.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}" aria-pressed="${n.favorite}">${icon(n.favorite ? 'star' : 'starO')}</button>
    </div>
    ${frag ? `<p class="card-text">${frag}</p>` : ''}
    <div class="card-meta">
      <span>${relDay(n.createdAt)} · ${fmtTime(n.createdAt)}</span>
      <span class="tag p-${n.priority}" title="Prioridad ${prioLabel(n.priority)}"><i class="dot"></i>${prioLabel(n.priority)}</span>
      <span class="tag">${n.done ? 'Realizada' : 'Pendiente'}</span>
      ${n.hasAudio ? `<span class="tag" title="Tiene audio">${icon('volume')}${fmtDuration(n.audioDuration)}</span>` : ''}
      ${rem ? `<span class="tag" title="Recordatorio ${fmtDate(rem)} ${fmtTime(rem)}">${icon('bell')}${relDay(rem)} ${fmtTime(rem)}</span>` : ''}
      ${n.category ? `<span class="badge">${esc(n.category)}</span>` : ''}
      ${statusBadge(n)}
    </div>
    ${selecting ? `<span class="selbox">${icon(selected ? 'checkCircle' : 'circle')}</span>` : ''}
  </article>`;
}

export const cardList = (notes, opts = {}) =>
  `<div class="list" data-nav-list>${notes.map((n, i) => noteCard(n, { ...opts, selected: opts.selectedIds?.has(n.id), i })).join('')}</div>`;

export const emptyState = (ic, text, sub = '') =>
  `<div class="empty">${icon(ic)}<p>${esc(text)}</p>${sub ? `<p style="font:var(--t-body-m);margin-top:4px">${esc(sub)}</p>` : ''}</div>`;

export const prioChips = (current, attr = 'data-prio') =>
  PRIORITIES.map((p) => `<button class="chip p-${p.id}" ${attr}="${p.id}" aria-pressed="${current === p.id}"><i class="dot"></i>${p.label}</button>`).join('');
