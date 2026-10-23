---
documento: UI/UX Design Brief + Design System
version_base: 1.0
app: "{{NOMBRE_APP}}"
ultima_actualizacion: "{{AAAA-MM-DD}}"
---

# 04 · UI/UX Design Brief — Cómo se ve

> **Para qué sirve:** paleta, tipografía, espaciado y componentes, para que la IA genere pantallas coherentes entre sí.
> **Separación clara:** aquí va lo **estático** (cómo se ve en reposo). Todo lo que se **mueve** va en `07-MOTION.md`.

---

## 1. Personalidad visual

| Campo | Valor |
|---|---|
| 3 adjetivos | {{Ej.: claro, ágil, confiable}} |
| Estilo base | Minimal claro con superficies tonales (oscuro → tinte → blanco) y capas superpuestas. Ver §5 y `referencias/ref-01-capas-tonales.png` |
| Referencias | {{apps o capturas que te gusten}} |
| Lo que NO queremos | {{Ej.: saturado, corporativo frío}} |

## 2. Tokens de color

> **La paleta completa, para claro y oscuro, se elige en `08-PALETAS-DE-COLOR.md`** (14 colores listos, con roles como `--hero`, `--tint` y `--accent`). El bloque de abajo muestra la estructura con la paleta *Azul marino*; en el código se usan los roles de `paletas.css`.

Definidos como variables CSS en `/src/styles/tokens.css`.

```css
:root {
  /* Marca — CAMBIAR POR APP */
  --brand-500: {{#5B5BF0}};
  --brand-600: {{#4848D8}};
  --brand-100: {{#ECECFE}};

  /* Escala tonal — CAMBIAR EL TONO POR APP (ref. 01 usa azul marino) */
  --tone-900: #13213C;  /* superficie oscura: cabeceras, tarjeta héroe, CTA, píldora activa */
  --tone-800: #22335A;  /* botones sobre fondo oscuro */
  --tone-300: #9FB3D9;  /* texto secundario sobre oscuro */
  --tone-200: #CCD8EE;  /* selección, acceso rápido activo */
  --tone-100: #E1E8F5;  /* tarjetas tintadas */
  --tone-50:  #EEF2F8;  /* fondo de pantalla y paneles */

  /* Neutros — base común */
  --bg:        #F7F7FA;
  --surface:   #FFFFFF;
  --surface-2: #F0F1F5;
  --text:      #15161A;
  --text-2:    #5C5F6A;
  --border:    #E4E5EB;
  --nav-dark:  #15161A;   /* barra inferior flotante */

  /* Semánticos — base común */
  --success: #1FA971;
  --warning: #E8A317;
  --danger:  #E5484D;
  --info:    #3B82F6;
}
@media (prefers-color-scheme: dark) {
  :root { --bg:#0E0F12; --surface:#17181C; --surface-2:#202127; --text:#F2F3F5; --text-2:#A1A4AE; --border:#2A2C33; }
}
```

## 3. Tipografía

| Rol | Fuente | Tamaño / interlineado | Peso |
|---|---|---|---|
| Display | {{Inter / Plus Jakarta Sans}} | 32 / 38 | 700 |
| Título | | 22 / 28 | 600 |
| Subtítulo | | 17 / 24 | 600 |
| Cuerpo | | 15 / 22 | 400 |
| Etiqueta | | 13 / 18 | 500 |
| Números grandes | tabular-nums | 28 / 32 | 700 |

## 4. Espaciado, radios y sombras

- **Escala de espacio (px):** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48
- **Margen lateral de pantalla:** 16 px (móvil), 24 px (tablet+)
- **Radios:** `--r-sm 8px` (inputs) · `--r-md 14px` (tarjetas) · `--r-lg 22px` (sheets) · `--r-full` (botones píldora, barra flotante)
- **Elevación:** `--e1` tarjetas en reposo · `--e2` tarjeta levantada / hover · `--e3` sheets y barra flotante

