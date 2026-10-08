import { esc, toLocalInput } from '../core/util.js';
import { icon } from '../core/icons.js';
import { on } from '../core/events.js';

const root = () => document.getElementById('overlay');

function mountScrim(inner, { sheet = false, dismiss = true, onClose } = {}) {
  const el = document.createElement('div');
  el.className = `scrim ${sheet ? 'sheet-wrap' : ''}`;
  el.innerHTML = inner;
  const close = (v) => { el.remove(); document.removeEventListener('keydown', onKey); onClose?.(v); };
  const onKey = (e) => e.key === 'Escape' && dismiss && close(undefined);
  document.addEventListener('keydown', onKey);
  el.addEventListener('click', (e) => { if (e.target === el && dismiss) close(undefined); });
  root().appendChild(el);
  el.querySelector('[autofocus], button, input')?.focus?.({ preventScroll: true });
  return { el, close };
}

/** Confirmación. Resuelve true/false. */
export function confirmDialog({ title, text = '', ok = 'Aceptar', cancel = 'Cancelar', danger = false }) {
  return new Promise((resolve) => {
    const { el, close } = mountScrim(`
      <div class="dialog" role="alertdialog" aria-modal="true" aria-label="${esc(title)}">
        <h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}
        <div class="actions">
          <button class="btn text" data-r="0">${esc(cancel)}</button>
          <button class="btn text ${danger ? 'danger' : ''}" data-r="1">${esc(ok)}</button>
        </div></div>`, { onClose: (v) => resolve(v === true) });
    el.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => close(b.dataset.r === '1')));
  });
}

/** Hoja inferior con opciones. items: [{id,label,icon,danger}] -> resuelve id | undefined. */
export function menuSheet({ title = '', items }) {
  return new Promise((resolve) => {
    const { el, close } = mountScrim(`
      <div class="sheet" role="menu">${title ? `<h2>${esc(title)}</h2>` : ''}
        ${items.map((it) => `<button class="menu-item ${it.danger ? 'danger' : ''}" data-id="${it.id}" role="menuitem">${it.icon ? icon(it.icon) : ''}${esc(it.label)}</button>`).join('')}
      </div>`, { sheet: true, onClose: resolve });
    el.querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => close(b.dataset.id)));
  });
}

/** Selector de fecha/hora para el recordatorio. Resuelve { at } | { remove:true } | undefined. */
export function reminderDialog({ at, withGoogle, calendarLink, onIcs }) {
  return new Promise((resolve) => {
    const def = at ?? (() => { const d = new Date(Date.now() + 3600e3); d.setMinutes(0, 0, 0); return d.getTime(); })();
    const { el, close } = mountScrim(`
      <div class="dialog" role="dialog" aria-modal="true" aria-label="Recordatorio">
        <h2>${at ? 'Modificar recordatorio' : 'Añadir recordatorio'}</h2>
        <div class="field"><label for="rem-at">Fecha y hora</label><input id="rem-at" type="datetime-local" value="${toLocalInput(def)}" autofocus></div>
        <p>${withGoogle ? 'Se creará también una tarea en Google Tasks (Google solo conserva la fecha, no la hora).'
          : 'Aviso dentro de la app. Para avisos con la app cerrada, conecta Google Tasks en Ajustes o usa Google Calendar.'}</p>
        <div class="actions" style="justify-content:flex-start">
          <a class="btn text" href="${esc(calendarLink)}" target="_blank" rel="noopener" data-cal>Google Calendar</a>
          <button class="btn text" data-ics>Archivo .ics</button>
        </div>
        <div class="actions">
          ${at ? '<button class="btn text danger" data-del>Eliminar</button>' : ''}
          <button class="btn text" data-cancel>Cancelar</button>
          <button class="btn filled" data-ok>Guardar</button>
        </div></div>`, { onClose: resolve });
    const input = el.querySelector('#rem-at');
    el.querySelector('[data-cancel]').onclick = () => close(undefined);
    el.querySelector('[data-del]')?.addEventListener('click', () => close({ remove: true }));
    el.querySelector('[data-ics]').onclick = () => input.value && onIcs(new Date(input.value).getTime());
    el.querySelector('[data-cal]').addEventListener('click', (e) => {
      if (!input.value) return e.preventDefault();
      const t = new Date(input.value).getTime();
      e.currentTarget.href = calendarLink.replace(/dates=[^&]*/, '') + `&dates=${fmtG(t)}/${fmtG(t + 900000)}`;
    });
    el.querySelector('[data-ok]').onclick = () => { if (input.value) close({ at: new Date(input.value).getTime() }); };
  });
}
const fmtG = (ms) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, '');

