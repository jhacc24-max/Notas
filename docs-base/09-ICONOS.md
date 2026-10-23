---
documento: Íconos — tipos, librerías y set de la app
version_base: 1.0
app: "{{NOMBRE_APP}}"
libreria_elegida: "{{lucide | tabler | iconoir | phosphor | heroicons | material | remix | bootstrap | emoji}}"
tipo_de_icono: "{{1 Lineal | 2 Sólido | 3 Duotono | 4 Flat | 5 3D | 6 Degradado | 7 Cartón | 8 Isométrico | 9 Material | 10 Gradiente moderno | 11 Morfic | 12 Miniatura 3D}}"
estilo_elegido: "{{ej.: phosphor-fill (dibujo) + phosphor-regular para la barra}}"
ultima_actualizacion: "{{AAAA-MM-DD}}"
---

# 09 · Íconos

> **Para qué sirve:** elegir **un** tipo de ícono para la app y armar su set antes de diseñar, para que todas las pantallas hablen el mismo idioma visual.
> **Referencia:** `referencias/ref-05-estilos-iconos.png` (los tipos 1–11). Tipo 12: `referencias/ref-08-miniatura-3d.mp4`.
> **Vista en vivo:** `iconos/selector-iconos.html` (página "Selector de íconos"). Muestra los 12 tipos de ícono dibujados con 8 librerías libres y una colección propia en 3D, y los mismos 96 conceptos para comparar. Ahí eliges tipo, librería, color, tamaño, acabado y animación, ves los íconos dentro de una app en claro y oscuro, y copias la lista, el código o el CSS.

---

## 1. Cómo se usa

1. En **"1 · Tipo de ícono"** elige uno de los 12 tipos (cada tarjeta muestra la misma casa en ese estilo).
2. En **"Librería del dibujo"** elige de qué librería sale el dibujo. Solo aparecen las compatibles con el tipo: las de línea para Lineal, las de relleno para Sólido y los tipos 4–11, y las de dos tonos para Duotono. La nota indica cuántos de los 96 conceptos tiene cada una.
3. Ajusta tamaño, grosor (solo en Lucide, Tabler e Iconoir), color (una paleta o multicolor por categoría), **acabado** (ninguno, círculo, squircle, sólido o neumorfismo) y **animación al tocar** (17 animaciones o "Automática").
4. Toca los íconos que necesita tu app; quedan en **"Mi set"** y se ven en el celular de vista previa.
5. Copia **"Lista para 09-ICONOS"** y pégala en el §7 de este documento. **"Código React"**, **"CSS del tipo"** e **"Instalación"** dan lo necesario para programar.

## 2. Los 12 tipos de ícono