```css
--e1: 0 1px 2px rgb(0 0 0 / .06);
--e2: 0 6px 16px rgb(0 0 0 / .10);
--e3: 0 12px 32px rgb(0 0 0 / .18);
```

## 5. Patrones de pantalla: superficies y capas

> Referencias visuales: `referencias/ref-01-capas-tonales.png` (A, B, C), `referencias/ref-02-imagen-fundida.png` (D) `referencias/ref-03-tareas-agenda.png` (E) `referencias/ref-04-ingreso-aurora.png` (F) , `referencias/ref-06-efectos-flujo.mp4` (G) y `referencias/ref-07-app-pedidos.mp4` (H). Toda pantalla usa uno de estos ocho patrones, y `03-APPFLOW.md` indica cuál lleva cada una.

**Idea central:** la jerarquía se marca con el **tono**, no con sombras ni bordes. El color baja de oscuro a claro de arriba hacia abajo: `--tone-900` (lo más importante) → `--tone-100` (información de apoyo) → blanco (acciones) → `--tone-50` (fondo).

### Patrón A · Tarjetas cerradas tonales
Para Inicio, paneles y resúmenes.
- Fondo `--tone-50`. Cada bloque es una tarjeta cerrada con radio de 20–22 px y separación de 10–12 px.
- Los tonos van siempre en este orden:
  1. **Tarjeta héroe oscura** (`--tone-900`, texto blanco) con el dato más urgente (próxima cita, stock crítico). Máximo una por pantalla y siempre arriba.
  2. **Tarjeta tintada** (degradado `--tone-100` → `--tone-50`, borde blanco de 1 px) con métricas en mini-celdas blancas semitransparentes.
  3. **Tarjeta blanca** con accesos rápidos: íconos en círculos `--tone-50`, y el seleccionado en `--tone-200`.
- Las tarjetas no llevan sombra; solo la barra de navegación la tiene.

### Patrón B · Capas superpuestas (cabecera abierta)
Para listados, búsqueda, catálogo y categorías.
- **Capa 1, cabecera oscura** `--tone-900` de borde a borde. Lleva botones circulares translúcidos, un título en dos tonos (línea 1 blanca, línea 2 `--tone-300`) y un buscador: campo píldora blanco más botón de filtros circular `--tone-800`.
- **Capa 2, panel claro** `--tone-50` que **se monta sobre la cabecera**: esquinas superiores con radio de 26–28 px y margen superior negativo (unos −24 px). La cabecera no se cierra por abajo: su color asoma por las esquinas del panel y se funde con la primera tarjeta.
- Dentro del panel los tonos bajan: tarjeta-imagen grande → dos tarjetas-imagen medianas → tarjeta tintada `--tone-100` (por ejemplo, "Habla con un proveedor") → barra de navegación blanca.
- **Tarjeta-imagen:** foto con degradado oscuro en la parte baja (de transparente al 40 % hasta `--tone-900` al 70 %), texto blanco de dos líneas abajo a la izquierda y botón circular blanco con flecha abajo a la derecha.

### Patrón C · Hero de imagen + hoja
Para el detalle de un producto, servicio o registro.
- Foto de borde a borde en el 40–50 % superior, con botones circulares blancos flotando encima (volver, compartir).
- **Hoja blanca** que se monta sobre la foto: esquinas superiores con radio de 26–28 px y margen superior de −28 px.
- Contenido: título, subtítulo y valoración, con botón de favorito circular; una fila de 4 características (ícono + texto corto); y la descripción con "Ver más →".
- **CTA final:** tarjeta cerrada `--tone-900` con la acción y el precio en blanco, más un botón circular blanco con flecha.

