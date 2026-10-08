# Notas médicas por voz (PWA)

PWA para Android: grabas una nota hablando en español, se transcribe (con vocabulario médico como contexto), la revisas y la guardas. Calendario, búsqueda, favoritos, prioridades, recordatorios (Google Tasks), compartir, papelera, selección múltiple, gestos entre notas, tema claro/oscuro y modo sin conexión.

Sin frameworks ni paso de compilación: HTML + CSS + módulos ES. Cualquier hosting estático con **HTTPS** sirve.

## Probar / instalar

```bash
npm start            # http://localhost:8080 (el micrófono funciona en localhost)
```
Para instalarla en Android necesitas HTTPS: despliega (el workflow `.github/workflows/pages.yml` publica en GitHub Pages al hacer push a `main`) o usa un túnel (`cloudflared tunnel --url http://localhost:8080`). Abre la URL en Chrome → menú ⋮ → **Instalar aplicación** (también aparece un aviso en Inicio y en Ajustes).

Pruebas E2E (Chromium con micrófono y servicio de transcripción simulados): `PW_MODULE=/ruta/a/node_modules npm test`.

## Transcripción (decisión clave)

| Motor | Cómo usa la terminología médica | Coste | Privacidad |
|---|---|---|---|
| **Servidor Whisper** (recomendado) vía tu proxy `server/worker.js` | El diccionario viaja como **`prompt`** de Whisper: el modelo lo usa como contexto al decodificar. Después hay un corrector conservador (alias, unión de palabras, fonética, tildes). | OpenAI `whisper-1` ≈ 0,006 USD/min (≈ 0,36 USD/h; `gpt-4o-mini-transcribe` ≈ la mitad). **Verifica precios vigentes.** Cloudflare Workers: plan gratuito suficiente. | El audio va a tu proxy y a OpenAI. Nunca el texto de las notas. |
| **Navegador** (Web Speech) | Si el navegador soporta `SpeechRecognition.phrases` (Chrome reciente) se pasan los términos como sesgo; si no, solo actúa el corrector posterior. | Gratis | El audio lo procesa Google (Chrome). Requiere Internet. |

Con motor «Automático» se usa Whisper si hay URL configurada; si no, el del navegador. **Sin conexión** el audio se guarda y la nota queda «Por transcribir»: se procesa sola al volver Internet (requiere el servidor Whisper configurado).

### Desplegar el proxy (≈5 min)
```bash
cd server
npx wrangler secret put OPENAI_API_KEY   # tu clave (solo vive en el servidor)
npx wrangler secret put APP_TOKEN        # una contraseña larga; la pegas también en Ajustes
# edita ALLOWED_ORIGIN en wrangler.toml con la URL de tu app
npx wrangler deploy
```
Pega la URL del Worker (y el token) en **Ajustes → Transcripción**.

### Ampliar el diccionario
- Sin tocar código: **Ajustes → Diccionario médico** (un término por línea; `alias=Término` corrige errores habituales).
- Paquete base: `js/medical/terms.js` (datos por categorías) y frases en `js/medical/dictionary.js`.

## Google Tasks

1. [Google Cloud Console](https://console.cloud.google.com) → proyecto nuevo → habilita **Google Tasks API**.
2. Pantalla de consentimiento OAuth (externa; añade tu cuenta como usuario de prueba) con el alcance `.../auth/tasks`.
3. Credenciales → **ID de cliente OAuth → Aplicación web** → *Orígenes JavaScript autorizados*: la URL de tu app (no hace falta URI de redirección).
4. Pega el **Client ID** en Ajustes → Google Tasks → **Conectar**.

Flujo OAuth: Google Identity Services (token model). No hay *client secret*; el token vive solo en memoria. Coste: API gratuita.

**Limitaciones reales**
- La API de Google Tasks **solo guarda la fecha** de vencimiento; la hora se descarta. La hora exacta va en las notas de la tarea. Para un aviso a la hora exacta, el diálogo ofrece **Google Calendar** y **.ics**.
- Una PWA **no puede despertarse con la app cerrada** a una hora concreta (los *notification triggers* no están disponibles). La app avisa a la hora si está abierta; con la app cerrada avisan Google Tasks/Calendar.
- Tareas y notas se mantienen asociadas (id de tarea guardado en el recordatorio; la tarea enlaza a la nota). Editar/borrar el recordatorio actualiza/borra la tarea; completar la nota completa la tarea. Los cambios hechos en Google no se sincronizan de vuelta.

## Privacidad: qué sale del dispositivo
- **Local siempre:** notas, audios, recordatorios y ajustes (IndexedDB; se pide almacenamiento persistente).
- **Motor navegador:** audio → servicio de voz del navegador. **Motor servidor:** audio + lista de términos → tu proxy → OpenAI.
- **Google Tasks:** solo título, fecha/hora y enlace a la nota.
- Sin analítica, sin anuncios; la app no escribe contenido de notas en logs. Las claves no están en el código: la de OpenAI es un secreto del Worker; el Client ID de Google es público por diseño.
- Compartir usa la hoja de Android; tú eliges el destino.

## Arquitectura
```
index.html · manifest.webmanifest · sw.js · css/ (tokens MD3, base)
js/
  core/          util, bus de eventos, iconos
  storage/       IndexedDB: notes | audio | reminders | settings  (separados; listo para un SyncAdapter)
  notes/         CRUD, papelera, consultas, títulos automáticos
  audio/         grabación (MediaRecorder + medidor de nivel)
  transcription/ motores (webspeech, whisper), orquestador, cola offline
  medical/       terms (datos), dictionary (contexto), corrector (post-proceso)
  calendar/      modelo de calendario
  reminders/     almacén, avisos locales, .ics/Calendar, servicio (local + Google)
  google/        oauth (GIS), tasks (REST)
  search/        índice invertido (acentos/mayúsculas, prefijo y subcadena)
  share/         Web Share API + alternativas
  settings/      configuración · ui/ router, vistas, componentes, diálogos, reproductor
server/          proxy de transcripción (Cloudflare Worker)
```
**Sincronización futura:** cada nota tiene `id` y `updatedAt`, y el audio/recordatorios van en almacenes aparte; un adaptador de nube solo tiene que leer/escribir esos registros.

## Estado de verificación
Probado automáticamente (39 comprobaciones, Chromium emulando móvil táctil, micrófono falso y transcripción simulada): grabación, temporizador, transcripción + corrección, reproducción, edición, guardado, búsqueda, favoritos, prioridades, calendario, recordatorios, selección múltiple, compartir, papelera, gestos, persistencia, modo sin conexión, tema oscuro, manifest/service worker y ausencia de errores de consola.
**No verificado aquí:** dispositivo Android físico, Web Speech real, OpenAI real y Google OAuth/Tasks reales (requieren tus credenciales). En algunos Android el micrófono no se puede compartir entre la grabación y el reconocimiento en vivo del navegador: la app lo detecta, guarda el audio y ofrece transcribir/escribir después.
