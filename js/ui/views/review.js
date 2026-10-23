// Revisión de la transcripción tras grabar: texto, reproductor, edición manual y guardado.
import * as Notes from '../../notes/notes.js';
import { appBar } from '../components.js';
import { getDraft, patchDraft, clearDraft, restoreDraft } from '../draft.js';
import { mountPlayer } from '../player.js';
import { navigate } from '../router.js';
import { toast, confirmDialog } from '../dialogs.js';
import { esc } from '../../core/util.js';
import { icon } from '../../core/icons.js';
import { on } from '../../core/events.js';
import { processQueue } from '../../transcription/index.js';
import { retryRemoteTranscription } from '../recording.js';
import { queueApi } from '../../app-services.js';
import { mountDictPicker } from '../dict-picker.js';
import { prioChips, kindChips } from '../components.js';
import { reminderPicker } from '../actions.js';
import { autoTitle } from '../../notes/titles.js';
import { setReminder, reminderToast } from '../../reminders/service.js';
import { requestNotificationPermission } from '../../reminders/reminders.js';
import { fmtDateTime } from '../../core/util.js';

/** Título mostrado: el que escribió el usuario o, si no, el generado a partir del texto. */
const titleOf = (d) => (d.titleEdited ? d.title : d.text?.trim() ? autoTitle(d.text, d.at) : '');
const metaOf = (d) => (d.meta ??= { priority: 'medium', kind: '', done: false, favorite: false, reminderAt: null });

function progressText(d) {
  const p = d.progress || {};
  const secs = d.startedAt ? Math.round((Date.now() - d.startedAt) / 1000) : 0;
  const t = secs ? ` (${secs} s)` : '';
  if (p.phase === 'download') return `Descargando el motor de voz gratuito (solo la primera vez): ${p.pct ?? 0}%${t}`;
  if (p.phase === 'transcribe') return `Transcribiendo… en teléfonos lentos puede tardar un par de minutos. Puedes guardar la nota: seguirá procesándose.${t}`;
  return `Preparando la transcripción…${t}`;
}