### Patrón D · Imagen fundida
Para pantallas donde una imagen o un ambiente es el protagonista: temporada o colección, bienvenida, perfil con portada, clima, eventos.
- La imagen ocupa el 35–50 % superior **sin borde inferior**: se desvanece hacia abajo con una máscara (`mask-image: linear-gradient(to bottom, #000 45%, transparent)`).
- Debajo, el fondo toma el **color dominante de la imagen** (`--img-color`) y baja suavemente hasta el `--bg` de la paleta. Así la imagen se funde con el fondo y los dos colores se enlazan, sin línea de corte.
- Las tarjetas que caen sobre la zona de transición son **translúcidas (vidrio esmerilado)**: blanco al 30–40 %, `backdrop-filter: blur(14px)` y borde blanco de 1 px al 55 %. Así el color de la imagen se ve a través de ellas.
- Más abajo, las tarjetas vuelven a ser casi sólidas (blanco al 75–100 %).
- Texto sobre la imagen: blanco con sombra suave si la imagen es oscura o saturada; `--text` si es clara. Se decide automáticamente según la luminosidad de `--img-color`.
- Si la imagen cambia (otra temporada, otro producto), el color de fondo cambia con `tint-crossfade`.
- Opcional: partículas ambientales acordes a la imagen (hojas, nieve, lluvia, brillos) con `ambient-particles`.

**Cómo obtener `--img-color`:** se calcula al subir la imagen (promedio de su franja inferior) y se guarda junto a ella (columna `image_color`, ver `05-BACKEND-SCHEMA` §7). En web se calcula con un `<canvas>`; en React Native, con `react-native-image-colors`. Si no existe, se usa `--tint` de la paleta.

### Patrón E · Tareas y agenda por color
Para listas de tareas, pendientes, pedidos, citas, turnos y calendario: cualquier pantalla donde los elementos tienen un **tipo**.

**Código de color por tipo.** Cada tipo de actividad tiene un color fijo de `08-PALETAS` §5 (colores por categoría), que se repite igual en toda la app: en la lista, en el calendario, en los filtros y en las estadísticas. La tabla de tipos de cada app va en `03-APPFLOW` §2b.

**E1 · Cabecera de usuario** (va arriba en Inicio):
- A la izquierda, el logo de la app en un cuadro redondeado (radio de 12 px) con color de marca.
- Al lado, el saludo según la hora ("Buenos días," en `--text-2`) y debajo el **nombre del usuario** en negrita (17–18 px), con un emoji opcional. Bajo el nombre, una frase motivadora corta en `--text-2`, a 12 px.
- A la derecha, la campana en un círculo blanco con un **punto rojo** si hay notificaciones nuevas, y la **foto del usuario** en un círculo de 40–44 px con borde blanco de 2 px. Si no hay foto, se muestran sus iniciales sobre `--tint`. Tocar la foto abre el Perfil.
- Debajo puede ir el buscador: píldora blanca con ícono de lupa y botón de filtros al final.

**E2 · Tarjeta de tarea** (lista "Enfoque de hoy"):
- Tarjeta blanca de radio 16 px con la **franja de color del tipo a la izquierda**: 4 px de ancho, de alto completo y esquinas redondeadas (`--cat-{tipo}-stripe`).
- Contenido: casilla circular → título (600) → "Tipo · Prioridad" en `--text-2` → hora a la derecha → chevron.
- **Tarea completada:** la casilla se rellena con `--hero` y aparece el ✓. Después, la tarjeta **baja hasta el final de la lista desvaneciéndose** (queda al 50 % de opacidad) y las tareas siguientes suben a ocupar su lugar (`task-complete-sink`). El título no se tacha, para que siga legible. Si se desmarca, la tarea vuelve a subir al final de las pendientes.
- La cabecera de la sección lleva ícono + título + contador a la derecha ("3 tareas").

