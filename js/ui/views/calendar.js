import * as Notes from '../../notes/notes.js';
import { appBar, emptyState, iconBtn } from '../components.js';
import { groupByDay, monthGrid, effectiveDate } from '../../calendar/calendar.js';
import { dayKey, esc, fmtDay, fmtMonth, fmtTime } from '../../core/util.js';
import { icon } from '../../core/icons.js';
import { navigate, setNavContext } from '../router.js';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
let view = null, selected = dayKey(Date.now());

export default {
  nav: true, fab: true,
  mount(root) {
    view ??= { y: new Date().getFullYear(), m: new Date().getMonth() };
    const render = () => {
      const groups = groupByDay(Notes.active());
      const cells = monthGrid(view.y, view.m);
      const today = dayKey(Date.now());
      const [sy, sm, sd] = selected.split('-').map(Number);
      const items = groups.get(selected) || [];
      root.innerHTML = `
        ${appBar({ title: 'Calendario', large: true, actions: `<button class="btn text" data-act="today">Hoy</button>` })}
        <div class="cal">
          <div class="cal-head">${iconBtn('prev', 'left', 'Mes anterior')}<h2>${cap(fmtMonth(new Date(view.y, view.m, 1)))}</h2>${iconBtn('next', 'right', 'Mes siguiente')}</div>
          <div class="cal-grid" role="grid">
            ${DOW.map((d) => `<div class="dow" role="columnheader">${d}</div>`).join('')}
            ${cells.map((d) => {
              if (!d) return '<div></div>';
              const k = dayKey(d.getTime());
              const list = groups.get(k);
              const hi = list?.some((n) => !n.done && n.priority === 'high');
              return `<button class="cal-day ${k === today ? 'today' : ''} ${k === selected ? 'sel' : ''}" data-day="${k}" aria-label="${fmtDay(d.getTime())}${list ? `, ${list.length} notas` : ''}" aria-pressed="${k === selected}">
                ${d.getDate()}${list ? `<span class="mark"><i class="${hi ? 'hi' : ''}"></i>${list.length > 1 ? '<i></i>' : ''}${list.length > 2 ? '<i></i>' : ''}</span>` : ''}</button>`;
            }).join('')}
          </div>
        </div>
        <div class="section-head" style="margin-top:12px"><h2>${cap(fmtDay(new Date(sy, sm - 1, sd).getTime()))}</h2></div>
        ${items.length ? `<div class="list" data-nav-list>${items.map((n) => `
          <button class="agenda-item ${n.done ? 'done' : ''}" data-id="${n.id}">
            <time>${fmtTime(effectiveDate(n))}</time><span class="t">${esc(n.title)}</span>
            <span class="p-${n.priority}"><i class="dot"></i></span>${n.reminder ? icon('bell') : ''}${n.favorite ? `<span style="color:var(--star)">${icon('star')}</span>` : ''}
          </button>`).join('')}</div>` : emptyState('calendar', 'Sin notas este día')}`;
    };
    render();
    root.addEventListener('click', (e) => {
      const day = e.target.closest('[data-day]');
      if (day) { selected = day.dataset.day; render(); return; }
      const item = e.target.closest('.agenda-item');
      if (item) { setNavContext([...root.querySelectorAll('.agenda-item')].map((x) => x.dataset.id)); navigate(`/note/${item.dataset.id}`); return; }
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'prev' || act === 'next') {
        view.m += act === 'next' ? 1 : -1;
        if (view.m < 0) { view.m = 11; view.y--; } if (view.m > 11) { view.m = 0; view.y++; }
        render();
      }
      if (act === 'today') { const t = new Date(); view = { y: t.getFullYear(), m: t.getMonth() }; selected = dayKey(t.getTime()); render(); }
    });
    return { update: render };
  },
};
