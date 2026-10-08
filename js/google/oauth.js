// OAuth 2.0 con Google Identity Services (flujo "token model", pensado para apps web SIN backend).
//  - No hay client secret en la app (no hace falta ni debe existir). El Client ID es público.
//  - Alcance mínimo: solo Google Tasks. Nunca se piden datos de Gmail/Drive/etc.
//  - El token de acceso vive solo en memoria (se pierde al cerrar la app = más seguro); al reabrir,
//    Google lo concede de nuevo sin pantalla si el usuario ya había aceptado.
import { getSetting } from '../settings/settings.js';

const SCOPE = 'https://www.googleapis.com/auth/tasks';
let token = null, expires = 0, tokenClient = null, gisLoading = null;

const loadGis = () => gisLoading ??= new Promise((resolve, reject) => {
  if (window.google?.accounts?.oauth2) return resolve();
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.onload = resolve;
  s.onerror = () => { gisLoading = null; reject(new Error('No se pudo cargar Google (¿sin conexión?).')); };
  document.head.appendChild(s);
});

export const googleConfigured = () => !!getSetting('googleClientId');
export const isConnected = () => !!token && Date.now() < expires;
export const wasConnected = () => localStorage.getItem('google-linked') === '1';

/** @param {boolean} interactive false => intento silencioso (sin ventana si ya hay consentimiento) */
export async function getToken(interactive = true) {
  if (isConnected()) return token;
  const clientId = getSetting('googleClientId');
  if (!clientId) throw new Error('Falta el Client ID de Google en Ajustes.');
  await loadGis();
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (res) => {
        if (res.error) return reject(new Error(res.error_description || res.error));
        token = res.access_token;
        expires = Date.now() + (Number(res.expires_in) - 60) * 1000;
        localStorage.setItem('google-linked', '1');
        resolve(token);
      },
      error_callback: (e) => reject(new Error(e?.type === 'popup_closed' ? 'Conexión cancelada.' : (e?.message || 'Error de Google'))),
    });
    tokenClient.requestAccessToken({ prompt: interactive ? (wasConnected() ? '' : 'consent') : 'none' });
  });
}

export async function disconnect() {
  const t = token;
  token = null; expires = 0;
  localStorage.removeItem('google-linked');
  try { if (t && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(t, () => {}); } catch { /* ya revocado */ }
}