**E3 · Tira semanal (calendario):**
- Arriba, el mes y el año con un chevron que abre el selector de mes.
- Debajo, 7 días en fila, cada uno con el nombre corto arriba y el número abajo.
- El **día seleccionado** es una píldora vertical blanca, con el número dentro de un círculo `--cat-verde-bg` (o el `--tint` de la paleta) y el texto en `--hero`.
- Los días con eventos llevan debajo puntitos de los colores de sus tipos (máximo 3).

**E4 · Línea de tiempo del día:**
- A la izquierda, una columna de horas (11 px, `--text-2`) y una línea vertical fina punteada.
- A la derecha, las **tarjetas de evento**: franja izquierda del color del tipo → cuadro de ícono de 36 px con fondo `--cat-{tipo}-bg` e ícono `--cat-{tipo}-fg` → título y tipo → fila con los **avatares de los participantes** superpuestos (−8 px, borde blanco) y la hora "8:00 – 9:00" con ícono de reloj → menú "⋯" arriba a la derecha.

**E5 · Mini-estadísticas:** 3 tarjetas en fila, cada una con el ícono en un círculo del color de su categoría, el número grande, una etiqueta y un chip de tendencia ("↑ 67 %" en verde).

**E6 · Navegación:** igual que en todos los patrones: barra en píldora blanca donde **solo la pestaña activa muestra su nombre**, al costado del ícono, dentro de una píldora `--hero` (`label-slide`). Las demás quedan solo con ícono. El botón "+" va **dentro de la misma barra flotante**, como último elemento: es un círculo `--hero` de 40–44 px (ver la regla de la barra flotante en "Reglas comunes").

**E7 · Agregar actividad (relleno desde el botón):** al tocar "+", la pantalla **se llena de color desde el botón** en dos ondas circulares: primero un tono claro (`--tone-300`) y enseguida el oscuro (`--hero`). El "+" gira y se convierte en "×", y la barra se retira hacia la izquierda. Sobre el color aparece el formulario escalonado: título, campo de texto, chips de **tipo** con su color de categoría y chips de **hora**. Al elegir un chip, su color lo rellena desde el centro. "Agregar actividad" cierra el relleno de vuelta hacia el botón, y la actividad nueva entra arriba de la lista con su franja creciendo y un destello del color de su tipo (`fab-fill-reveal`).

### Patrón F · Pantallas de ingreso (inicio de sesión)
Para la pantalla de ingreso de cada app. Hay **7 variantes**; se elige una por app según su tipo, y su color sale de la paleta elegida (`08-PALETAS`). Vista en vivo: `ingreso/pantallas-ingreso.html` (página "Pantallas de ingreso").

| Variante | Concepto | Tipo de app sugerido | Paleta sugerida | Fondo | Efecto al ingresar |
|---|---|---|---|---|---|
| **F1 · Aurora difuminada** | Formas de color desenfocadas arriba que se funden en un fondo casi negro (la referencia) | IA, productividad | azul | 4 círculos `--tone-200…600` con desenfoque de 36 px y deriva lenta, más un degradado a negro desde el 30 % | `aurora-expand` |
| **F2 · Ola líquida** | Cabecera de color con olas animadas en su borde inferior | Nutrición, delivery, salud | verde | Degradado `--tone-400 → 700` en el 50 % superior; dos olas blancas desplazándose a distinta velocidad | `wave-flood` |
| **F3 · Orbes y vidrio** | Orbes de luz flotando detrás de una tarjeta de vidrio esmerilado | Finanzas, billeteras | índigo | Fondo `--tone-950` con 3 orbes desenfocados en movimiento; tarjeta translúcida con desenfoque de 18 px | `glass-expand` |
| **F4 · Mosaico** | Baldosas redondeadas que "respiran", como productos en un estante, y una insignia blanca con el logo | Inventario, tiendas, catálogos | azul marino | Rejilla 5 × 4 en tonos `--tone-100…800`, algunas con íconos; se funde hacia abajo (Patrón D) | `tiles-cascade` |
| **F5 · Pulso radial** | Anillos que laten alrededor del logo, con un electrocardiograma | Fitness, salud, bienestar | rojo | Degradado `--tone-500 → 800`; anillos blancos al 8–32 %; hoja blanca inferior con el formulario | `ring-burst` |
| **F6 · Ruta diagonal** | Fondo partido en diagonal con una ruta punteada y un punto que la recorre | Logística, transporte, envíos | naranja | Mitad superior `--tone-700 → 900` y mitad inferior blanca, cortadas en diagonal (60 % → 40 %) | `split-doors` |
| **F7 · Tipografía gigante** | El nombre de la marca en letras enormes desplazándose en 3 filas inclinadas | Moda, marcas, eventos | rosa | Fondo `--tone-950`; filas de letras de contorno y una fila rellena `--tone-500`; campos con solo línea inferior | `letter-zoom` |