| N.º | Tipo | Cómo se construye | Úsalo en… | Cuidado con |
|---|---|---|---|---|
| 1 | **Lineal (Outline)** | Solo contornos, de 1.5 a 2 px, color `--tone-800` | Casi todo: es el estándar de interfaz y siempre el de la barra de navegación | En fondos de color o a 16 px se pierde; usa 2 px |
| 2 | **Sólido (Filled)** | Figura rellena de un color | Estados activos, botones, íconos pequeños | Si todo es sólido, la pantalla pesa |
| 3 | **Duotono** | Dibujo más una capa del mismo color al 20 % | Accesos rápidos y estadísticas con personalidad | A menos de 20 px el segundo tono no se ve |
| 4 | **Flat (plano a color)** | Ícono **multicolor**: cada parte con su color (techo, pared, puerta, ventana, piso), colores planos y sin volumen. Fuente: **Fluent Emoji Flat** (Microsoft, MIT) | Productividad, educación, apps multicategoría, categorías y accesos rápidos | Usa sus colores propios, no los de la paleta; combínalo con una interfaz neutra |
| 5 | **Tridimensional (3D)** | Ícono **multicolor con volumen real**, luz y sombra, más una sombra suave en el piso. Fuente: **Fluent Emoji 3D** (Microsoft, MIT), en imagen .webp | Onboarding, logros, accesos destacados, apps de consumo | Es una imagen: no cambia de color y pesa más; máximo 6–8 por pantalla |
| 6 | **Degradado (Gradient)** | El propio dibujo se rellena con un degradado de tres familias de color (por ejemplo, azul → violeta → rosa) | Apps modernas, IA, creatividad, redes | A menos de 24 px el degradado no se aprecia |
| 7 | **Cartón** | Ícono **multicolor** con tono sepia, **textura de cartón** encima, bordes marcados en café, leve inclinación y sombra de papel. Fuente: Fluent Emoji Flat + tratamiento | Calzado y cuero, artesanía, comida casera, eco | En modo oscuro conviene oscurecer el cartón, no invertirlo |
| 8 | **Isométrico 3D** | Ícono **multicolor** girado en perspectiva isométrica con **grosor real** (6–8 capas apiladas en profundidad), **sin base**; al pasar el dedo gira un poco. Fuente: **Fluent Emoji Color** | Logística, inventario, tecnología, onboarding | Solo en tamaños grandes (32 px o más); no en listas ni barras |
| 9 | **Material Design** | Ícono **multicolor** plano (techo rojo, pared gris, puerta naranja…) con elevación suave y **sombra larga** diagonal que se desvanece. Fuente: **Flat Color Icons** (Icons8, MIT); los conceptos que no tiene salen de Fluent Emoji Flat | Apps Android, utilidades, dashboards | La sombra larga necesita espacio libre abajo a la derecha |
| 10 | **Gradiente (estilo moderno)** | Degradado vibrante con brillo suave y un resplandor del mismo color debajo | IA, fintech, marcas jóvenes, íconos de la app | Llama mucho la atención: pocos por pantalla |
| 11 | **Morfic (Morphic)** | Forma translúcida tipo "vidrio" con brillo interno, reflejo suave y resplandor de color | IA, bienestar, clima, apps premium | Contraste bajo: no para acciones críticas ni textos pequeños |
| 12 | **Miniatura 3D** | **Objeto de juguete modelado en 3D** y renderizado: acabado **mate** (sin brillos de plástico), luz de estudio suave desde arriba a la izquierda, vista en 3/4 desde arriba (unos 30°), **sombra de contacto difusa** en el piso, **sin contenedor ni contorno** y colores **sobrios y realistas** (blanco, beige, gris, negro) con un solo acento por objeto. Fuente: **colección propia del kit** (`iconos/miniatura-3d/`, 100 imágenes .webp de 512 px) | Movilidad y delivery (elegir vehículo), accesos rápidos tipo "Casa · Trabajo", selectores de opción, onboarding, apps de servicios | Es una imagen: no cambia de color. Mínimo 40 px; siempre sobre fondo claro o blanco, nunca en barras ni listas densas |

Los tipos **4, 5, 7, 8, 9 y 12 son multicolor**: cada parte del dibujo tiene su propio color, igual que en la imagen de referencia. Los tipos 1–3, 6, 10 y 11 usan un solo color (o un degradado) tomado de la paleta. Si a una fuente multicolor le falta un concepto (por ejemplo, el código QR), el selector usa el dibujo de la librería elegida.

También existen **Emoji** (cambia según el celular y no se puede colorear) y los **íconos animados (Lottie)**, útiles solo para éxito, carga larga u onboarding.

## 2c. Tipo 12 · Miniatura 3D en detalle

Referencia: `referencias/ref-08-miniatura-3d.mp4` (los vehículos Ride, Bajaji y Boda; los accesos Home, Work y Gym; los avatares de "My drivers").

**Receta del estilo (para mantener la coherencia al crear nuevos):**

| Rasgo | Valor |
|---|---|
| Forma | Objeto real simplificado como juguete o maqueta: volúmenes redondeados, pocos detalles, proporciones algo achatadas |
| Vista | 3/4 desde adelante a la izquierda, unos 30° desde arriba; los objetos planos (tarjetas, documentos, botones) se paran mirando casi de frente |
| Material | Mate (rugosidad 0.5–0.7), sin reflejos de plástico; vidrios oscuros y metales con brillo suave |
| Luz | Una luz principal suave desde arriba a la izquierda, relleno cálido tenue desde la derecha y luz ambiente de estudio |
| Sombra | Sombra de contacto difusa debajo del objeto, ya incluida en la imagen |
| Color | Base sobria (blanco roto, beige, gris, negro) + **un acento** (rojo, verde, azul, amarillo) solo donde da significado |
| Fondo | Transparente; se usa sobre blanco o superficies claras |
| Tamaño | 40–64 px en la interfaz (44 px base); la imagen mide 512 × 512 px |