/** Diálogo de compartir (incluye audio opcional + alternativas). Resuelve { withAudio } | undefined. */
export function shareDialog({ count, hasAudio, withAudio }) {
  return new Promise((resolve) => {
    const { el, close } = mountScrim(`
      <div class="dialog" role="dialog" aria-modal="true" aria-label="Compartir">
        <h2>Compartir ${count === 1 ? 'nota' : count + ' notas'}</h2>
        <p>Se incluye título, fecha, hora, texto, prioridad y estado.</p>
        ${hasAudio ? `<label class="switch-row" style="padding:0"><span class="grow">Incluir audio<small>Adjunta la grabación original</small></span><input class="switch" type="checkbox" id="sh-audio" ${withAudio ? 'checked' : ''}></label>` : ''}
        <div class="actions"><button class="btn text" data-cancel>Cancelar</button><button class="btn filled" data-ok>${icon('share')}Compartir</button></div>
      </div>`, { onClose: resolve });
    el.querySelector('[data-cancel]').onclick = () => close(undefined);
    el.querySelector('[data-ok]').onclick = () => close({ withAudio: !!el.querySelector('#sh-audio')?.checked });
  });
}

/** Snackbar con acción opcional. */
export function toast(text, { action, onAction, ms = 4500 } = {}) {
  root().querySelectorAll('.snackbar').forEach((s) => s.remove());
  const el = document.createElement('div');
  el.className = 'snackbar';
  el.setAttribute('role', 'status');
  el.innerHTML = `<span>${esc(text)}</span>${action ? `<button>${esc(action)}</button>` : ''}`;
  el.querySelector('button')?.addEventListener('click', () => { el.remove(); onAction?.(); });
  root().appendChild(el);
  setTimeout(() => el.remove(), ms);
}
on('toast', ({ text }) => toast(text));

/** Alta rápida desde el calendario. mode: 'note' | 'reminder'. Resuelve {title,text,at,priority} | undefined. */
export function quickAddDialog({ mode, dayMs, defaultAt }) {
  return new Promise((resolve) => {
    const isRem = mode === 'reminder';
    const day = new Date(dayMs);
    const at = defaultAt ?? new Date(day.getFullYear(), day.getMonth(), day.getDate(), new Date().getHours() + 1, 0).getTime();
    let prio = 'medium';
    const { el, close } = mountScrim(`
      <div class="dialog" role="dialog" aria-modal="true" aria-label="${isRem ? 'Nuevo recordatorio' : 'Nueva nota'}">
        <h2>${isRem ? 'Nuevo recordatorio' : 'Nueva nota'}</h2>
        <div class="field"><label for="qa-title">${isRem ? 'Qué recordar' : 'Título'}</label><input id="qa-title" autofocus autocomplete="off" placeholder="${isRem ? 'Ej.: Llamar al médico' : 'Ej.: Control de presión'}"></div>
        ${isRem ? '' : '<div class="field"><label for="qa-text">Texto (opcional)</label><textarea id="qa-text" rows="3"></textarea></div>'}
        <div class="field"><label for="qa-at">${isRem ? 'Fecha y hora' : 'Hora'}</label><input id="qa-at" type="${isRem ? 'datetime-local' : 'time'}" value="${isRem ? toLocalInput(at) : toLocalInput(at).slice(11)}"></div>
        <div class="chips" style="padding:0" role="group" aria-label="Prioridad">
          ${[['high', 'Alta'], ['medium', 'Media'], ['low', 'Baja']].map(([id, l]) => `<button class="chip p-${id}" data-prio="${id}" aria-pressed="${id === prio}"><i class="dot"></i>${l}</button>`).join('')}
        </div>
        <div class="actions"><button class="btn text" data-cancel>Cancelar</button><button class="btn filled" data-ok>Guardar</button></div>
      </div>`, { onClose: resolve });
    el.querySelectorAll('[data-prio]').forEach((b) => b.addEventListener('click', () => {
      prio = b.dataset.prio;
      el.querySelectorAll('[data-prio]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    el.querySelector('[data-cancel]').onclick = () => close(undefined);
    el.querySelector('[data-ok]').onclick = () => {
      const title = el.querySelector('#qa-title').value.trim();
      const v = el.querySelector('#qa-at').value;
      if (!title && isRem) { el.querySelector('#qa-title').focus(); return; }
      if (!v) return;
      const when = isRem ? new Date(v).getTime()
        : new Date(day.getFullYear(), day.getMonth(), day.getDate(), +v.slice(0, 2), +v.slice(3, 5)).getTime();
      close({ title, text: el.querySelector('#qa-text')?.value.trim() ?? '', at: when, priority: prio });
    };
  });
}