**Contenido obligatorio (todas las variantes):**
- **Logo y nombre de la app**, más una frase corta que diga para qué sirve.
- **Campo "Usuario o correo"** y **campo "Contraseña"**, ambos con etiqueta flotante (`label-float`). La contraseña tiene un botón de ojo para mostrarla u ocultarla.
- Enlace **"¿Olvidaste tu contraseña?"** alineado a la derecha.
- **Botón "Ingresar"** a todo el ancho y en píldora.
- Debajo, **"¿No tienes cuenta? Regístrate"**.
- Opcional: "Ingresar con WhatsApp" o con Google, debajo del botón y separados por "o".

**Estados (todas las variantes):**
1. **Reposo:** el fondo tiene movimiento suave en bucle (deriva, olas, respiración, latido, ruta o letras). Si el sistema pide reducir movimiento, ese bucle se detiene.
2. **Error:** si falta un campo, el formulario se sacude (`shake-error`), el campo vacío se pone rojo y aparece "Completa usuario y contraseña". Si las credenciales son incorrectas, el mensaje lo dice con claridad.
3. **Cargando** y 4. **Correcto:** **cada variante tiene su propia micro-interacción**, sacada de su mismo concepto. No se usa el indicador giratorio ni el ✓ genéricos, porque repetirlos en todas las plantillas les quita identidad:

| Variante | Mientras carga (1.2 s) | Al confirmar (0.65 s) |
|---|---|---|
| F1 · Aurora | Un destello de luz de color recorre el botón una y otra vez; el texto dice "Conectando" (`btn-shimmer`) | El botón florece en luz: se aclara y lo rodea un halo de color; aparece "Bienvenido" en letra serif (`btn-bloom`) |
| F2 · Ola | El botón se llena de líquido desde abajo, con una ola en la superficie; el texto dice "Preparando tu plan" (`btn-liquid-fill`) | El líquido termina de llenarlo y aparece "¡Listo, a comer bien!" |
| F3 · Vidrio | Candado cerrado con el arco subiendo y bajando, más un pequeño forcejeo; el texto dice "Verificando" (`btn-unlock`) | El arco del candado se levanta y gira: "Desbloqueado" |
| F4 · Mosaico | Aparece un código de barras y una línea roja de escáner lo recorre de lado a lado (`btn-scan`) | Destello verde alrededor del botón y "Acceso concedido" con un punto verde |
| F5 · Pulso | Un electrocardiograma se dibuja a lo ancho del botón mientras el botón late (`btn-heartbeat`) | Un corazón late dos veces junto a "¡Vamos!" |
| F6 · Ruta | Un punto viaja por una ruta punteada desde la izquierda hasta el destino de la derecha (`btn-route`) | Un pin cae en su lugar junto a "En camino" |
| F7 · Tipografía | Las letras de "INGRESANDO" suben y bajan en ola (`btn-letter-wave`) | "BIENVENIDA" separa sus letras hasta desvanecerse, justo antes del `letter-zoom` |

