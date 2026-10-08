// Configuración pública por defecto. Ningún secreto va aquí.
// Todo se puede cambiar en Ajustes dentro de la app (se guarda en el dispositivo).
export const DEFAULT_CONFIG = {
  // Client ID OAuth de Google (público por diseño; NO es un secreto).
  googleClientId: '',
  // URL de tu proxy de transcripción (ver /server). Vacío = usar solo el reconocimiento del navegador.
  transcriptionEndpoint: '',
  language: 'es-ES',
};
