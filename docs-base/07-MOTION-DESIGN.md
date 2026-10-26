---
documento: Motion Design System — Movimiento, transiciones e interacción
version_base: 1.1
app: "{{NOMBRE_APP}}"
nivel_de_movimiento: "expresivo"   # estándar | expresivo
ultima_actualizacion: "{{AAAA-MM-DD}}"
---

# 07 · Motion Design — Cómo se mueve

> **Para qué sirve:** que **cada** botón, tarjeta, pantalla y dato tenga movimiento, y que ese movimiento sea coherente en todas tus apps.
> **Regla de oro para la IA:** *ninguna interacción queda sin respuesta visual.* Si el usuario toca, arrastra, espera o recibe algo, algo se mueve. Usa siempre los nombres y tokens de este documento; no inventes duraciones ni curvas.

---

## 1. Principios

1. **Feedback inmediato (< 100 ms).** Al tocar, el elemento reacciona *antes* de que llegue la respuesta del servidor.
2. **El movimiento explica.** Un elemento sale de donde se tocó y vuelve a donde estaba. La dirección indica jerarquía: avanzar → entra por la derecha; subir de nivel → sube desde abajo.
3. **Física, no robótica.** Preferimos *springs* (resortes) a curvas lineales: los objetos tienen peso, rebotan un poco y se asientan.
4. **Coreografía.** Nunca todo a la vez: los elementos entran escalonados (stagger), de lo más importante a lo secundario.
5. **Continuidad.** Un mismo objeto no "desaparece y reaparece": se transforma (shared element, morph).
6. **Rápido al salir, generoso al entrar.** Las salidas duran ~70 % de las entradas.
7. **Solo `transform` y `opacity`.** Para mantener 60 fps en celulares de gama media.
8. **Respeta al usuario.** Si activó "reducir movimiento", se reemplaza desplazamiento por fundido (ver §8).

---

## 2. Tokens de movimiento

Viven en `/src/motion/tokens.ts` y `/src/styles/tokens.css`. **Cada app hereda estos valores**; solo cambia `nivel_de_movimiento` (multiplica distancias y rebote).

### 2.1 Duraciones

| Token | ms | Uso |
|---|---|---|
| `instant` | 80 | presionar botón, cambio de color |
| `fast` | 150 | hover, toggles, iconos |
| `base` | 240 | tarjetas, toasts, chips |
| `slow` | 360 | modales, sheets, cambio de pantalla |
| `slower` | 500 | shared element, onboarding |
| `celebrate` | 800–1200 | animaciones de éxito, logros |

### 2.2 Curvas (easing)

| Token | cubic-bezier | Uso |
|---|---|---|
| `standard` | (0.2, 0, 0, 1) | movimientos generales |
| `enter` (decelerate) | (0, 0, 0, 1) | elementos que entran |
| `exit` (accelerate) | (0.3, 0, 1, 1) | elementos que salen |
| `emphasized` | (0.2, 0, 0, 1.2) | entradas con carácter (pasa un poco y se asienta) |
| `overshoot` | (0.34, 1.56, 0.64, 1) | pops, badges, FAB |

### 2.3 Springs (resortes)

| Token | stiffness | damping | mass | Sensación |
|---|---|---|---|---|
| `spring-snappy` | 500 | 30 | 1 | botones, toggles |
| `spring-smooth` | 300 | 30 | 1 | tarjetas, sheets |
| `spring-bouncy` | 400 | 15 | 1 | badges, FAB, éxito |
| `spring-gentle` | 120 | 20 | 1 | elementos flotantes, parallax |

### 2.4 Distancias y escalas

| Token | Valor | Uso |
|---|---|---|
| `shift-sm` | 8 px | entrada de ítems de lista |
| `shift-md` | 24 px | tarjetas, toasts |
| `shift-lg` | 100 % | pantallas completas |
| `press-scale` | 0.96 | botones y tarjetas al presionar |
| `lift-scale` | 1.02 | tarjeta levantada |
| `pop-scale` | 1.15 | badge / icono al activarse |
| `stagger` | 40 ms | retraso entre hijos de una lista (máx. 8 hijos animados) |

### 2.5 Multiplicador por nivel

| Nivel | Distancias | Rebote (damping) | Para qué apps |
|---|---|---|---|
| estándar | ×1 | igual | pantallas con mucha información, apps de trabajo |
| **expresivo (base)** | ×1.25 | −5 | apps de consumo, como las tuyas |

Solo hay **dos niveles**. El nivel "sutil" se retiró porque se movía demasiado poco: cualquier app usa estándar o expresivo.

---

## 3. Catálogo de animaciones (nombres oficiales)

Estos nombres son los que se usan en `03-APPFLOW.md` y `04-UIUX-DESIGN-BRIEF.md`.

### 3.1 Micro-interacciones (botones y controles)

