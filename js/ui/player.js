import { icon } from '../core/icons.js';
import { fmtDuration } from '../core/util.js';

/**
 * Reproductor de audio reutilizable. Monta en `host` y devuelve { destroy, pause }.
 * `knownDuration`: los WebM de MediaRecorder reportan Infinity; usamos la duración medida al grabar.
 */
export function mountPlayer(host, blob, knownDuration = 0) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.src = url;
  let dur = knownDuration || 0;
  const vol = Number(localStorage.getItem('vol') ?? 1);
  audio.volume = isNaN(vol) ? 1 : vol;

  host.innerHTML = `
    <div class="player" role="group" aria-label="Reproductor de audio">
      <div class="player-row">
        <button class="play" data-p="play" aria-label="Reproducir">${icon('play')}</button>
        <button class="iconbtn" data-p="back" aria-label="Retroceder 10 segundos">${icon('rew')}</button>
        <input type="range" data-p="seek" min="0" max="1000" value="0" step="1" aria-label="Posición del audio">
        <button class="iconbtn" data-p="fwd" aria-label="Avanzar 10 segundos">${icon('fwd')}</button>
      </div>
      <div class="times"><span data-p="cur">0:00</span><span data-p="dur">${fmtDuration(dur)}</span></div>
      <div class="vol"><button class="iconbtn" data-p="mute" aria-label="Silenciar">${icon('volume')}</button>
        <input type="range" data-p="vol" min="0" max="1" step="0.05" value="${audio.volume}" aria-label="Volumen"></div>
    </div>`;
  const q = (k) => host.querySelector(`[data-p=${k}]`);
  const D = () => (isFinite(audio.duration) && audio.duration > 0 ? audio.duration : dur);
  const paintPlay = () => { q('play').innerHTML = icon(audio.paused ? 'play' : 'pause'); q('play').setAttribute('aria-label', audio.paused ? 'Reproducir' : 'Pausar'); };
  const paintTime = () => {
    const d = D();
    q('cur').textContent = fmtDuration(audio.currentTime);
    q('dur').textContent = fmtDuration(d);
    if (!seeking && d) q('seek').value = Math.round((audio.currentTime / d) * 1000);
  };
  let seeking = false;

  // Truco conocido: forzar al navegador a calcular la duración real de un WebM sin cabecera.
  // Mientras tanto el botón de reproducir está desactivado (dura milisegundos).
  let fixing = false;
  const ready = () => { fixing = false; q('play').disabled = false; paintTime(); };
  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration === Infinity) {
      fixing = true; q('play').disabled = true;
      const done = () => { audio.removeEventListener('timeupdate', done); audio.removeEventListener('ended', done); audio.currentTime = 0; setTimeout(ready, 30); };
      audio.addEventListener('timeupdate', done);
      audio.addEventListener('ended', done);
      audio.currentTime = 1e101;
      setTimeout(() => fixing && ready(), 1500); // salvaguarda
    } else if (isFinite(audio.duration)) { dur = audio.duration; paintTime(); }
  });
  audio.addEventListener('timeupdate', paintTime);
  audio.addEventListener('play', paintPlay);
  audio.addEventListener('pause', paintPlay);
  audio.addEventListener('ended', () => { if (fixing) return; audio.currentTime = 0; paintPlay(); paintTime(); });

  q('play').onclick = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause());
  q('back').onclick = () => { audio.currentTime = Math.max(0, audio.currentTime - 10); };
  q('fwd').onclick = () => { audio.currentTime = Math.min(D() || 1e9, audio.currentTime + 10); };
  q('seek').addEventListener('input', () => { seeking = true; q('cur').textContent = fmtDuration((q('seek').value / 1000) * D()); });
  q('seek').addEventListener('change', () => { audio.currentTime = (q('seek').value / 1000) * D(); seeking = false; });
  q('vol').addEventListener('input', () => {
    audio.volume = Number(q('vol').value);
    audio.muted = false;
    localStorage.setItem('vol', String(audio.volume));
    q('mute').innerHTML = icon(audio.volume ? 'volume' : 'volumeOff');
  });
  q('mute').onclick = () => { audio.muted = !audio.muted; q('mute').innerHTML = icon(audio.muted ? 'volumeOff' : 'volume'); };
  // Los controles no deben iniciar el gesto de deslizar entre notas.
  host.addEventListener('pointerdown', (e) => e.stopPropagation());

  return {
    audio,
    pause: () => audio.pause(),
    destroy: () => { audio.pause(); audio.removeAttribute('src'); audio.load(); URL.revokeObjectURL(url); },
  };
}