**Regla general:** en cualquier pantalla nueva de cualquier app, la carga y la confirmación deben salir del concepto de esa pantalla o de esa app. El indicador giratorio con ✓ (`btn-loading` + `btn-success-morph`) queda solo como último recurso, cuando no hay un concepto claro.

El **error** sí es igual en todas (sacudida + campo rojo + mensaje) a propósito: el usuario tiene que reconocerlo al instante, en cualquier app.
5. **Efecto de entrada:** el formulario se desvanece y corre el efecto propio de la variante (0.8–1.1 s).
6. **Inicio:** aparece la pantalla de Inicio con sus elementos escalonados (`stagger-in`). Al cerrar sesión, el efecto se revierte rápidamente.

**Modo oscuro:** F1, F3 y F7 ya son oscuras y no cambian. En F2, F4, F5 y F6, las zonas blancas pasan a `--surface` y los campos a `--bg` de la paleta en modo oscuro, mientras las zonas de color mantienen su tono.

### Patrón G · Flujos guiados (ingreso y elección de opciones)
Cuatro modelos de recorrido; se combinan con el Patrón F (pantalla de ingreso). Vista en vivo: `flujos/efectos-flujo.html`. Referencia: `referencias/ref-06-efectos-flujo.mp4`.

| Modelo | Para | Recorrido | Efectos clave (`07-MOTION` §3.7) |
|---|---|---|---|
| **G1 · Onboarding oscuro** | Ingreso de apps de IA, productividad o SaaS | Splash con logo → 3 pantallas de beneficios (ilustración, título, puntos, "Continuar") → plan o paywall | `logo-draw`, `text-blur-reveal`, `float-stack`, `cluster-pop`, `chart-draw`, `glass-picker`, `screen-blur-dissolve`, `button-enable` |
| **G2 · Galería con profundidad** | Dentro de la app: elegir un elemento de una galería o lista y ver su resultado | Galería → hoja con el elemento elegido → carga → resultado | `depth-sheet`, `orb-breath`, `text-shimmer`, `image-focus-pull`, `ken-burns` |
| **G3 · Registro por pasos** | Ingreso y registro | Splash con botones de acceso → correo → código → nombre y apellido → listo | `logo-assemble`, `rings-radiate`, `stagger-up`, `step-progress`, `input-validate`, `otp-fill`, `placeholder-ghost`, `text-morph` |
| **G4 · Onboarding claro con red** | Apps de comunidad, contactos o resultados de búsqueda | Red de contactos → resultados con contador y carrusel → perfil destacado → oportunidades | `zoom-birth`, `network-radiate`, `pill-to-card`, `count-up`, `marquee-cards`, `card-flip-orbit` |

**Reglas comunes de los flujos:**
- **Una idea por pantalla:** título corto (máximo 7 palabras), una línea de apoyo y un solo botón principal.
- **El botón principal empieza deshabilitado** y se activa cuando terminó la animación de entrada o cuando el dato es válido (`button-enable`).
- **Indicador de avance siempre visible:** puntos en el onboarding y barra segmentada en el registro.
- **"Saltar"** arriba a la derecha en el onboarding; nunca en pasos obligatorios del registro.
- **Toque discreto (`tap-dot`)** en toda la app: un anillo pequeño donde tocó el dedo, nunca un círculo grande que llene el botón o la pantalla.

### Patrón H · Pedidos, pago y entrega a domicilio
Para apps de pedidos (menús, comida, farmacia, tienda) y para cualquier app con carrito o despacho. Vista en vivo: `pedidos/app-pedidos.html`. Referencia: `referencias/ref-07-app-pedidos.mp4`. Se puede usar completo o por partes (solo el carrito, solo el seguimiento, solo el efecto de agregar).