| Nombre | Disparador | Qué pasa | Token |
|---|---|---|---|
| `press-scale` | pointer down | escala a 0.96, sombra baja de e2 a e1 | spring-snappy |
| `release-bounce` | pointer up | vuelve a 1 con ligero rebote (1.02 → 1) | spring-bouncy |
| `tap-dot` | tap (reemplaza al `ripple` grande) | **punto de toque discreto**: un anillo de 26 px con borde de 1.5 px al 55 % y relleno al 10 %, que nace donde tocó el dedo, crece ×1.25 y se desvanece en 420 ms. Nunca un círculo que llene el botón o la pantalla |
| `hover-lift` | hover (web) | sube 2 px, sombra e2 | fast |
| `btn-loading` | acción enviada | el texto se desvanece, aparece spinner, el botón se encoge a círculo | base |
| `btn-success-morph` | acción OK | el círculo se vuelve verde y dibuja un ✓, luego regresa al botón | slow + check-draw |
| `shake-error` | error de validación | sacudida horizontal ±6 px, 3 ciclos | 300 ms |
| `toggle-spring` | toggle | la perilla viaja con resorte; el fondo cambia de color | spring-snappy |
| `check-draw` | checkbox | el ✓ se dibuja con `stroke-dashoffset` | fast |
| `label-float` | foco en input | la etiqueta sube y se achica; el borde se ilumina | fast |
| `icon-draw` | ícono de línea que aparece (éxito, onboarding) | cada trazo se dibuja con `stroke-dashoffset` (900 ms) |
| `icon-spin` | actualizar / sincronizar | una vuelta completa (700 ms) |
| `icon-beat` | me gusta, pulso | late dos veces (×1.25 y ×1.15, 800 ms) |
| `icon-wiggle` | campana, alerta | se balancea ±14° y se asienta (500 ms) |
| `icon-press` | toque en cualquier ícono (base) | escala 1 → 0.78 → 1.08 → 1 (460 ms) |
| `icon-jelly` | carrito, caja, billetera | aplastar y estirar: 1.25×0.75 → 0.8×1.2 → … → 1 (700 ms) |
| `icon-lift` | buscar, subir, destacados | sube 9 px con sombra y se asienta con resorte (750 ms) |
| `icon-flip` | desbloquear, monedas | rotateY 360° con perspectiva (700 ms) |
| `icon-swing` | campana, llamar | balanceo con pivote arriba: 18°, −14°, 9°, −5° (900 ms) |
| `icon-tada` | regalo, anuncio, logro | encoge, crece ×1.15 y tiembla ±5° (850 ms) |
| `icon-fly` | enviar, compartir | sale en diagonal arriba-derecha, reaparece abajo-izquierda y vuelve (900 ms) |
| `icon-ring` | confirmar, micrófono | dos anillos del color del ícono se expanden ×1.9 (650 ms, el segundo a los 120 ms) |
| `icon-echo` | cámara | copia del ícono que crece ×1.9 y se desvanece (650 ms) |
| `icon-burst` | me gusta, favorito | 10 partículas salen en círculo y se desvanecen (760 ms) |
| `icon-shine` | rápido, IA, ideas | destello blanco que cruza el ícono recortado a su forma (950 ms) |
| `icon-bounce` | ícono activado | escala 1 → 1.15 → 1 y rotación leve | spring-bouncy |
| `icon-morph` | cambio de estado | menú ☰ ↔ ✕, play ↔ pausa, corazón vacío ↔ lleno | base |
| `fab-rotate` | abrir FAB | "+" rota 45° a "×" | spring-snappy |
| `fab-morph` | tocar FAB | el FAB se expande y se convierte en la hoja/pantalla nueva | slower |
| `fab-speed-dial` | FAB abierto | opciones salen en abanico con stagger | spring-bouncy |
| `long-press-fill` | mantener presionado | relleno circular que se completa antes de confirmar | 600 ms |

### 3.2 Navegación y traslaciones entre pantallas

| Nombre | Cuándo | Movimiento |
|---|---|---|
| `push-slide` | ir a detalle | nueva pantalla entra desde la derecha (100 %); la anterior se desplaza −30 % y se oscurece |
| `pop-slide` | volver | inverso; también con gesto de deslizar desde el borde |
| `shared-element` | tarjeta → detalle | la imagen/título de la tarjeta viaja y crece hasta su lugar en el detalle (`layoutId`) |
| `tab-crossfade` | cambiar pestaña | fundido + desplazamiento lateral de 24 px según dirección de la pestaña |
| `indicator-slide` | barra inferior | la "píldora" activa se desliza con resorte al nuevo ítem y se estira al ancho de ícono + nombre |
| `label-slide` | barra inferior | al tocar una pestaña, su nombre aparece al costado del ícono deslizándose desde la izquierda (−12 px → 0, ancho 0 → auto, fundido); el nombre de la pestaña anterior se recoge y desaparece al mismo tiempo. Solo la pestaña activa muestra nombre |
| `nav-hide-on-scroll` | scroll hacia abajo | la barra flotante baja y desaparece; reaparece al subir |
| `sheet-up` | abrir hoja | sube desde abajo con resorte; fondo se oscurece al 40 % |
| `drag-dismiss` | arrastrar hoja | sigue el dedo; si pasa 30 % o velocidad alta, se cierra |
| `modal-pop` | diálogo | escala 0.9 → 1 + fundido; fondo con desenfoque |
| `zoom-through` | entrar a una sección | la pantalla actual crece y se desvanece, la nueva aparece desde 0.95 |
| `onboarding-parallax` | slides de bienvenida | ilustración se mueve más lento que el texto |

### 3.3 Listas, tarjetas y contenido