**Archivos:** `iconos/miniatura-3d/<id>.webp`, con el mismo id que el concepto del selector (`home.webp`, `cart.webp`…). Extras del video: `car.webp` (auto), `mototaxi.webp`, `moto.webp` y `briefcase.webp` (maletín).

**Crear un ícono nuevo** (por ejemplo, una zapatilla para StockZap): en `iconos/miniatura-3d/generador/` está el modelado de los 100 íconos (`modelos.js`, con three.js) y la página que los renderiza (`render.html`). Se le pide a Claude: *"Agrega al generador de Miniatura 3D un modelo de {{objeto}} siguiendo la receta del §2c de 09-ICONOS y renderízalo"*. El modelo usa los mismos materiales, cámara y luz, así que queda igual al resto.

**Uso en la interfaz:** como en el video, brillan en **selectores de opción** (tarjetas con el objeto grande, nombre y dato debajo, y una barra que marca la opción activa) y en **chips de acceso rápido** (objeto pequeño + texto). Animaciones sugeridas al tocar: `icon-lift` (Elevar) o `icon-jelly` (Gelatina).

## 2b. Acabados (contenedor)

El acabado envuelve a cualquiera de los 12 tipos (Miniatura 3D se ve mejor sin acabado). En el selector está en "Acabado (contenedor)".

| Acabado | Cómo se ve | Úsalo en… |
|---|---|---|
| **Ninguno** | El ícono solo | Listas, barras, botones, texto |
| **Círculo / Squircle** | Fondo suave `--tone-100` | Accesos rápidos, tarjetas, categorías |
| **Sólido** | Fondo `--tone-800` con ícono blanco | La acción principal |
| **Neumorfismo** | Relieve del mismo color que el fondo; se hunde al seleccionar | Controles grandes (música, domótica). El fondo de la pantalla debe ser `--neu` |

**Reglas de tipos y acabados:**
1. **Un tipo de ícono por app** para el contenido. La barra de navegación, los botones pequeños y los campos de formulario usan **siempre Lineal** (el activo puede ir en Sólido).
2. Los tipos 4–12 se usan en íconos de **contenido**: accesos rápidos, categorías, tarjetas, onboarding, estados vacíos y logros.
3. Área táctil mínima de **44 px**, sea cual sea el tipo o el acabado.
4. El ícono debe tener **contraste AA** con su fondo. Morfic y Neumorfismo son excepciones conocidas: compénsalas con color o tamaño.
5. El código de cada tipo y acabado, con los colores elegidos, sale del botón **"CSS del tipo"**. Los tipos 4–11 usan el SVG de la librería como **máscara**; en React Native se hacen con `react-native-svg` (`<Mask>` y `<LinearGradient>`).

## 3. Librerías disponibles (todas libres para uso comercial)