| Pantalla | Qué tiene | Efectos clave (`07-MOTION` §3.8) |
|---|---|---|
| **H1 · Inicio de tienda** | saludo + ubicación, título grande en dos tonos, botón de búsqueda redondo, accesos rápidos en 2 columnas, carrusel de tarjetas tonales con "+" y corazón, barra flotante con botón central de escaneo | `stagger-entrance`, `add-morph`, `fly-to-cart`, `badge-bump` |
| **H2 · Escáner** (opcional) | cámara a pantalla completa, píldora de ayuda arriba, obturador abajo | `circle-reveal`, `focus-pull`, `hint-swap`, `detect-corners`, `shutter-flash` |
| **H3 · Análisis** (opcional) | documento capturado con cajas por tipo, anillo de progreso, hoja con resultado y recomendación con % de coincidencia | `capture-straighten`, `scan-band`, `detect-boxes`, `progress-ring`, `result-sheet` |
| **H4 · Detalle del producto** | imágenes con tarjetas laterales asomando y puntos, nombre, descripción, precio, contador y botón principal abajo | `text-blur-reveal`, `heart-burst`, `stepper-roll`, `button-enable`, `add-success` |
| **H5 · Carrito** | productos con contador, código de descuento, resumen (subtotal, envío, descuento, total) y botón con el total | `promo-type`, `apply-morph`, `row-insert`, `total-roll` |
| **H6 · Pago** | dirección con "Cambiar", tipo de entrega en 2 tarjetas, medios de pago (Yape, Plin, tarjeta, efectivo), total y "Realizar pedido" | `option-slide`, `radio-fill`, `total-roll`, `btn-processing` |
| **H7 · Pedido realizado** | círculo con ✓, título, número de pedido y medio de pago; pasa solo al seguimiento | `success-circle`, `check-draw`, `ripple-rings`, `confetti-burst` |
| **H8 · Seguimiento** | mapa con ruta y repartidor, distancia en vivo, tarjeta del repartidor con llamada, línea de tiempo del pedido | `map-zoom-in`, `map-follow`, `route-progress`, `live-countdown`, `timeline-check` |

**Reglas del patrón:**
- **Todo agregado se ve llegar:** al agregar algo, siempre hay `fly-to-cart` + `badge-bump`; el usuario nunca duda de si se agregó.
- **Botones que cambian de estado, no mensajes sueltos:** cargar → ✓ en color de acento → volver a su texto. Nada de alertas.
- **El total siempre rueda** (`total-roll`) cuando cambia: descuento, envío exprés, cantidad.
- **Botón principal negro (o `--ink`) y éxito en color de acento** de la paleta elegida.
- **Medios de pago locales primero:** Yape y Plin arriba, luego tarjeta y efectivo.
- El escáner y el análisis (H2–H3) son opcionales: sirven para escanear cartas, recetas, boletas o etiquetas.

### Regla general de imágenes
En cualquier pantalla, una imagen grande de fondo o de cabecera **nunca termina en un corte duro contra el fondo**: o se funde con él (Patrón D) o la cubre una hoja con esquinas redondeadas (Patrón C). Las tarjetas-imagen pequeñas llevan el degradado inferior hacia oscuro (Patrón B).

### Reglas comunes
- Los botones de ícono son siempre circulares: blancos sobre fondo claro, translúcidos sobre fondo oscuro.
- **Barra de navegación flotante (regla para todas las apps):**
  - Es **una sola píldora flotante centrada** que contiene **todos** los elementos: 3–4 pestañas y, si la app tiene acción principal, el botón "+" como último elemento. El "+" **nunca** va como pieza separada al lado de la barra, porque al aparecer el nombre de la pestaña activa la barra se ensancha y lo empuja fuera de la pantalla.
  - El ancho de la barra se ajusta a su contenido (no ocupa todo el ancho) y tiene un máximo de "ancho de pantalla − 24 px". Al cambiar de pestaña cambia de ancho suavemente, siempre centrada.
  - Solo la pestaña activa muestra su nombre, al costado del ícono, dentro de una píldora `--nav-active` (`label-slide`). Las demás muestran solo el ícono.
  - Los nombres de las pestañas son de **una palabra y máximo 7 letras** (Inicio, Agenda, Chat, Stock, Perfil…). Así la barra entra con cualquier pestaña activa en un celular de 360 px.
  - Medidas: pestaña de 40 px de alto, 9 px de relleno lateral; botón "+" de 40–44 px; 2 px entre elementos y 5 px de relleno interior.
  - Al abrir "Nueva actividad" (`fab-fill-reveal`), las pestañas se desvanecen y la barra se vuelve transparente, pero el "+" se queda en su sitio y se convierte en "×".
  - Variantes de color: clara con píldora `--tone-900` (base) u oscura (por ejemplo, en StockZap).
