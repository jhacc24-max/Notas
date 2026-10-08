# Propuesta visual (Material Design 3)

**Idea:** clínico pero cálido. Verde azulado (confianza/salud), mucho aire, tarjetas tonales, un único color de acento por pantalla.

## Color (tokens en `css/tokens.css`)
Semilla `#006A60`. Esquemas claro y oscuro completos (primary, secondary, tertiary, error, 5 niveles de *surface container*, outline). Sigue el sistema (`prefers-color-scheme`) o se fuerza en Ajustes.
Prioridad: 🔴 `--p-high`, 🟠 `--p-medium`, 🟢 `--p-low` (más claros en oscuro, contraste ≥ 4.5:1). Grabando: `--rec`. Favorito: `--star`.

## Tipografía
Roboto/fuente del sistema Android (sin descargas). Escala MD3: Headline 28/36 · Title L 22/28 · Title M 16/24 (500) · Body L 16/24 · Body M 14/20 · Label L 14/20 (500) · Label M 12/16. Temporizador de grabación: 64 px ligera, cifras tabulares.

## Forma y elevación
Radios: 8 (chips) · 12 · 16 (tarjetas, FAB) · 28 (diálogos, hojas, hero) · pill (botones, búsqueda). Elevación tonal en reposo (bordes sutiles + `surface-container-*`); sombras solo en FAB, diálogos y snackbar (E1–E3).

## Iconografía
Iconos Material de 24 px en SVG inline (funcionan sin conexión, heredan color). Objetivos táctiles ≥ 48 px; botones principales 56 px.

## Movimiento
Curva `cubic-bezier(.2,0,0,1)` (emphasized). 150 ms (toques) · 250 ms (pantallas, hojas) · 350 ms (splash). Entrada de tarjetas escalonada (30 ms), desplazamiento lateral entre notas, orbe de grabación que reacciona al nivel del micrófono. Respeta `prefers-reduced-motion`.

## Estados visuales
Grabando (píldora roja parpadeante + orbe) · Procesando/Transcribiendo (spinner en banda tonal) · Guardado (pulso en el botón + snackbar) · Realizada (tachado + check relleno) · Favorita (estrella ámbar) · Prioridad (punto de color + etiqueta) · Pendiente de transcribir (insignia con nube tachada).

## Navegación
Barra inferior MD3 (Inicio · Calendario · Favoritos · Buscar) con indicador *pill*; FAB extendido «Nueva nota» siempre a mano. Flujo principal: **FAB → hablar → detener → revisar → guardar** (4 toques).
