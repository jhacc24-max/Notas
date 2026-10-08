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
import { getSetting } from '../../settings/settings.js';

export default {
  nav: false, fab: false,
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
        pending: 'Sin conexión o sin servicio: el audio se guardará y se transcribirá cuando sea posible.',
        none: getSetting('transcriptionEndpoint') ? 'No se obtuvo transcripción. Puedes escribirla.' : 'No hay transcripción automática disponible. Puedes escribir el texto.',
        error: 'No se pudo transcribir. Reintenta o escribe el texto.',
      }[d.status];
      const wasPlaying = player && !player.audio.paused;
      root.innerHTML = `
        ${appBar({ title: 'Revisar nota', back: true })}
        <div class="page">
          <div class="label-row"><span>Transcripción</span>
            ${busy ? '' : `<button class="btn tonal" data-act="edit" style="min-height:40px">${icon(editing ? 'check' : 'edit')}${editing ? 'Listo' : 'Editar'}</button>`}</div>
          ${busy ? `<div class="processing" role="status"><span class="spinner"></span>Transcribiendo con vocabulario médico…</div>` : ''}
          ${editing
            ? `<textarea class="transcript" id="txt" aria-label="Texto de la transcripción" spellcheck="true" lang="es" placeholder="Escribe o corrige el texto…">${esc(d.text)}</textarea>`
            : `<div class="transcript selectable ${d.text ? '' : 'empty-t'}" id="txt">${d.text ? esc(d.text) : (busy ? '' : 'Sin texto. Toca «Editar» para escribirlo.')}</div>`}
          ${note ? `<div class="note-info">${icon('info', '')} ${esc(note)}${d.status === 'error' ? ' <button class="btn text" data-act="retry">Reintentar</button>' : ''}</div>` : ''}
          <div id="player-host"></div>
          <button class="btn filled big" data-act="save" id="save-btn">${icon('save')} Guardar nota</button>
          <button class="btn text danger" data-act="discard">Descartar grabación</button>
        </div>`;
      const host = root.querySelector('#player-host');
      player?.destroy();
      player = d.blob ? mountPlayer(host, d.blob, d.duration) : null;
      if (player && wasPlaying) player.audio.play().catch(() => {});
      if (editing) { const t = root.querySelector('#txt'); t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
    }

    root.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (!act) return;
      const d = getDraft();
      if (act === 'edit') {
        if (editing) patchDraft({ text: root.querySelector('#txt').value });
        editing = !editing; render();
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
        if (x.status === 'transcribing') x.abort?.();
        const n = await Notes.create({
          text: x.text, audio: x.blob ? { blob: x.blob, mime: x.mime, duration: x.duration } : null,
          transcriptStatus: wantsQueue && !x.text.trim() ? 'pending' : (x.text.trim() ? 'done' : 'none'),
        });
        await clearDraft();
        const btn = root.querySelector('#save-btn');
        btn?.classList.add('savedpulse');
        toast('Nota guardada', { action: 'Abrir', onAction: () => navigate(`/note/${n.id}`) });
        navigate('/', { replace: true });
        if (n.transcriptStatus === 'pending') processQueue(queueApi());
      }
    });
    root.addEventListener('input', (e) => {
      if (e.target.id === 'txt') getDraft() && (getDraft().text = e.target.value);
    });
    const off = on('draft:changed', () => { if (!editing && !saved) render(); });
    init();
    return { destroy: () => { off(); player?.destroy(); } };
  },
};
