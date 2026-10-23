import { emit } from '../core/events.js';

let deferred = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; emit('install:changed'); });
window.addEventListener('appinstalled', () => { deferred = null; emit('install:changed'); });

export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const installAvailable = () => !!deferred && !isStandalone();
export async function promptInstall() {
  if (!deferred) return false;
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  emit('install:changed');
  return outcome === 'accepted';
}