| Nombre | Cuándo | Movimiento |
|---|---|---|
| `stagger-in` | aparece lista | cada ítem sube 8 px y aparece, 40 ms tras el anterior |
| `card-lift` | presionar / hover | tarjeta escala 1.02 y sombra e2 |
| `card-tilt` | mover el dedo/cursor sobre tarjeta destacada | inclinación 3D leve (±6°) |
| `swipe-reveal` | deslizar ítem | revela acciones (eliminar, editar); ícono crece al acercarse al umbral |
| `swipe-delete` | confirmar borrado | el ítem sale lateral y el resto de la lista sube suavemente (layout) |
| `reorder` | arrastrar para ordenar | el ítem se levanta (sombra e3), los demás se apartan |
| `expand-collapse` | acordeón | altura animada + flecha rota 180° |
| `insert-highlight` | nuevo ítem | entra desde arriba y su fondo destella en color de marca 1 vez |
| `live-update-flash` | dato cambia en tiempo real | el valor parpadea suavemente en color (verde sube / rojo baja) |
| `scroll-reveal` | scroll | secciones aparecen al entrar en pantalla |
| `sticky-shrink` | scroll | el encabezado grande se reduce a barra compacta |
| `parallax-header` | scroll | la imagen de cabecera se mueve a 50 % de velocidad |
| `tone-cascade` | entrar a pantalla patrón A | las tarjetas entran en orden de tono (oscura → tintada → blanca), cada una sube 14 px con escala 0.98 → 1, 70 ms entre una y otra |
| `layer-overlap-scroll` | scroll en patrón B | el panel claro sube y tapa la cabecera oscura; el título de la cabecera sube a 35 % de velocidad, se achica levemente y se desvanece |
| `hero-parallax-sheet` | scroll en patrón C | la foto se mueve a 50 % de velocidad mientras la hoja blanca sube sobre ella |
| `card-arrow-nudge` | presionar / hover en tarjeta-imagen | el botón circular de flecha avanza 3 px a la derecha con resorte |
| `image-fade-blend` | entrar a pantalla patrón D | la imagen aparece con fundido y un leve zoom (1.06 → 1, 1.2 s) mientras el fondo ya muestra su color |
| `tint-crossfade` | cambia la imagen (patrón D) | la imagen nueva entra en fundido cruzado y el color de fondo pasa al nuevo `--img-color` en 700 ms; el título cambia con `stagger-in` |
| `stripe-grow` | entrar a lista o agenda (patrón E) | la franja de color de cada tarjeta crece de arriba hacia abajo (scaleY 0 → 1) justo después de que la tarjeta entra con `stagger-in` |
| `task-check` | marcar una tarea | la casilla se rellena desde el centro con resorte, el ✓ se dibuja (`check-draw`) y la tarjeta hace un pulso (1 → 1.025 → 1); enseguida sigue `task-complete-sink` |
| `task-complete-sink` | después de `task-check` | la tarjeta completada **viaja hasta el final de la lista** pasando por debajo de las demás y **se desvanece lentamente mientras baja** (opacidad 1 → 0.5, 1.1 s, curva suave). Las tareas siguientes **suben** con resorte (560 ms, 140 ms de retraso) a ocupar su lugar. Al desmarcar, la tarea sube de vuelta con la opacidad completa |
| `fab-fill-reveal` | tocar el FAB "+" | relleno circular desde el centro del botón que cubre toda la pantalla en **dos ondas** (tono claro y, 120 ms después, `--hero`; 640 ms, curva `cubic-bezier(.7,0,.2,1)`). El "+" gira 135° y se vuelve "×", y la barra se retira. El formulario entra escalonado (cada elemento sube 16 px, 40 ms entre uno y otro). Al cerrar, las ondas vuelven al botón en orden inverso |
| `btn-shimmer` / `btn-bloom` | cargar / confirmar (F1) | una banda de luz `--tone-400` cruza el botón cada 1 s; al confirmar, el botón pasa a `--tone-100` y gana un halo de 42 px |
| `btn-liquid-fill` | cargar / confirmar (F2) | el nivel de líquido (blanco al 26 % con ola animada en la superficie) sube al 78 % en 1.2 s y llega al 100 % al confirmar |
| `btn-unlock` | cargar / confirmar (F3) | el arco del candado sube y baja (0.55 s) con un forcejeo cada 1.1 s; al confirmar, el arco sube 4 px y gira −30° con resorte |
| `btn-scan` | cargar / confirmar (F4) | un código de barras con una línea roja brillante que va y viene (0.6 s); al confirmar, un anillo verde se expande alrededor del botón |
| `btn-heartbeat` | cargar / confirmar (F5) | el electrocardiograma se dibuja cada 1 s y el botón late (1 → 1.035 → 1 → 1.02); al confirmar, el corazón late dos veces (×1.4 y ×1.25) |
| `btn-route` | cargar / confirmar (F6) | un punto recorre la ruta punteada de izquierda a derecha en 1.2 s; al confirmar, un pin cae con resorte |
| `btn-letter-wave` | cargar / confirmar (F7) | cada letra sube 5 px en ola (55 ms entre letras); al confirmar, el espaciado entre letras crece hasta 0.7 em mientras el texto se desvanece |
| `aurora-expand` | ingresar (F1) | los círculos desenfocados crecen ×3.4 y bajan un 28 % mientras el degradado oscuro se desvanece; la pantalla se llena de luz de color (1.1 s, `cubic-bezier(.65,0,.25,1)`) |
| `wave-flood` | ingresar (F2) | una capa del color de la app con borde de ola animada sube desde abajo hasta cubrir la pantalla (1 s); la ola sigue moviéndose mientras sube |
| `glass-expand` | ingresar (F3) | la tarjeta de vidrio se expande hasta los cuatro bordes, pierde el redondeo y se vuelve sólida `--tone-900` (760 ms) |
| `tiles-cascade` | ingresar (F4) | una rejilla de 6 × 12 baldosas en `--tone-800/900` aparece en diagonal desde la esquina superior izquierda, cada una con 28 ms de diferencia y resorte, hasta cubrir la pantalla |
| `ring-burst` | ingresar (F5) | los anillos crecen ×6 y se desvanecen, el círculo del logo late (×1.3), la hoja del formulario baja, y un relleno blanco circular nace del logo hasta cubrir todo (900 ms) |
| `split-doors` | ingresar (F6) | las dos mitades diagonales se separan como puertas (la de arriba sube hacia la izquierda y la de abajo baja hacia la derecha, 1 s) y dejan ver el fondo de la app |
| `letter-zoom` | ingresar (F7) | la primera letra de la marca aparece al centro en `--tone-500` y crece ×34 hasta que su color llena la pantalla (1.05 s) |
| `chip-fill` | elegir un chip (tipo, hora, filtro) | el color del chip lo rellena desde el centro con resorte (escala 0 → 1) y su punto pasa a blanco |
| `day-select` | tocar un día de la tira semanal | la píldora blanca se desliza al nuevo día (como `indicator-slide`) y el círculo del número hace pop; las tarjetas del día anterior salen hacia el lado contrario y las nuevas entran con `timeline-stagger` |
| `timeline-stagger` | cambia el día | la línea vertical se dibuja de arriba abajo y las tarjetas entran desde la derecha (12 px) con 50 ms de diferencia entre una y otra |
| `avatar-spread` | presionar o pasar sobre los avatares | los avatares superpuestos se separan 6 px cada uno con resorte y vuelven al soltar |
| `bell-ring` | llega una notificación | la campana se balancea (±14°, 2 ciclos) y el punto rojo aparece con `badge-pop` |
| `ambient-particles` | patrón D, opcional | partículas acordes a la imagen (hojas que caen balanceándose, nieve, lluvia, brillos que suben). Máximo 30, en una capa encima de la imagen y sin bloquear toques; se desactivan con "reducir movimiento" |

