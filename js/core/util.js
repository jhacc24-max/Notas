export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

/** Minúsculas y sin acentos (para búsqueda y comparación). */
export const normalize = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const debounce = (fn, ms = 150) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

const lang = 'es';
const fDate = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric' });
const fDateLong = new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' });
const fDay = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long' });
const fTime = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hour12: false });
const fMonth = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' });

export const fmtDate = (ms) => fDate.format(ms);
export const fmtDateLong = (ms) => fDateLong.format(ms);
export const fmtDay = (ms) => fDay.format(ms);
export const fmtTime = (ms) => fTime.format(ms);
export const fmtMonth = (ms) => fMonth.format(ms);
export const fmtDateTime = (ms) => `${fmtDate(ms)} · ${fmtTime(ms)}`;

export const fmtDuration = (sec) => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const dayKey = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
/** ms -> valor para <input type="datetime-local"> */
export const toLocalInput = (ms) => {
  const d = new Date(ms);
  return `${dayKey(ms)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const relDay = (ms) => {
  const diff = Math.round((startOfDay(ms) - startOfDay(Date.now())) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  return fmtDate(ms);
};

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
