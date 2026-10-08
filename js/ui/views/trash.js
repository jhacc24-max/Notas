import * as Notes from '../../notes/notes.js';
import { appBar, iconBtn, emptyState } from '../components.js';
import { confirmDialog, toast } from '../dialogs.js';
import { esc, fmtDate } from '../../core/util.js';
import { icon } from '../../core/icons.js';
import { navigate } from '../router.js';

export default {
  nav: false,
  mount(root) {
    const render = () => {
      const list = Notes.trashed();
      root.innerHTML = `
        ${appBar({ title: 'Papelera', back: true, actions: list.length ? iconBtn('empty', 'delete', 'Vaciar papelera') : '' })}
        <p class="nav-hint">Las notas se eliminan definitivamente a los ${Notes.TRASH_RETENTION_DAYS} días.</p>
        ${list.length ? `<div class="list">${list.map((n) => `
          <div class="card" data-id="${n.id}"><div class="card-top"><h3 class="card-title">${esc(n.title)}</h3></div>
            <p class="card-text">${esc((n.text || '').slice(0, 120))}</p>
            <div class="card-meta"><span>Eliminada el ${fmtDate(n.deletedAt)}</span><span class="sp"></span>
              <button class="btn text" data-act="restore">${icon('restore')}Restaurar</button>
              <button class="btn text danger" data-act="purge">Eliminar</button></div></div>`).join('')}</div>`
          : emptyState('delete', 'La papelera está vacía')}`;
    };
    render();
    root.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      const id = e.target.closest('.card')?.dataset.id;
      if (act === 'back') history.length > 1 ? history.back() : navigate('/');
      if (act === 'restore') { await Notes.restore([id]); toast('Nota restaurada'); }
      if (act === 'purge' && await confirmDialog({ title: '¿Eliminar definitivamente?', text: 'No se podrá recuperar.', ok: 'Eliminar', danger: true })) await Notes.purge([id]);
      if (act === 'empty' && await confirmDialog({ title: '¿Vaciar la papelera?', text: 'Se eliminarán definitivamente todas las notas.', ok: 'Vaciar', danger: true })) await Notes.emptyTrash();
    });
    return { update: render };
  },
};
