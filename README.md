# Notas médicas por voz (PWA)

PWA para Android: grabas una nota hablando en español, se transcribe (con vocabulario médico como contexto), la revisas y la guardas. Calendario, búsqueda, favoritos, prioridades, recordatorios (Google Tasks), compartir, papelera, selección múltiple, gestos entre notas, tema claro/oscuro y modo sin conexión.

Sin frameworks ni paso de compilación: HTML + CSS + módulos ES. Cualquier hosting estático con **HTTPS** sirve.

## Probar / instalar

```bash
npm start            # http://localhost:8080 (el micrófono funciona en localhost)
```
Para instalarla en Android necesitas HTTPS: despliega (el workflow `.github/workflows/pages.yml` publica en GitHub Pages al hacer push a `main`) o usa un túnel (`cloudflared tunnel --url http://localhost:8080`). Abre la URL en Chrome → menú ⋮ → **Instalar aplicación** (también aparece un aviso en Inicio y en Ajustes).

Pruebas E2E (Chromium con micrófono y servicio de transcripción simulados): `PW_MODULE=/ruta/a/node_modules npm test`.

## Tipos de nota y filtros
- **Tipos con color:** *Personal* (morado) y *Hospital* (azul), además de la prioridad. Se eligen al revisar la nota, en la nota, al crear desde el calendario o en lote (selección múltiple → etiqueta).
- **Menú inferior de 5 elementos:** Inicio · Calendario · **Grabar** (centro) · Favoritos · Buscar. No hay botón flotante.
- **Filtros desplegables**, fijos en la parte baja justo sobre el menú (alcance del pulgar) y con sus listas abriéndose abajo (Estado · Prioridad · Tipo · Orden) en una sola fila en Todas las notas, Favoritos, Buscar y Calendario (también Vista Mes/Semana); en Inicio, el filtro Tipo.
- **Secciones plegables:** en Inicio (Próximos recordatorios, Prioridad alta, Pendientes, Recientes) y en Ajustes, tocando el título; la app recuerda lo que dejaste abierto o cerrado.

## Transcripción (gratis, sin cuentas)

Por defecto la app transcribe **en el propio teléfono** con Whisper (transformers.js + ONNX/WASM), sin servidor, sin claves y sin coste:

1. Primera vez: la app descarga el motor una sola vez (Estándar ≈ 80 MB · Alta precisión ≈ 250 MB; se elige en Ajustes). Un aviso en Inicio lo ofrece y muestra el progreso. Conviene Wi-Fi.
2. Después funciona **sin Internet** y el audio **nunca sale del teléfono**.
3. Se graba el audio completo y *luego* se transcribe: no depende de compartir el micrófono con el reconocimiento del navegador (que falla en muchos Android, y era el motivo de que no transcribiera).

| Motor | Terminología médica | Coste | Privacidad |
|---|---|---|---|
| **Groq (clave gratuita pegada en Ajustes)** — la más rápida y precisa | Whisper grande con el diccionario como `prompt` (contexto real). Segundos por nota. | Gratis (límites de uso: ~2000 peticiones/día) | El audio va a Groq; la clave solo se guarda en tu teléfono |
| **En el teléfono** (por defecto) | Corrector médico posterior (alias, unión de palabras, fonética, tildes) + tu diccionario. Whisper local no admite *prompt* de vocabulario. | Gratis | Todo local |
| **Servidor Whisper** (opcional, `server/worker.js`) | El diccionario viaja como `prompt`: contexto real al decodificar. Mejor precisión. | OpenAI ≈ 0,006 USD/min; **o gratis con Groq** (`UPSTREAM_URL`, límites de uso) | Audio → tu proxy → proveedor |
| **Navegador en vivo** (experimental) | Sesgo con `phrases` si el navegador lo soporta | Gratis | Audio → servicio de voz del navegador (Google) |

**Velocidad del motor del teléfono:** corre en WASM de un solo hilo (GitHub Pages no permite el aislamiento necesario para varios hilos), así que en móviles modestos 1 min de audio puede tardar de uno a varios minutos (Rápida < Estándar < Alta precisión). Puedes guardar la nota mientras procesa y se completa sola. Si necesitas rapidez, usa la clave de Groq.

**Verificado:** la tubería real (decodificar el audio grabado → worker → modelo Whisper → texto) se probó en Chromium con el modelo `Xenova/whisper-tiny` real y una grabación de voz (≈11 s de audio en ≈12–17 s en un PC sin hilos).

### Diccionario personal
- **Al transcribir:** selecciona (mantén pulsada) una palabra del texto → aparece **«Añadir al diccionario»**. Escribe la forma correcta; si es distinta de lo seleccionado, puedes marcar «Corregir siempre» y «Cambiarla también en este texto».
- También en **Ajustes → Diccionario médico** (un término por línea; `alias=Término`).
- Paquete base: `js/medical/terms.js` y frases en `js/medical/dictionary.js`.

### Servidor opcional (≈5 min)
```bash
cd server
npx wrangler secret put OPENAI_API_KEY   # tu clave (solo vive en el servidor)
npx wrangler secret put APP_TOKEN        # una contraseña larga; también en Ajustes → Opciones avanzadas
# edita ALLOWED_ORIGIN (y UPSTREAM_URL/MODEL si usas Groq) en wrangler.toml
npx wrangler deploy
```

## Google Calendar y Google Tasks

Para el usuario final es el flujo de siempre: **Ajustes → Conectar con Google** (o el botón «Conectar con Google» dentro del recordatorio) → ventana de Google: elige tu cuenta, entra con usuario y contraseña si hace falta y pulsa **Permitir**. Nada más.

- **Google Calendar:** crea un evento con la **hora exacta** y notificación del móvil a esa hora (funciona con la app cerrada).
- **Google Tasks:** crea la tarea (Google solo guarda la fecha).
- Editar/borrar el recordatorio actualiza/borra el evento y la tarea. Solo viajan título, hora y enlace a la nota (nunca el texto clínico).

### Configuración única de quien publica la app (no la hace el usuario)
Ver **[docs/GOOGLE.md](docs/GOOGLE.md)**: crear el Client ID (5 pasos) y pegarlo en `js/config.js`. Los usuarios ya no ven nada técnico.

## Privacidad: qué sale del dispositivo
- **Local siempre:** notas, audios, recordatorios y ajustes (IndexedDB; se pide almacenamiento persistente).
- **Motor en el teléfono (por defecto):** nada sale; solo se descarga el modelo una vez desde Internet.
- **Motor navegador:** audio → servicio de voz del navegador. **Motor servidor:** audio + lista de términos → tu proxy → proveedor.
- **Google (solo si lo conectas):** título, hora y enlace a la nota.
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
Probado automáticamente (E2E, ~65 comprobaciones, Chromium emulando móvil táctil, micrófono falso y transcripción simulada): grabación, temporizador, transcripción + corrección, reproducción, edición, guardado, búsqueda, favoritos, prioridades, calendario, recordatorios, selección múltiple, compartir, papelera, gestos, persistencia, modo sin conexión, tema oscuro, manifest/service worker y ausencia de errores de consola.
**No verificado aquí:** dispositivo Android físico, Web Speech real, OpenAI real y Google OAuth/Tasks reales (requieren tus credenciales). En algunos Android el micrófono no se puede compartir entre la grabación y el reconocimiento en vivo del navegador: la app lo detecta, guarda el audio y ofrece transcribir/escribir después.
