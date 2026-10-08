// Calendario: vistas Mes y Semana, títulos por día, filtros, gestos y alta rápida de nota/recordatorio.
import * as Notes from '../../notes/notes.js';
import { appBar, filterBar, bindFilters } from '../components.js';
import { groupByDay, monthGrid, effectiveDate } from '../../calendar/calendar.js';
import { dayKey, esc, fmtDay, fmtMonth, fmtTime, startOfDay } from '../../core/util.js';
import { icon } from '../../core/icons.js';
import { navigate, setNavContext } from '../router.js';
import { quickAddDialog, toast } from '../dialogs.js';
import { setReminder, reminderToast } from '../../reminders/service.js';
import { requestNotificationPermission } from '../../reminders/reminders.js';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const WD = new Intl.DateTimeFormat('es', { weekday: 'long' });
const SHORT = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

// Estado que se conserva al salir y volver al calendario.
const st = { mode: 'month', cursor: startOfDay(Date.now()), selected: dayKey(Date.now()), status: 'all', priority: 'all', kind: 'all' };
const KEYS = ['mode', 'status', 'priority', 'kind'];

const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (ms, n) => { const d = new Date(ms); d.setDate(d.getDate() + n); return d.getTime(); };
const addMonths = (ms, n) => { const d = new Date(ms); d.setDate(1); d.setMonth(d.getMonth() + n); return d.getTime(); };
const weekStart = (ms) => { const d = new Date(ms); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); d.setHours(0, 0, 0, 0); return d.getTime(); };

const visible = () => Notes.active().filter((n) =>
  (st.status === 'all' || (st.status === 'done') === n.done) && (st.priority === 'all' || n.priority === st.priority)
  && (st.kind === 'all' || (st.kind === 'none' ? !n.kind : n.kind === st.kind)));

const agendaItem = (n) => `
  <button class="agenda-item ${n.done ? 'done' : ''} ${n.kind ? 'k-' + n.kind : ''}" data-id="${n.id}">
    <time>${fmtTime(effectiveDate(n))}</time><span class="t">${esc(n.title)}</span>
    <span class="p-${n.priority}" title="Prioridad"><i class="dot"></i></span>${n.reminder ? icon('bell') : ''}${n.favorite ? `<span style="color:var(--star)">${icon('star')}</span>` : ''}
  </button>`;