### 3.4 Datos y números

| Nombre | Movimiento |
|---|---|
| `count-up` | números cuentan de 0 (o del valor anterior) al valor nuevo |
| `bar-grow` | barras de gráfico crecen desde la base con stagger |
| `line-draw` | líneas de gráfico se dibujan de izquierda a derecha |
| `progress-fill` | barras/anillos de progreso se llenan con resorte |
| `badge-pop` | contador de notificaciones aparece con pop y rebota al cambiar |

### 3.5 Estados del sistema

| Nombre | Movimiento |
|---|---|
| `skeleton-shimmer` | brillo diagonal que recorre los placeholders (1.2 s en bucle) |
| `pull-refresh` | indicador elástico que se estira con el dedo y gira al soltar |
| `toast-slide` | entra desde abajo (o arriba) con resorte; se puede deslizar para descartar |
| `success-check` | círculo se dibuja + ✓ + pequeño confeti (Lottie) |
| `empty-float` | ilustración del estado vacío flota suavemente (±4 px, 3 s bucle) |
| `offline-banner` | banner baja desde arriba; al recuperar conexión se pone verde y sube |
| `scan-line` | en el escáner QR, una línea recorre el marco; al detectar, el marco se ajusta al código y vibra |

### 3.6 Háptica (móvil)

| Evento | Vibración |
|---|---|
| tap en botón primario | ligera (`light`) |
| toggle / selección | `selection` |
| éxito | `success` |
| error | `error` |
| QR detectado | `medium` |


### 3.7 Efectos de flujo (ingreso y elección de opciones)

Modelos en vivo: `flujos/efectos-flujo.html` (página "Efectos de flujo"). Referencia: `referencias/ref-06-efectos-flujo.mp4` (solo los ejemplos de la izquierda y del centro).

