// OAuth 2.0 con Google Identity Services (flujo "token model", pensado para apps web SIN backend).
//  - No hay client secret en la app (no hace falta ni debe existir). El Client ID es público.
//  - Alcances mínimos: crear tareas (Tasks) y eventos (Calendar). Nunca Gmail/Drive/etc.
//  - El token de acceso vive solo en memoria (se pierde al cerrar la app = más seguro); al reabrir,
//    Google lo concede de nuevo sin pantalla si el usuario ya había aceptado.
import { getSetting } from '../settings/settings.js';

const SCOPE = 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar.events';
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

/**
 * Token de acceso. Si falta o caducó, primero se intenta renovar EN SILENCIO (sin ventana, si la
 * sesión de Google sigue abierta) y solo si falla se abre la ventana normal de Google
 * (elegir cuenta, usuario/contraseña si hace falta y «Permitir»).
 */
export async function getToken(interactive = true) {
  if (isConnected()) return token;
  if (interactive && wasConnected()) { try { return await request(false); } catch { /* pedir de nuevo con ventana */ } }
  return request(interactive);
}

async function request(interactive) {
  const clientId = getSetting('googleClientId');
  if (!clientId) throw new Error('Google no está configurado en esta app todavía.');
  await loadGis();
  return new Promise((resolve, reject) => {
    // Un intento silencioso que no responde no debe bloquear el guardado del recordatorio.
    if (!interactive) setTimeout(() => reject(new Error('Sin respuesta de Google.')), 8000);
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

/** Descarta el token actual (p. ej. tras un 401) para forzar su renovación. */
export const forgetToken = () => { token = null; expires = 0; };