export default {
  nav: false,
  mount(root) {
    let player = null, editing = false, saved = false;
    const init = async () => {
      if (!getDraft()) await restoreDraft();
      if (!getDraft()) return navigate('/', { replace: true });
      render();
    };

    function render() {
      const d = getDraft();
      if (!d) return;
      const busy = d.status === 'transcribing';
      const note = {
        pending: 'Sin conexión: el audio se guardará y se transcribirá solo cuando haya Internet.',
        none: `No se detectó texto. ${d.diag || 'Puedes escribirlo o volver a grabar.'}`,
        error: `No se pudo transcribir${d.error ? ` (${d.error})` : ''}. Reintenta o escribe el texto.`,
      }[d.status];
      const m = metaOf(d);
      const wasPlaying = player && !player.audio.paused;
      root.innerHTML = `
        ${appBar({ title: 'Revisar nota', back: true })}
        <div class="page">
          <div class="field titlefield"><label for="f-title">Título</label>
            <input id="f-title" value="${esc(titleOf(d))}" maxlength="120" autocomplete="off" enterkeyhint="done" placeholder="${busy ? 'Se generará al terminar de transcribir…' : 'Escribe un título'}">
            <small>${d.titleEdited ? 'Título personalizado' : 'Generado automáticamente según el contenido · toca para cambiarlo'}</small></div>
          <div class="label-row"><span>Transcripción</span>
            ${busy ? '' : `<button class="btn tonal" data-act="edit" style="min-height:40px">${icon(editing ? 'check' : 'edit')}${editing ? 'Listo' : 'Editar'}</button>`}</div>
          ${busy ? `<div class="processing" role="status"><span class="spinner"></span><span id="prog">${esc(progressText(d))}</span></div>` : ''}
          ${editing
            ? `<textarea class="transcript" id="txt" aria-label="Texto de la transcripción" spellcheck="true" lang="es" placeholder="Escribe o corrige el texto…">${esc(d.text)}</textarea>`
            : `<div class="transcript selectable ${d.text ? '' : 'empty-t'}" id="txt">${d.text ? esc(d.text) : (busy ? '' : 'Sin texto. Toca «Editar» para escribirlo.')}</div>`}
          ${note ? `<div class="note-info">${icon('info', '')} ${esc(note)}${d.status === 'error' ? ' <button class="btn text" data-act="retry">Reintentar</button>' : ''}</div>` : ''}
          <div class="label-row" style="margin-top:4px"><span>Detalles</span></div>
          <div class="opts">
            <button class="status-toggle ${m.done ? 'done' : ''}" data-act="opt-done" aria-pressed="${m.done}">
              ${icon(m.done ? 'checkCircle' : 'circle')}<span>${m.done ? 'Realizada' : 'Pendiente'}</span></button>
            <div class="chips" style="padding:0" role="group" aria-label="Tipo">${kindChips(m.kind)}</div>
            <div class="chips" style="padding:0" role="group" aria-label="Prioridad">${prioChips(m.priority)}
              <button class="chip ${m.favorite ? 'sel' : ''}" data-act="opt-fav" aria-pressed="${m.favorite}">${icon(m.favorite ? 'star' : 'starO')}Favorita</button></div>
            ${m.reminderAt
              ? `<div class="reminder-row">${icon('bell')}<div class="grow"><b>${fmtDateTime(m.reminderAt)}</b>Recordatorio</div>
                  <button class="btn text" data-act="opt-reminder">Cambiar</button><button class="iconbtn" data-act="opt-reminder-rm" aria-label="Quitar recordatorio">${icon('close')}</button></div>`
              : `<button class="btn tonal" data-act="opt-reminder" style="align-self:flex-start">${icon('bell')} Añadir recordatorio</button>`}
          </div>
          <div id="player-host"></div>
          <div class="savebar">
            <button class="btn filled big" data-act="save" id="save-btn" style="width:100%">${icon('save')} Guardar nota</button>
          </div>
          <button class="btn text danger" data-act="discard">Descartar grabación</button>
        </div>`;
      const host = root.querySelector('#player-host');
      player?.destroy();
      player = d.blob ? mountPlayer(host, d.blob, d.duration) : null;
      if (player && wasPlaying) player.audio.play().catch(() => {});
      if (editing) { const t = root.querySelector('#txt'); t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
    }

    root.addEventListener('click', async (e) => {
      const prio = e.target.closest('[data-prio]');
      if (prio && getDraft()) { metaOf(getDraft()).priority = prio.dataset.prio; render(); return; }
      const kd = e.target.closest('[data-kind]');
      if (kd && getDraft()) { const m = metaOf(getDraft()); m.kind = m.kind === kd.dataset.kind ? '' : kd.dataset.kind; render(); return; }
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (!act) return;
      const d = getDraft();
      if (act === 'edit') {
        if (editing) patchDraft({ text: root.querySelector('#txt').value });
        editing = !editing; render();
      }
      if (act === 'opt-done') { metaOf(d).done = !metaOf(d).done; render(); }
      if (act === 'opt-fav') { metaOf(d).favorite = !metaOf(d).favorite; render(); }
      if (act === 'opt-reminder-rm') { metaOf(d).reminderAt = null; render(); }
      if (act === 'opt-reminder') {
        const m = metaOf(d);
        const res = await reminderPicker({ id: 'borrador', title: autoTitle(d.text, d.at), text: d.text, reminder: m.reminderAt ? { at: m.reminderAt } : null });
        if (res?.at) { m.reminderAt = res.at; render(); }
        if (res?.remove) { m.reminderAt = null; render(); }
      }
      if (act === 'retry') { patchDraft({ status: 'transcribing' }); retryRemoteTranscription(); }
      if (act === 'discard') {
        if (await confirmDialog({ title: '¿Descartar la grabación?', text: 'Se perderán el audio y el texto.', ok: 'Descartar', danger: true })) {
          await clearDraft(); navigate('/', { replace: true });
        }
      }
      if (act === 'save') {
        if (saved) return;
        saved = true;
        if (editing) patchDraft({ text: root.querySelector('#txt').value });
        const x = getDraft();
        const wantsQueue = x.status === 'pending' || (x.status === 'transcribing');
        const m = metaOf(x);
        const running = x.status === 'transcribing' && x.job && !x.text.trim();
        const n = await Notes.create({
          title: x.titleEdited ? x.title.trim() : '', text: x.text, audio: x.blob ? { blob: x.blob, mime: x.mime, duration: x.duration } : null,
          priority: m.priority, kind: m.kind,
          transcriptStatus: running ? 'processing' : (wantsQueue && !x.text.trim() ? 'pending' : (x.text.trim() ? 'done' : 'none')),
        });
        // La transcripción en curso no se pierde: al terminar se completa la nota ya guardada.
        if (running) {
          x.job.then((text) => Notes.update(n.id, { text: Notes.get(n.id)?.text.trim() ? Notes.get(n.id).text : text, transcriptStatus: text.trim() ? 'done' : 'none' }))
            .catch(() => Notes.update(n.id, { transcriptStatus: 'pending' }));
        }
        if (m.done || m.favorite) await Notes.update(n.id, { done: m.done, favorite: m.favorite });
        let remMsg = '';
        if (m.reminderAt) {
          const r = await setReminder(Notes.get(n.id), m.reminderAt);
          requestNotificationPermission();
          remMsg = ` · ${reminderToast(r).replace('Recordatorio guardado', 'con recordatorio')}`;
        }
        await clearDraft();
        const btn = root.querySelector('#save-btn');
        btn?.classList.add('savedpulse');
        toast(`Nota guardada${remMsg}`, { action: 'Abrir', onAction: () => navigate(`/note/${n.id}`) });
        navigate('/', { replace: true });
        if (n.transcriptStatus === 'pending') processQueue(queueApi());
      }
    });
    root.addEventListener('input', (e) => {
      const d = getDraft();
      if (!d) return;
      if (e.target.id === 'txt') {
        d.text = e.target.value;
        // El título automático acompaña al texto mientras no lo hayas editado.
        if (!d.titleEdited) { const t = root.querySelector('#f-title'); if (t) t.value = titleOf(d); }
      }
      if (e.target.id === 'f-title') {
        d.title = e.target.value;
        d.titleEdited = e.target.value.trim() !== '';
        const hint = root.querySelector('.titlefield small');
        if (hint) hint.textContent = d.titleEdited ? 'Título personalizado' : 'Generado automáticamente según el contenido · toca para cambiarlo';
      }
    });
    const off = on('draft:changed', () => { if (!editing && !saved && document.activeElement?.id !== 'f-title') render(); });
    const offProg = on('draft:progress', () => { const el = root.querySelector('#prog'); if (el && getDraft()) el.textContent = progressText(getDraft()); });
    const dict = mountDictPicker(root, {
      getText: () => (editing ? root.querySelector('#txt')?.value : getDraft()?.text) ?? '',
      setText: (t) => { if (editing) root.querySelector('#txt').value = t; patchDraft({ text: t }); if (editing) getDraft().text = t; },
    });
    const tick = setInterval(() => { const el = root.querySelector('#prog'); if (el && getDraft()?.status === 'transcribing') el.textContent = progressText(getDraft()); }, 1000);
    init();
    return { destroy: () => { clearInterval(tick); off(); offProg(); dict.destroy(); player?.destroy(); } };
  },
};