| Librería | Estilos en el selector | Íconos totales | Licencia | Grosor ajustable | Web (React) | Móvil (React Native) | Observaciones |
|---|---|---|---|---|---|---|---|
| **Lucide** | Línea | 1 600+ | ISC | Sí | `lucide-react` | `lucide-react-native` | Muy completa y consistente. No tiene versión rellena: el activo se marca con la píldora de fondo. No trae logos de marcas. |
| **Tabler** | Línea, Relleno | 5 900+ | MIT | Sí | `@tabler/icons-react` | `@tabler/icons-react-native` | La más grande. Su set relleno está incompleto (72 de 96 conceptos). Trae logos de marcas, incluido WhatsApp. |
| **Iconoir** | Línea | 1 600+ | MIT | Sí | `iconoir-react` | `iconoir-react-native` | Trazo fino y elegante; ideal para moda y marcas. |
| **Phosphor** | Fina, Ligera, Regular, Gruesa, Relleno, Duotono | 1 500+ por peso | MIT | Por peso (6) | `@phosphor-icons/react` | `phosphor-react-native` | La más flexible: el mismo ícono en 6 pesos. Incluye comida, salud y marcas. **Recomendada como base.** |
| **Heroicons** | Línea, Relleno, Mini | 320+ | MIT | No | `@heroicons/react` | `react-native-heroicons` | Pocos íconos y de gran calidad. **No tiene** comida, ejercicio, pulso ni agua (91 de 96 conceptos). |
| **Material** | Contorno, Redondeado, Anguloso, Relleno, Bicolor | 2 100+ por estilo | Apache 2.0 | No | `@mui/icons-material` | `@expo/vector-icons` | La opción de Google; se ve "Android". Tiene 5 estilos del mismo ícono. |
| **Remix** | Línea, Relleno | 3 000+ | Apache 2.0 | No | `@remixicon/react` | SVG + `react-native-svg` | Pares de línea y relleno muy completos, más logos de marcas. |
| **Bootstrap** | Línea, Relleno | 2 000+ | MIT | No | `react-bootstrap-icons` | SVG + `react-native-svg` | Estilo clásico de web, con marcas. |
| **Fluent Emoji** (Flat, Color, 3D) | Tipos 4, 5, 7 y 8 (multicolor) | 3 100+ | MIT (Microsoft) | No | `@iconify/react` + `@iconify-json/fluent-emoji-flat` / `fluent-emoji`; 3D: `@lobehub/fluent-emoji-3d` | SVG con `react-native-svg`; 3D como imagen | Cada parte con su color. 89 de 96 conceptos (no tiene menú, cuadrícula, "más", QR, código de barras, gráfico circular ni tabla). |
| **Flat Color Icons** | Tipo 9 (multicolor) | 330+ | MIT (Icons8) | No | `@iconify/react` + `@iconify-json/flat-color-icons` | SVG con `react-native-svg` | Estilo material de colores planos. 68 de 96 conceptos. |
| **Miniatura 3D** (colección propia) | Tipo 12 | 100 (96 conceptos + auto, mototaxi, moto y maletín) | Del kit | No | `<img src="/iconos/home.webp">` | `<Image source={require(...)} />` | Modelos 3D propios; si falta uno, se crea con el generador (§2c). |
| **Emoji** | Nativo | 3 700+ | Unicode | — | — | — | Se ve distinto en cada sistema operativo. |

## 4. Recomendación por tipo de app

| Tipo de app | Estilo sugerido | Por qué |
|---|---|---|
| Inventario y tiendas (StockZap) | Phosphor Regular + Relleno para activos, o Duotono en accesos rápidos | Tiene caja, QR, código de barras, almacén y camión, con pares de línea y relleno |
| Nutrición y salud (NutriApp) | Phosphor Regular o Material Redondeado | Tiene comida, fruta, agua, pulso y medicina, con trazo amable |
| Finanzas | Lucide o Tabler, línea a 1.5 px | Sobrio y preciso; el grosor ajustable da elegancia |
| Fitness | Phosphor Gruesa + Relleno | Enérgico y legible en movimiento |
| Logística | Tabler Línea | Más variedad de transporte, rutas y mapas |
| Moda y marcas | Iconoir Línea a 1.5 px | Fino y editorial |
| IA y productividad | Lucide Línea | Neutro, moderno y muy completo |
| Apps con WhatsApp | Phosphor, Tabler o Remix | Traen el logo oficial de WhatsApp (Lucide, Heroicons y Material no) |

## 5. Reglas (todas las apps)

1. **Una sola librería y un solo estilo base por app.** Mezclar librerías se nota: cambian el grosor, las puntas y las proporciones.
2. **Activo = relleno del mismo ícono.** En la barra de navegación y en los favoritos, el estado inactivo usa línea y el activo usa relleno de la misma librería. Pares completos: Phosphor (regular/fill), Heroicons (outline/solid), Material (outlined/filled), Remix (line/fill) y Bootstrap (line/fill). Con Lucide e Iconoir, el activo se marca con la píldora de fondo (`label-slide`).
3. **Tamaños fijos:** 16 px junto a texto, 20 px en listas y chips, **24 px estándar** (barra, botones), 28–32 px en accesos rápidos. Más grande que eso ya es una ilustración, no un ícono.
4. **Grosor según el texto:** a 24 px, entre 1.5 y 2 px. Debe parecerse al peso de la tipografía (texto de 400–500 → 1.5; de 600–700 → 2).
5. **Área táctil mínima de 44 × 44 px**, aunque el ícono mida 20.
6. **Un ícono solo, sin texto, necesita `aria-label`.** En la barra de navegación, la pestaña activa siempre muestra su nombre.
7. **El color sale de roles:** `--text-2` para inactivo, `--nav-active` para activo, `--accent` para acciones, o el color de categoría (`08-PALETAS` §5) para tipos de actividad. Nunca un hex suelto.
8. **Contenedores:** sin contenedor en barras y listas densas; **círculo o squircle** con fondo `--tint` en accesos rápidos y tarjetas; **sólido** solo para la acción principal.
9. **Logos de marcas** (WhatsApp, Google): usar el ícono oficial de la librería, sin cambiar su forma, y respetar las normas de la marca.
10. **En el código**, importar cada ícono por nombre (`import { House } from …`) para que solo se incluyan los que se usan; si no hay componente, usar el sprite SVG que exporta el selector.