- Radios grandes y siempre iguales: tarjetas 18–22 px, paneles y hojas 26–28 px, botones 999 px.
- El movimiento de cada patrón está en `07-MOTION.md`: `tone-cascade` (A), `layer-overlap-scroll` (B), `hero-parallax-sheet` (C), `image-fade-blend` + `tint-crossfade` + `ambient-particles` (D), `stripe-grow` + `task-check` + `task-complete-sink` + `fab-fill-reveal` + `day-select` + `timeline-stagger` + `avatar-spread` + `bell-ring` (E), los 7 efectos de ingreso (F) y `card-arrow-nudge`.

## 6. Componentes base

Para cada componente: variantes, estados y su animación (referencia a `07-MOTION`).

| Componente | Variantes | Estados | Motion |
|---|---|---|---|
| Botón | primario · secundario · fantasma · peligro · icono | reposo · hover · presionado · cargando · deshabilitado · éxito | `press-scale`, `btn-loading`, `btn-success-morph` |
| FAB "+" | normal · extendido | | `fab-morph`, `fab-rotate` |
| Barra inferior flotante | clara con píldora `--tone-900` (ref. 01) · oscura con píldora de marca | activo (ícono + nombre) / inactivo (solo ícono) | `indicator-slide`, `label-slide`, `icon-bounce`, `nav-hide-on-scroll` |
| Tarjeta | cerrada oscura · tintada · blanca · métrica | reposo · presionada | `card-lift`, `tone-cascade` |
| Tarjeta-imagen | grande · mediana | reposo · presionada | `card-arrow-nudge`, `shared-element` |
| Lista | simple · con acciones | | `stagger-in`, `swipe-reveal`, `reorder` |
| Input | texto · número · búsqueda | foco · error · válido | `label-float`, `shake-error` |
| Toggle / Checkbox | | on / off | `toggle-spring`, `check-draw` |
| Bottom sheet | media · completa | | `sheet-up`, `drag-dismiss` |
| Modal / diálogo | | | `modal-pop` |
| Toast | éxito · error · info | | `toast-slide` |
| Skeleton | | | `skeleton-shimmer` |
| Badge / contador | | cambia valor | `count-up`, `badge-pop` |
| Estado vacío | ilustración + CTA | | `float-idle` (Lottie) |

## 7. Iconografía e ilustración

- Íconos: se eligen en **`09-ICONOS.md`** (librería, estilo, tamaño, grosor y set completo), con el selector `iconos/selector-iconos.html`. Base recomendada: Phosphor Regular a 24 px, con Relleno para los estados activos.
- Ilustraciones / animaciones: Lottie para estados vacíos, éxito y onboarding.

## 8. Accesibilidad

- Contraste mínimo AA (4.5:1 texto, 3:1 elementos grandes).
- Objetivo táctil ≥ 44×44 px.
- El estado nunca se comunica solo con color (añadir icono o texto).

## 9. Personalización de esta app

| Token / componente | Valor en esta app |
|---|---|
| `--brand-500` | {{}} |
| Tono de la escala `--tone-*` | {{azul marino (base) / otro}} |
| Variante de barra de navegación | {{clara / oscura}} |
| Fuente | {{}} |
| Otros | {{}} |