| Nombre | Dónde | Qué pasa |
|---|---|---|
| `logo-draw` | splash | el trazo del logo se dibuja (1.1 s), se rellena (0.5 s) y luego se encoge y desvanece |
| `logo-assemble` | splash | las piezas del logo llegan girando desde fuera y se ensamblan con resorte; el logo sube y se achica para dejar espacio al título |
| `zoom-birth` | splash / primera pantalla | todo el contenido nace a escala 0.55 y crece hasta 1 (900 ms) |
| `text-blur-reveal` | títulos | cada palabra aparece desde un desenfoque de 8 px y 6 px más abajo, 70 ms después de la anterior; en fondos oscuros entra en gris y termina en blanco |
| `text-morph` | título entre pasos | el título viejo sube y se desenfoca mientras el nuevo aparece en el mismo lugar |
| `screen-blur-dissolve` | cambio de pantalla | la pantalla que sale se desenfoca 12 px, se achica a 0.97 y se desvanece; la nueva entra desde desenfoque y escala 1.03 (520 ms) |
| `depth-sheet` | elegir un elemento | el fondo crece a 1.1, se desenfoca 3 px y se oscurece al 55 % mientras la hoja sube con resorte; tocar fuera lo revierte |
| `float-stack` | ilustración de onboarding | tarjetas apiladas e inclinadas que flotan suavemente (±6 px, 4 s) |
| `cluster-pop` | íconos, avatares, integraciones | cada elemento aparece desde escala 0.3 con resorte, 80 ms después del anterior |
| `network-radiate` | contactos | los avatares salen del nodo central hacia su lugar y las líneas que los unen se dibujan |
| `pill-to-card` | sugerencia → resultado | una píldora de búsqueda cambia de forma (ancho, alto y radio) hasta ser una tarjeta con contenido (600 ms) |
| `chart-draw` + `count-up` | métricas | la línea se dibuja, el área aparece debajo y el número cuenta hasta su valor |
| `glass-picker` | elegir plan u opción | lista de vidrio esmerilado (desenfoque 16 px) que abre hacia abajo desde el selector con resorte; la opción elegida queda marcada y el precio cambia contando |
| `orb-breath` + `text-shimmer` | carga | orbe de degradado que respira (escala 1.08 y cambio de tono, 2.2 s) y texto con un brillo que lo recorre |
| `image-focus-pull` + `ken-burns` | resultado / imagen | la imagen pasa de desenfoque de 18 px a nítida (1.6 s) y luego se acerca lentamente |
| `rings-radiate` | splash / bienvenida | anillos que nacen del logo y se expanden ×7 desvaneciéndose, uno cada 0.9 s |
| `stagger-up` | botones de acceso | los botones suben 20 px uno tras otro con resorte |
| `step-progress` | registro por pasos | barra segmentada arriba; el segmento del paso actual se llena de izquierda a derecha |
| `input-validate` | formularios | si el dato es inválido, el campo se sacude y aparece el mensaje en rojo debajo; al corregirlo, desaparece |
| `otp-fill` | código de verificación | 6 casillas; la casilla activa se ilumina y cada dígito entra con un pequeño pop |
| `placeholder-ghost` | campos de texto | el ejemplo del campo cambia solo (Juan → María → Jay) con un fundido, hasta que el usuario escribe |
| `button-enable` | botón principal | gris y deshabilitado hasta que la pantalla terminó de aparecer o el dato es válido; luego pasa a su color con una transición de 450 ms |
| `marquee-cards` | resultados, candidatos | fila de tarjetas que se desplaza sin fin, con los bordes desvanecidos |
| `card-flip-orbit` | perfil destacado | la tarjeta entra girando en 3D (rotateY 100° → 0°) y una órbita con un punto gira a su alrededor |

### 3.8 Efectos de pedido, pago y entrega (Patrón H)

Modelo en vivo: `pedidos/app-pedidos.html` (página "App de pedidos"). Referencia: `referencias/ref-07-app-pedidos.mp4` (sin sonido). Cada efecto funciona solo: se puede usar un efecto suelto (por ejemplo, solo `fly-to-cart` en StockZap) sin el resto del flujo.

| Nombre | Dónde | Qué pasa |
|---|---|---|
| `stagger-entrance` | inicio | avatar, título (palabra por palabra), accesos, tarjetas y barra entran desde 12 px abajo con desenfoque de 4 px, 70 ms después del anterior, con resorte |
| `add-morph` | "+" de una tarjeta | el "+" muestra un anillo de color girando (550 ms) y cambia a ✓ sobre fondo de acento; vuelve a "+" a los 1.8 s |
| `fly-to-cart` | agregar al carrito | una miniatura del producto sale de la tarjeta, sube en arco unos 70 px y cae sobre el ícono del carrito encogiéndose a 0.35 (780 ms) |
| `badge-bump` | contador del carrito | al llegar la miniatura, el contador salta a 1.45 con resorte y cambia de número |
| `circle-reveal` | abrir cámara o escáner | la pantalla nueva se abre como un círculo que nace del botón tocado (650 ms) |
| `focus-pull` | cámara | el fondo y el documento pasan de desenfocados a nítidos (900 ms) |
| `hint-swap` | cámara | la píldora de ayuda cambia de mensaje con un pequeño pop: "Apunta a la carta" → "No te muevas…" → "✓ Carta detectada" (en color de acento) |
| `detect-corners` | cámara | cuatro esquinas de acento se cierran sobre el documento con resorte y lo tiñen suavemente |
| `shutter-flash` | captura | el obturador se hunde y un destello blanco (520 ms) cubre la pantalla |
| `capture-straighten` | después de capturar | la foto se endereza (de −9° a 0°) y crece hasta su lugar en la pantalla de análisis |
| `scan-band` | análisis | una banda de luz de acento barre el documento de arriba a abajo dos veces (1.2 s cada una) |
| `detect-boxes` | análisis | sobre cada renglón aparece una caja de color con etiqueta (Entrada, Fondo, Postre, Bebida), una cada 330 ms; cada tipo usa su color de `08-PALETAS` §5 |
| `progress-ring` | análisis o carga larga | anillo que se llena con el porcentaje de 0 a 100 %; al terminar, cambia al color de acento y muestra ✓ |
| `result-sheet` | resultado | el fondo se oscurece al 35 % y sube una hoja con resorte con el resultado y la recomendación |
| `heart-burst` | favorito | el corazón crece a 1.4, se rellena y suelta 8 partículas en círculo |
| `stepper-roll` / `total-roll` | cantidad, total, precio del botón | el número viejo sube y desaparece mientras el nuevo entra desde abajo (420 ms) |
| `add-success` | botón principal de agregar | indicador girando → fondo de acento con "✓ Agregado al carrito" + `fly-to-cart` → vuelve a su texto a los 1.6 s |
| `promo-type` | código de descuento | al tocar el campo, el código sugerido se escribe solo, letra por letra (110 ms) |
| `apply-morph` | "Aplicar" | texto → indicador girando → "✓ Aplicado" en color de acento |
| `row-insert` | resumen de compra | la fila de descuento se despliega (alto 0 → normal) y luego rueda el total |
| `option-slide` | elegir tipo de entrega | el contorno de la opción elegida se desliza a la otra tarjeta con resorte (450 ms) |
| `radio-fill` | medio de pago | el punto interior crece desde 0 con resorte |
| `btn-processing` | pagar | el texto sube y desaparece y queda un indicador girando hasta la respuesta |
| `success-circle` + `check-draw` + `ripple-rings` | pago exitoso | círculo de acento que crece con rebote, ✓ que se dibuja dentro y dos ondas que salen |
| `confetti-burst` | pago exitoso | unas 90 piezas de colores estallan desde el centro y caen con gravedad (3.6 s) |
| `map-zoom-in` | seguimiento | el mapa entra alejado (0.6) y se acerca al repartidor |
| `map-follow` | seguimiento | el mapa se mueve para mantener al repartidor al centro y gira suavemente en cada esquina |
| `route-progress` | seguimiento | el tramo pendiente en color de acento y el recorrido en gris |
| `live-countdown` | seguimiento | km y minutos cuentan hacia atrás; el punto "En vivo" late |
| `timeline-check` | estado del pedido | los pasos se marcan uno a uno con ✓ y la línea que los une se llena; el paso actual late |

