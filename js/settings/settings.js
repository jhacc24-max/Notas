import { dbAll, dbPut } from '../storage/db.js';
import { DEFAULT_CONFIG } from '../config.js';
import { emit } from '../core/events.js';

const defaults = {
  theme: 'system',            // system | light | dark
  language: DEFAULT_CONFIG.language,
  engine: 'auto',             // auto | local | whisper | webspeech
  localModel: 'base',         // base (≈80 MB) | small (≈250 MB, más precisa)
  googleCalendarSync: true,
  transcriptionEndpoint: DEFAULT_CONFIG.transcriptionEndpoint,
  transcriptionToken: '',     // token opcional de acceso a TU proxy (no es una clave de OpenAI)
  googleClientId: DEFAULT_CONFIG.googleClientId,
  googleTasksSync: true,
  customTerms: '',            // diccionario del usuario, una línea por término ("alias=Término" opcional)
  includeAudioShare: false,
};
let cache = { ...defaults };

export async function loadSettings() {
  try {
    for (const { key, value } of await dbAll('settings')) cache[key] = value;
  } catch { /* usa valores por defecto */ }
  applyTheme();
  return cache;
}
export const getSetting = (k) => cache[k];
export const allSettings = () => ({ ...cache });
export async function setSetting(key, value) {
  cache[key] = value;
  await dbPut('settings', { key, value });
  if (key === 'theme') applyTheme();
  emit('settings:changed', { key, value });
}

export function applyTheme() {
  const t = cache.theme;
  const root = document.documentElement;
  if (t === 'light' || t === 'dark') root.dataset.theme = t; else delete root.dataset.theme;
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0e1514' : '#f4fbf9');
}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
