// Pantalla de grabación: micrófono -> temporizador -> transcripción en vivo (si el motor lo permite) -> borrador.
import { Recorder, recordingSupported } from '../audio/recorder.js';
import { resolveEngine, createLiveRecognizer, transcribeBlob, polish } from '../transcription/index.js';
import { setDraft, patchDraft, getDraft } from './draft.js';
import { getSetting } from '../settings/settings.js';
import { navigate } from './router.js';
import { toast } from './dialogs.js';
import { fmtDuration, esc } from '../core/util.js';
import { icon } from '../core/icons.js';

let open = false;

export async function startRecordingFlow() {
  if (open) return;
  if (!recordingSupported()) return toast('Este navegador no permite grabar audio.');
  open = true;
  const engine = resolveEngine();
  const rec = new Recorder();
  try { await rec.start(); }
  catch (e) { open = false; return toast(e.message); }

  let live = null;
  const el = document.createElement('div');
  el.className = 'rec-screen';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Grabando nota de voz');
  const online = navigator.onLine;
  const hint = engine === 'webspeech'
    ? (online ? 'Transcripción en vivo (reconocimiento del navegador).' : 'Sin conexión: el reconocimiento del navegador necesita Internet. Se guardará el audio.')
    : engine === 'whisper'
      ? (online ? 'Se transcribirá al detener la grabación.' : 'Sin conexión: se guardará el audio y se transcribirá después.')
      : 'Este navegador no ofrece transcripción: podrás escribir el texto a mano.';
  el.innerHTML = `
    <span class="rec-status" id="rec-badge"><i class="dot"></i> Grabando</span>
    <div class="rec-time" id="rec-time" aria-live="off">0:00</div>
    <div class="rec-orb" id="rec-orb"><button class="stopbtn" id="rec-stop" aria-label="Detener grabación">${icon('stop')}</button></div>
    <p class="rec-hint">Toca el botón para detener</p>
    <div class="rec-live selectable" id="rec-live" aria-live="polite"></div>
    <p class="rec-hint" style="margin-bottom:16px">${esc(hint)}</p>
    <button class="btn text" id="rec-cancel">Cancelar</button>`;
  document.body.appendChild(el);
  const $ = (id) => el.querySelector('#' + id);

  const tick = setInterval(() => { $('rec-time').textContent = fmtDuration(rec.elapsed); }, 250);
  rec.onLevel = (l) => $('rec-orb').style.setProperty('--lvl', Math.min(1, l * 2.2).toFixed(2));

  if (engine === 'webspeech' && online) {
    live = createLiveRecognizer({
      onUpdate: (f, i) => { $('rec-live').innerHTML = `${esc(f)} <span class="interim">${esc(i)}</span>`; },
      onError: (code) => {
        if (code === 'not-allowed' || code === 'service-not-allowed') toast('El reconocimiento de voz no tiene permiso.');
        else if (code === 'audio-capture') toast('El micrófono no se puede compartir con el reconocimiento en vivo; se guardará el audio.');
      },
    });
    live.start();
  }

  const cleanup = () => { clearInterval(tick); el.remove(); open = false; };

  $('rec-cancel').onclick = () => { live?.abort(); rec.cancel(); cleanup(); };
  $('rec-stop').onclick = async () => {
    $('rec-stop').disabled = true;
    $('rec-badge').innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> Procesando';
    const liveText = live ? await live.stop() : '';
    const audio = await rec.stop();
    cleanup();
    finish(audio, liveText, online);
  };
}

function finish(audio, liveText, online) {
  const base = { ...audio, at: Date.now(), text: '', status: 'none' };
  const canRemote = !!getSetting('transcriptionEndpoint');
  if (liveText) setDraft({ ...base, text: polish(liveText), status: 'done' });
  else if (canRemote && !online) setDraft({ ...base, status: 'pending' }); // se transcribe al volver la conexión
  else if (canRemote) { setDraft({ ...base, status: 'transcribing' }); runRemote(); }
  else setDraft({ ...base, status: 'none' });
  navigate('/review');
}

async function runRemote() {
  const d = getDraft();
  if (!d) return;
  const ctl = new AbortController();
  d.abort = () => ctl.abort();
  try {
    const text = await transcribeBlob(d.blob);
    // No pisar lo que el usuario haya empezado a escribir mientras tanto.
    if (getDraft() === d) patchDraft({ text: d.text?.trim() ? d.text : text, status: 'done' });
  } catch {
    if (getDraft() === d && !ctl.signal.aborted) {
      patchDraft({ status: navigator.onLine ? 'error' : 'pending' });
    }
  }
}
export { runRemote as retryRemoteTranscription };