### 3.9 Movimientos de interacción · grupos Mov A–F

Página en vivo: `movimientos/movimientos-interaccion.html` (página "Movimientos de interacción"), con selector **Estándar / Expresivo**. Origen: 14 bloques de bencho.dev (columna izquierda: el último; centro: 1, 3, 4, 11 y 13; derecha: 2, 3, 5, 7, 8, 10, 11 y 12), recreados desde cero, más 4 propios (marcados ✦).

Los efectos parecidos están juntos en **6 grupos con nombre corto**, para pedirlos fácil: *"en el carrito usa Mov A"*, *"en favoritos, Mov B"*. Los grupos de movimiento (Mov A–F) **no son** los patrones de pantalla A–H de `04-UIUX`: los patrones dicen cómo se arma una pantalla; los Mov dicen cómo responde un elemento.

| Grupo | Cuándo usarlo | Efectos |
|---|---|---|
| **Mov A · Contar** | cuando **cambia un número** | `odometer-roll` |
| **Mov B · Reaccionar** | cuando el usuario **expresa algo** (le gusta, reacciona) | `like-burst`, `emoji-fly` |
| **Mov C · Apilar** | cuando hay **varias tarjetas** y se ve una a la vez | `card-swap`, `carousel-3d`, `toast-fan`, `flip-reveal` ✦ |
| **Mov D · Estirar** | cuando el usuario **arrastra o mantiene** algo | `slosh-slider`, `compare-drag`, `pull-stretch`, `hold-fill` ✦ |
| **Mov E · Completar** | cuando **ingresa datos o termina** una tarea | `otp-boxes`, `drop-upload`, `ticket-print` ✦ |
| **Mov F · Elegir** | cuando **selecciona o despliega** opciones | `avatar-stack`, `palette-morph`, `corner-unfold`, `chip-magnet` ✦ |

**Detalle de cada efecto** (valores en nivel estándar → expresivo):

