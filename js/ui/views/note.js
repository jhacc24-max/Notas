// Vista de nota: lectura amplia, pantalla completa, edición, audio, recordatorio y gestos laterales.
import * as Notes from '../../notes/notes.js';
import { appBar, iconBtn, prioChips, statusBadge, kindChips, kindBadge } from '../components.js';
import { mountPlayer } from '../player.js';
import { getNavContext, navigate } from '../router.js';
import { deleteNotes, shareUI, reminderUI, syncNoteChange } from '../actions.js';
import { menuSheet, toast } from '../dialogs.js';
import { esc, fmtDateLong, fmtTime, fmtDateTime } from '../../core/util.js';
import { icon } from '../../core/icons.js';
import { processQueue } from '../../transcription/index.js';
import { queueApi } from '../../app-services.js';
import { clearReminder } from '../../reminders/service.js';
import { getSetting } from '../../settings/settings.js';
import { on } from '../../core/events.js';
import { mountDictPicker } from '../dict-picker.js';

let fullscreen = false;

export default {
  nav: false,
  mount(root, { id }) {
    if (!Notes.get(id) || Notes.get(id).deletedAt) { navigate('/', { replace: true }); return {}; }
    let editing = false, player = null, audioToken = 0;
    const ctx = getNavContext();
    const idx = ctx.indexOf(id);
    const neighbor = (d) => (idx >= 0 ? ctx.find((x, i) => i === idx + d && Notes.get(x) && !Notes.get(x).deletedAt) : undefined);

    function render() {
      const n = Notes.get(id);
      if (!n || n.deletedAt) return;
      const rem = n.reminder;
      const keep = player ? root.querySelector('#player-host') : null; // conserva el audio sonando al re-renderizar
      root.innerHTML = `
        ${appBar({
          title: '', back: true,
          actions: iconBtn('fav', n.favorite ? 'star' : 'starO', n.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos', n.favorite ? 'on' : '')
            + iconBtn('edit', editing ? 'check' : 'edit', editing ? 'Terminar edición' : 'Editar', editing ? 'primary' : '')
            + iconBtn('fs', 'fullscreen', 'Pantalla completa')
            + iconBtn('more', 'more', 'Más opciones'),
        })}
        <div class="reader ${fullscreen ? 'reader-full' : ''}" id="reader">
          ${fullscreen ? `<button class="iconbtn" data-act="fs" style="position:fixed;top:calc(var(--safe-t) + 8px);right:8px;background:var(--md-surface-c-high)" aria-label="Salir de pantalla completa">${icon('fullscreenExit')}</button>` : ''}
          <div class="page" style="${fullscreen ? 'padding:0' : ''}">
            ${editing ? `<input class="title-input" id="f-title" value="${esc(n.title)}" aria-label="Título" placeholder="Título">`
              : `<h2 class="note-title">${esc(n.title)}</h2>`}
            <div class="meta-line"><span>${fmtDateLong(n.createdAt)} · ${fmtTime(n.createdAt)}</span>${n.kind ? kindBadge(n.kind) : ''}${n.category && !editing ? `<span class="badge">${esc(n.category)}</span>` : ''}${statusBadge(n)}</div>
            ${fullscreen ? '' : `
            <button class="status-toggle ${n.done ? 'done' : ''}" data-act="done" aria-pressed="${n.done}">
              ${icon(n.done ? 'checkCircle' : 'circle')}<span>${n.done ? 'Realizada' : 'Pendiente'}</span></button>
            <div class="chips" style="padding:0" role="group" aria-label="Prioridad">${prioChips(n.priority)}</div>
            <div class="chips" style="padding:0" role="group" aria-label="Tipo">${kindChips(n.kind)}</div>
            ${rem ? `<div class="reminder-row">${icon('bell')}<div class="grow"><b>${fmtDateTime(rem.at)}</b>${rem.taskId ? 'Sincronizado con Google Tasks' : 'Recordatorio activo'}</div>
              <button class="btn text" data-act="reminder">Cambiar</button><button class="iconbtn" data-act="rm-reminder" aria-label="Eliminar recordatorio">${icon('close')}</button></div>`
              : `<button class="btn tonal" data-act="reminder" style="align-self:flex-start">${icon('bell')} Añadir recordatorio</button>`}`}
            ${editing ? `<div class="field"><label for="f-cat">Categoría (opcional)</label><input id="f-cat" value="${esc(n.category)}" placeholder="Ej.: Consulta, Medicación…" list="cats"></div>
              <datalist id="cats">${[...new Set(Notes.active().map((x) => x.category).filter(Boolean))].map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
              <textarea class="transcript" id="f-text" aria-label="Texto de la nota" lang="es" spellcheck="true">${esc(n.text)}</textarea>`
              : `<div class="transcript selectable ${n.text ? '' : 'empty-t'}">${n.text ? esc(n.text) : 'Esta nota no tiene texto.'}</div>`}
            ${n.transcriptStatus === 'pending' && !editing ? `<div class="note-info">${icon('cloudOff')} Pendiente de transcribir.
              ${navigator.onLine && getSetting('transcriptionEndpoint') ? '<button class="btn text" data-act="transcribe">Transcribir ahora</button>' : 'Se hará al haber conexión y servicio configurado.'}</div>` : ''}
            ${n.transcriptStatus === 'processing' ? `<div class="processing"><span class="spinner"></span>Transcribiendo…</div>` : ''}
            ${fullscreen ? '' : '<div id="player-host"></div>'}
            ${fullscreen ? '' : `<p class="nav-hint">${idx >= 0 && ctx.length > 1 ? `${idx + 1} / ${ctx.length} · desliza ← → para cambiar de nota` : ''}</p>`}
          </div>
        </div>`;
      const slot = root.querySelector('#player-host');
      if (keep && slot) slot.replaceWith(keep);
      else { player?.destroy(); player = null; attachPlayer(n); }
      if (editing && !root.querySelector('#f-title:focus')) root.querySelector('#f-text')?.focus();
    }

    async function attachPlayer(n) {
      const host = root.querySelector('#player-host');
      if (!host || !n.hasAudio) return;
      const token = ++audioToken;
      const a = await Notes.getAudio(id);
      if (token !== audioToken || !a?.blob || !root.contains(host)) return;
      player = mountPlayer(host, a.blob, a.duration || n.audioDuration);
    }

    const saveEdits = async () => {
      const title = root.querySelector('#f-title')?.value ?? undefined;
      const text = root.querySelector('#f-text')?.value;
      const category = root.querySelector('#f-cat')?.value.trim();
      if (text == null) return;
      await Notes.update(id, { title, text, category }, { silent: true });
      syncNoteChange(Notes.get(id));
    };

    root.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act],[data-prio],[data-kind]');
      if (!b) return;
      const n = Notes.get(id);
      if (b.dataset.prio) { await Notes.setPriority(id, b.dataset.prio); return; }
      if (b.dataset.kind) { await Notes.update(id, { kind: n.kind === b.dataset.kind ? '' : b.dataset.kind }); return; }
      switch (b.dataset.act) {
        case 'back': history.length > 1 ? history.back() : navigate('/'); break;
        case 'fav': await Notes.toggleFavorite(id); break;
        case 'done': await Notes.toggleDone(id); syncNoteChange(Notes.get(id)); break;
        case 'edit': if (editing) await saveEdits(); editing = !editing; render(); if (!editing) toast('Cambios guardados'); break;
        case 'fs': toggleFs(); break;
        case 'reminder': await reminderUI(n); break;
        case 'rm-reminder': await clearReminder(n); toast('Recordatorio eliminado'); break;
        case 'transcribe': processQueue(queueApi()); break;
        case 'more': {
          const c = await menuSheet({ items: [
            { id: 'share', label: 'Compartir', icon: 'share' },
            { id: 'reminder', label: n.reminder ? 'Modificar recordatorio' : 'Añadir recordatorio', icon: 'bell' },
            { id: 'edit', label: 'Editar texto y título', icon: 'edit' },
            { id: 'delete', label: 'Eliminar', icon: 'delete', danger: true },
          ] });
          if (c === 'share') shareUI([n]);
          if (c === 'reminder') reminderUI(n);
          if (c === 'edit') { editing = true; render(); }
          if (c === 'delete' && await deleteNotes([id])) leave();
          break;
        }
      }
    });

    // Tras eliminar la nota se vuelve a la lista de notas (sin dejar la nota borrada en el historial).
    let left = false;
    const leave = () => { if (left) return; left = true; navigate('/list', { replace: true }); };

    // Pantalla completa (API nativa si existe + modo lector en CSS como respaldo).
    function toggleFs() {
      fullscreen = !fullscreen;
      if (fullscreen) document.documentElement.requestFullscreen?.().catch(() => {});
      else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      render();
    }
    const onFsChange = () => { if (!document.fullscreenElement && fullscreen) { fullscreen = false; render(); } };
    document.addEventListener('fullscreenchange', onFsChange);

    // Gestos: deslizar izquierda → siguiente, derecha → anterior.
    let sx = 0, sy = 0, dragging = false, locked = false, st = 0, swiped = false;
    root.addEventListener('pointerdown', (e) => {
      if (editing || e.target.closest('input,textarea,select,.player,.iconbtn')) return;
      dragging = true; locked = false; sx = e.clientX; sy = e.clientY; st = performance.now();
    });
    root.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!locked) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }
        if (Math.abs(dx) > 12) locked = true; else return;
      }
      const r = root.querySelector('#reader');
      const can = dx < 0 ? neighbor(1) : neighbor(-1);
      r.style.transition = 'none';
      r.style.transform = `translateX(${can ? dx : dx * 0.25}px)`;
      r.style.opacity = String(1 - Math.min(Math.abs(dx) / 500, 0.5));
    });
    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      const r = root.querySelector('#reader');
      const dx = e.clientX - sx;
      const fast = Math.abs(dx) / Math.max(performance.now() - st, 1) > 0.5;
      const target = dx < 0 ? neighbor(1) : neighbor(-1);
      swiped = locked;
      setTimeout(() => { swiped = false; }, 50);
      r.style.transition = 'transform var(--d-short) var(--ease), opacity var(--d-short)';
      if (locked && target && (Math.abs(dx) > 90 || (fast && Math.abs(dx) > 40))) {
        r.style.transform = `translateX(${dx < 0 ? -80 : 80}px)`; r.style.opacity = '0';
        setTimeout(() => navigate(`/note/${target}`, { replace: true, dir: dx < 0 ? 'left' : 'right' }), 90);
      } else { r.style.transform = ''; r.style.opacity = ''; }
    };
    // Un arrastre que empezó sobre un botón no debe activarlo al soltar.
    root.addEventListener('click', (e) => { if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; } }, true);
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);
    const onKey = (e) => {
      if (editing || e.target.matches?.('input,textarea')) return;
      if (e.key === 'ArrowLeft' && neighbor(-1)) navigate(`/note/${neighbor(-1)}`, { replace: true, dir: 'right' });
      if (e.key === 'ArrowRight' && neighbor(1)) navigate(`/note/${neighbor(1)}`, { replace: true, dir: 'left' });
    };
    document.addEventListener('keydown', onKey);

    const dict = mountDictPicker(root, {
      getText: () => (editing ? root.querySelector('#f-text')?.value : Notes.get(id)?.text) ?? '',
      setText: async (t) => {
        if (editing) root.querySelector('#f-text').value = t;
        else { await Notes.update(id, { text: t }); syncNoteChange(Notes.get(id)); }
      },
    });
    render();
    const off = on('settings:changed', () => !editing && render());
    return {
      update() {
        const n = Notes.get(id);
        if (!n || n.deletedAt) { leave(); return; }
        if (editing) return; // no pisar lo que se está escribiendo
        render();
      },
      destroy() { off(); dict.destroy(); player?.destroy(); document.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFsChange); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); },
    };
  },
};