## 6. Animaciones al tocar un ícono

Se prueban en el selector ("Animación al tocar") y están definidas en `07-MOTION-DESIGN.md`. **"Automática"** (opción base) asigna a cada ícono la animación que mejor comunica su acción.

| Grupo | Animación | Qué hace | Para qué íconos |
|---|---|---|---|
| Respuesta | `icon-press` · Hundir | Se encoge a 0.78 y rebota a 1.08 | Botones, agregar, cerrar, confirmar (la base de todo toque) |
| Respuesta | `icon-pop` · Pop | Crece ×1.3 y vuelve con resorte | Guardar, favorito, éxito |
| Respuesta | `icon-jelly` · Gelatina | Se aplasta y estira como gelatina | Carrito, caja, billetera: objetos que "reciben" algo |
| Movimiento | `icon-bounce` · Rebote | Salta y rebota dos veces | Inicio, descargar, ubicación |
| Movimiento | `icon-lift` · Elevar | Sube 9 px con sombra y se asienta | Buscar, subir, tarjetas destacadas |
| Movimiento | `icon-flip` · Giro 3D | Gira una vuelta completa en 3D | Desbloquear, monedas, voltear algo |
| Movimiento | `icon-swing` · Balanceo | Se balancea colgado desde arriba | Campana, llamada |
| Movimiento | `icon-wiggle` · Sacudir | Se sacude de lado a lado | Eliminar, error, advertencia, bloqueado |
| Movimiento | `icon-tada` · ¡Tada! | Se encoge, crece y tiembla celebrando | Regalo, anuncio, logro |
| Movimiento | `icon-fly` · Despegar | Sale volando en diagonal y vuelve a su lugar | Enviar, compartir, envío |
| Específica | `icon-spin` · Girar | Una vuelta completa | Actualizar, ajustes |
| Específica | `icon-beat` · Latido | Late dos veces | Me gusta, pulso, música |
| Específica | `icon-draw` · Dibujar | El trazo se dibuja de principio a fin (solo tipo Lineal) | Éxito, onboarding |
| Efecto | `icon-ring` · Ondas | Dos anillos de color se expanden desde el ícono | Confirmar, micrófono, reproducir |
| Efecto | `icon-echo` · Eco | Una copia del ícono crece y se desvanece | Cámara, capturar |
| Efecto | `icon-burst` · Estallido | 10 partículas salen disparadas alrededor (multicolor en los tipos de color) | Me gusta, favorito, logros |
| Efecto | `icon-shine` · Brillo | Un destello de luz cruza el ícono, recortado a su forma | Rápido, IA, ideas, premium |

**Asignación automática:** me gusta → latido + estallido · favorito → pop + estallido · campana y llamar → balanceo · actualizar y ajustes → girar · eliminar, error y bloqueado → sacudir · desbloquear y monedas → giro 3D · enviar, compartir y envío → despegar · confirmar → hundir + ondas · éxito → pop + ondas · carrito, caja y billetera → gelatina · regalo y anuncio → ¡tada! · buscar y subir → elevar · rápido, IA e idea → brillo · cámara → eco · el resto → hundir.

**Reglas:** una sola animación por toque (salvo las combinaciones de la tabla), duración máxima de 1 s, nunca en bucle, y todas se desactivan con "reducir movimiento".

## 7. Set de esta app

Pega aquí la tabla que exporta el selector ("Lista para 09-ICONOS"):

- Librería: **{{}}** · estilo **{{}}**
- Tipo de ícono: **{{1–11}}** · acabado: {{}} · color: {{una paleta / multicolor}}
- Tamaño base: {{24}} px · grosor {{}} · contenedor: {{}} · animación al tocar: {{}}
- Color: paleta `{{}}`

| Concepto | Id | Nombre en la librería | Categoría |
|---|---|---|---|
| {{Inicio}} | `home` | `{{house}}` | Navegación |

## 8. Cambios respecto a la base
{{}}