| Grupo | Nombre | Origen | Qué pasa | Estándar → Expresivo |
|---|---|---|---|---|
| A | `odometer-roll` | Rolling counter | cada dígito rueda en su columna y arrastra al siguiente, de derecha a izquierda (45 ms entre columnas) con un leve desenfoque; mantener +/− acelera (×5 tras 1 s); arrastrar el número lo cambia y al soltarlo sigue por inercia | 440 → 520 ms, rebote bajo → alto |
| B | `like-burst` | Like | el corazón baja a 0.6, salta y se rellena; sale un anillo que crece y 8 chispas en círculo; el contador usa `odometer-roll` | salto ×1.3 → ×1.38, chispas a 34 → 42 px |
| B | `emoji-fly` | Emoji reactions | del botón nace una píldora de emojis (escala desde el botón); el que está bajo el dedo crece y sus vecinos menos (efecto lupa); el elegido vuela en arco a su chip, que late, y su número rueda | lupa ×1.55 → ×1.69, arco 50 → 62 px |
| C | `card-swap` | Card swap | la tarjeta de adelante sube y gira un poco, pasa al fondo y las demás avanzan un paso (−14 px y −6 % de tamaño por nivel); se puede lanzar; modo automático cada 4 s | subida 150 → 188 px |
| C | `carousel-3d` | Carousel | 6 tarjetas en una tornamesa 3D que flotan (±4 px), se inclinan según la altura del puntero y giran al deslizar con inercia; al detenerse se asientan en la más cercana | inclinación 14° → 17° |
| C | `toast-fan` | Toast stack | 3 avisos apilados que asoman 12 px por arriba; al tocar o pasar se abren en lista con resorte y al salir se vuelven a apilar | asomo 12 → 15 px |
| C | `flip-reveal` ✦ | propio | la tarjeta gira 180° en 3D y atrás muestra el detalle (tallas, nutrientes) sin cambiar de pantalla | 600 → 700 ms |
| D | `slosh-slider` | Slosh slider | el relleno sigue al control con inercia de resorte: si se arrastra rápido se pasa del borde, se inclina (hasta 25°) y vuelve | más amortiguado → más oleaje |
| D | `compare-drag` | Image compare | una línea divide dos imágenes; si se lanza (más de 0.5 px/ms) se desliza sola hasta el borde | 420 ms → 525 ms de deslizamiento |
| D | `pull-stretch` | Pull to refresh | al tirar, la tarjeta baja con resistencia y se estira hasta 8 %; 6 puntos se encienden según el avance; pasada la línea (70 px), al soltar giran y entra el dato nuevo desde arriba | estiramiento 8 → 10 % |
| D | `hold-fill` ✦ | propio | al mantener presionado, el botón se llena de líquido con ola en 1.2 s; si se suelta antes se vacía en 0.4 s; al llenarse confirma y late | igual |
| E | `otp-boxes` | One-time code | seis casillas que son un solo campo (pegar, autocompletar y borrar funcionan); cada dígito entra con un pop; correcto → ola verde de izquierda a derecha; incorrecto → sacudida roja y se borra | sacudida 10 → 12.5 px |
| E | `drop-upload` | Upload dropzone | la caja crece 4 % y se ilumina al pasar el archivo; barra de progreso y ✓ que salta; si pesa demasiado, sacudida roja y mensaje con el límite | crecimiento 4 → 5 % |
| E | `ticket-print` ✦ | propio | la boleta sale de la ranura a saltos, línea por línea, y el total rueda (`odometer-roll`); al tocarla se corta y cae girando | giro al caer 14° → 17° |
| F | `avatar-stack` | Assignees | al marcar a alguien, su cara vuela desde la lista y se apila en la píldora (superpuestas 10 px); al desmarcar se encoge y sale | arco 40 → 50 px |
| F | `palette-morph` | Palette | cada franja cambia al siguiente juego de colores una tras otra (70 ms) con un leve aplastamiento; usa las combinaciones de `08-PALETAS` §4b | aplastamiento 8 → 10 % |
| F | `corner-unfold` | Action node | las acciones viven plegadas en la esquina; al tocar salen en abanico una tras otra (55 ms) y la tarjeta se recoge a 0.97 | radio 62 → 69 px |
| F | `chip-magnet` ✦ | propio | el filtro elegido salta y se pega a la barra de elegidos (técnica FLIP); al quitarlo vuelve volando a su lugar | 470 → 520 ms |

**Combinaciones recomendadas:**
- Carrito y pedidos (Patrón H): `odometer-roll` en cantidades y totales + `hold-fill` para anular + `ticket-print` al confirmar.
- Inventario (StockZap): `flip-reveal` para ver tallas, `chip-magnet` en filtros, `toast-fan` para alertas de stock y `pull-stretch` en movimientos.
- Ingreso (Patrón F/G): `otp-boxes` para el código.

**Reglas del grupo:** un solo efecto de Mov B por pantalla (si todo estalla, nada destaca); los efectos de arrastre (Mov D) siempre tienen también una alternativa con toque (botón o campo); y todo respeta "reducir movimiento" (§8).

---

## 4. Especificación por componente

Cada componente del `04-UIUX` debe implementar **todos** sus estados animados:

### Botón primario
```
reposo ──pointerdown──▶ press-scale (0.96, sombra e1)
       ──pointerup────▶ release-bounce + tap-dot (punto discreto)
       ──submit───────▶ btn-loading ──ok──▶ btn-success-morph ──1.2s──▶ reposo
                                     └─error─▶ shake-error ──▶ reposo
deshabilitado: opacidad 0.5, sin animación
```

### Barra inferior flotante (estilo base)
- Inactivas: solo ícono (42 × 42 px). Activa: ícono + nombre al costado.
- Al tocar otra pestaña, en paralelo:
  1. el nombre de la pestaña anterior se recoge (ancho → 0, fundido de salida en `fast`);
  2. el nombre de la nueva pestaña se desliza al costado con `label-slide` (aparece 60–80 ms después, `spring-smooth`);
  3. la píldora viaja y cambia de ancho con `indicator-slide` siguiendo a la pestaña;
  4. el ícono hace `icon-bounce`.
- Tocar la pestaña que ya está activa no repite la animación.
- Al hacer scroll hacia abajo: `nav-hide-on-scroll` (traslada +120 % en Y).
- Botón central "+": `fab-rotate` y `fab-speed-dial` o `fab-morph`.

### Tarjeta
- Presionar: `press-scale` · soltar: `release-bounce`.
- Tocar para abrir: `shared-element` hacia el detalle.
- Al cargar la lista: `stagger-in`.

### Bottom sheet
- Abrir: `sheet-up` (spring-smooth), fondo de 0 → 40 % de opacidad.
- Agarradera visible; `drag-dismiss` con umbral 30 % o velocidad > 500 px/s.
- Su contenido entra con `stagger-in` 80 ms después de abrir.