export default {
  nav: true,
  mount(root) {
    const render = (dir = '') => {
      const groups = groupByDay(visible());
      const today = dayKey(Date.now());
      const cur = new Date(st.cursor);
      const ws = weekStart(st.cursor);
      const title = st.mode === 'month' ? cap(fmtMonth(cur.getTime()))
        : `${SHORT.format(ws)} – ${SHORT.format(addDays(ws, 6))} ${new Date(addDays(ws, 6)).getFullYear()}`;

      let body;
      if (st.mode === 'month') {
        const cells = monthGrid(cur.getFullYear(), cur.getMonth());
        body = `
          <div class="cal-grid" role="grid">
            ${DOW.map((d) => `<div class="dow" role="columnheader">${d}</div>`).join('')}
            ${cells.map((d) => {
              if (!d) return '<div></div>';
              const k = dayKey(d.getTime()), list = groups.get(k) || [];
              return `<button class="cal-cell ${k === today ? 'today' : ''} ${k === st.selected ? 'sel' : ''}" data-day="${k}"
                aria-label="${fmtDay(d.getTime())}${list.length ? `, ${list.length} notas` : ''}" aria-pressed="${k === st.selected}">
                <span class="num">${d.getDate()}</span>
                ${list.slice(0, 2).map((n) => `<span class="ev p-bg-${n.priority} ${n.kind ? 'k-' + n.kind : ''} ${n.done ? 'done' : ''}">${esc(n.title)}</span>`).join('')}
                ${list.length > 2 ? `<span class="more">+${list.length - 2}</span>` : ''}</button>`;
            }).join('')}
          </div>
          ${dayPanel(st.selected, groups.get(st.selected) || [], true)}`;
      } else {
        body = Array.from({ length: 7 }, (_, i) => {
          const ms = addDays(ws, i), k = dayKey(ms);
          return dayPanel(k, groups.get(k) || [], false, ms, k === today);
        }).join('');
      }

      root.innerHTML = `
        ${appBar({ title: 'Calendario', large: true, actions: '<button class="btn text" data-act="today">Hoy</button>' })}
        ${filterBar(st, KEYS)}
        <div class="cal">
          <div class="cal-head"><button class="iconbtn" data-act="prev" aria-label="Anterior">${icon('left')}</button><h2>${title}</h2><button class="iconbtn" data-act="next" aria-label="Siguiente">${icon('right')}</button></div>
          <div class="cal-body ${dir ? 'slide-' + dir : ''}" id="cal-body">${body}</div>
          <p class="nav-hint">Desliza ← → para cambiar de ${st.mode === 'month' ? 'mes' : 'semana'}</p>
        </div>`;
    };

    function dayPanel(k, list, withHeader, ms = parseKey(k).getTime(), isToday = false) {
      const label = `${cap(WD.format(ms))} ${SHORT.format(ms)}`;
      return `<section class="day ${k === st.selected && !withHeader ? 'sel' : ''} ${isToday ? 'today' : ''}" data-dayp="${k}">
        <div class="section-head" style="padding-left:4px"><h2>${withHeader ? cap(fmtDay(ms)) : `${label}${isToday ? ' · Hoy' : ''}`}</h2>
          <span class="day-actions"><button class="btn tonal sm" data-add="note" data-day="${k}">${icon('add')}Nota</button><button class="btn tonal sm" data-add="reminder" data-day="${k}">${icon('bell')}Recordatorio</button></span></div>
        ${list.length ? `<div class="list" style="padding:0" data-nav-list>${list.map(agendaItem).join('')}</div>` : `<p class="day-empty">Sin notas</p>`}
      </section>`;
    }

    const move = (n) => {
      st.cursor = st.mode === 'month' ? addMonths(st.cursor, n) : addDays(st.cursor, 7 * n);
      render(n > 0 ? 'left' : 'right');
    };

    const addToDay = async (kind, k) => {
      const res = await quickAddDialog({ mode: kind, dayMs: parseKey(k).getTime() });
      if (!res) return;
      const n = await Notes.create({
        title: res.title, text: res.text, priority: res.priority, kind: res.kind, transcriptStatus: 'none',
        createdAt: kind === 'note' ? res.at : Date.now(),
      });
      if (kind === 'reminder') {
        const r = await setReminder(n, res.at);
        requestNotificationPermission();
        toast(reminderToast(r));
        st.selected = dayKey(res.at);
      } else { toast('Nota creada'); st.selected = k; }
      st.cursor = parseKey(st.selected).getTime();
    };

    render();
    bindFilters(root, st, KEYS, () => render());
    root.addEventListener('click', async (e) => {
      const t = e.target;
      const add = t.closest('[data-add]');
      if (add) { await addToDay(add.dataset.add, add.dataset.day); return; }
      const cell = t.closest('[data-day].cal-cell');
      if (cell) { st.selected = cell.dataset.day; render(); return; }
      const dp = t.closest('.day[data-dayp]');
      const item = t.closest('.agenda-item');
      if (item) {
        setNavContext([...item.closest('[data-nav-list]').querySelectorAll('.agenda-item')].map((x) => x.dataset.id));
        navigate(`/note/${item.dataset.id}`); return;
      }
      if (dp && st.mode === 'week' && !t.closest('button')) { st.selected = dp.dataset.dayp; render(); return; }
      const act = t.closest('[data-act]')?.dataset.act;
      if (act === 'prev') move(-1);
      if (act === 'next') move(1);
      if (act === 'today') { st.cursor = startOfDay(Date.now()); st.selected = dayKey(Date.now()); render(); }
      if (act === 'back') navigate('/');
    });

    // Deslizar horizontalmente para cambiar de mes/semana.
    let sx = 0, sy = 0, tracking = false, moved = false;
    root.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.fbar,.dialog')) return;
      tracking = true; moved = false; sx = e.clientX; sy = e.clientY;
    });
    root.addEventListener('pointermove', (e) => {
      if (tracking && Math.abs(e.clientX - sx) > 12 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) moved = true;
    });
    const end = (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - sx;
      if (moved && Math.abs(dx) > 70) { swiped = true; setTimeout(() => { swiped = false; }, 50); move(dx < 0 ? 1 : -1); }
    };
    let swiped = false;
    root.addEventListener('click', (e) => { if (swiped) { e.stopPropagation(); e.preventDefault(); } }, true);
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', () => { tracking = false; });

    return { update: () => render() };
  },
};