### Input
- Foco: `label-float` + borde de color de marca.
- Error: `shake-error` + mensaje entra deslizándose 4 px desde arriba.
- Válido: ícono ✓ con `check-draw`.

---

## 5. Coreografía de pantallas

Orden de entrada recomendado al llegar a cualquier pantalla:

| Paso | Elemento | Retraso | Animación |
|---|---|---|---|
| 1 | Encabezado / título | 0 ms | fundido + 8 px |
| 2 | Métrica o elemento principal | 60 ms | `count-up` / escala 0.95 → 1 |
| 3 | Lista / tarjetas | 120 ms | `stagger-in` |
| 4 | FAB / acción principal | 240 ms | pop con `spring-bouncy` |
| 5 | Barra inferior | ya visible | (no se anima en cada pantalla) |

Duración total de la coreografía: **≤ 600 ms**. El usuario puede interactuar desde el primer frame.

---

## 6. Implementación

### 6.1 Tokens en CSS

```css
:root {
  --dur-instant: 80ms; --dur-fast: 150ms; --dur-base: 240ms;
  --dur-slow: 360ms;   --dur-slower: 500ms;
  --ease-standard: cubic-bezier(.2,0,0,1);
  --ease-enter: cubic-bezier(0,0,0,1);
  --ease-exit: cubic-bezier(.3,0,1,1);
  --ease-overshoot: cubic-bezier(.34,1.56,.64,1);
}
.btn { transition: transform var(--dur-instant) var(--ease-standard), box-shadow var(--dur-fast); }
.btn:active { transform: scale(.96); }

@keyframes shimmer { to { background-position: -200% 0; } }
.skeleton {
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface) 50%, var(--surface-2) 75%);
  background-size: 200% 100%; animation: shimmer 1.2s linear infinite;
}
```

### 6.2 Tokens en TypeScript (Framer Motion — web)

```ts
// src/motion/tokens.ts
export const spring = {
  snappy: { type: "spring", stiffness: 500, damping: 30 },
  smooth: { type: "spring", stiffness: 300, damping: 30 },
  bouncy: { type: "spring", stiffness: 400, damping: 15 },
  gentle: { type: "spring", stiffness: 120, damping: 20 },
} as const;

export const dur = { instant: .08, fast: .15, base: .24, slow: .36, slower: .5 };

// src/motion/variants.ts
export const staggerList = {
  hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.12 } },
};
export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: spring.smooth },
};
export const pressable = {
  whileTap: { scale: 0.96 },
  whileHover: { y: -2 },
  transition: spring.snappy,
};
```

```tsx
// Uso
<motion.ul variants={staggerList} initial="hidden" animate="show">
  {items.map(i => (
    <motion.li key={i.id} variants={staggerItem} layout {...pressable}>
      <motion.img layoutId={`img-${i.id}`} src={i.foto} />  {/* shared-element */}
    </motion.li>
  ))}
</motion.ul>

// indicator-slide en la barra inferior
{activo && <motion.span layoutId="nav-pill" className="pill" transition={spring.smooth} />}
```

### 6.3 React Native (Reanimated / Moti)

```tsx
import { MotiView } from "moti";
<MotiView
  from={{ opacity: 0, translateY: 8 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 40 }}
/>
```

### 6.4 Lottie
Usar para: `success-check`, estados vacíos, onboarding, `scan-line` de QR. Archivos en `/src/assets/lottie`, máx. 150 KB cada uno.

---

## 7. Rendimiento

- Animar solo `transform` y `opacity` (nunca `width`, `top`, `margin`). Para alturas, usar `layout` de Framer Motion.
- Máximo 8 ítems con `stagger`; el resto aparece sin retraso.
- `will-change: transform` solo durante la animación.
- Probar en un Android de gama media: si baja de 50 fps, reducir a nivel "estándar".

## 8. Accesibilidad y "reducir movimiento"

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```
```ts
const reduce = useReducedMotion(); // Framer Motion
const enter = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };
```
- Se mantienen fundidos y cambios de color; se eliminan desplazamientos, rebotes, parallax y bucles.
- Nada parpadea más de 3 veces por segundo.
- Ninguna información depende solo de una animación.

## 9. Checklist por pantalla (para revisar antes de dar por terminada)

- [ ] Todos los botones tienen `press-scale` + feedback de carga/éxito/error.
- [ ] La entrada a la pantalla sigue la coreografía de §5.
- [ ] Las listas usan `stagger-in`; borrar/insertar anima el reacomodo.
- [ ] Ir a detalle usa `shared-element` o `push-slide`; volver es el inverso.
- [ ] Carga usa `skeleton-shimmer`, nunca pantalla en blanco.
- [ ] Hojas y modales se pueden cerrar con gesto.
- [ ] Números relevantes usan `count-up`.
- [ ] Estados vacío, error y sin conexión tienen animación.
- [ ] Funciona con "reducir movimiento" activado.
- [ ] 60 fps en celular real.

## 10. Personalización de esta app

| Ajuste | Valor en esta app | Motivo |
|---|---|---|
| nivel_de_movimiento | {{estándar / expresivo}} | |
| Animación "firma" de la app | {{Ej.: StockZap → `scan-line` + `count-up` del stock}} | |
| Animaciones desactivadas | {{}} | |
| Animaciones extra | {{}} | |
