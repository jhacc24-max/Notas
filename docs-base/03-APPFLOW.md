---
documento: App Flow — Flujo de la aplicación
version_base: 1.0
app: "{{NOMBRE_APP}}"
ultima_actualizacion: "{{AAAA-MM-DD}}"
---

# 03 · App Flow — El recorrido del usuario

> **Para qué sirve:** es el plano de la app. Dice qué pantallas existen, cómo se llega a cada una y qué pasa al tocar cada botón.
> **Conexión con Motion:** cada flecha de este documento es una transición; su tipo se define en la columna "Transición" usando los nombres de `07-MOTION.md`.

> ### ⚠️ Regla general (todas las apps, actuales y futuras)
> 1. **Aquí figuran TODAS las pantallas** que tendrá la app, incluidas las de estado (vacío, error, sin conexión) y las hojas o modales importantes. Si una pantalla no está en el inventario (§2), no se construye.
> 2. **Ninguna pantalla se programa sin tener antes su imagen (mockup) aprobada.** Primero se diseña, se revisa en imagen y se aprueba; recién después se escribe código.
> 3. Cada mockup se hace con la paleta elegida en `08-PALETAS-DE-COLOR.md`, en **modo claro y oscuro**, y con el patrón (A, B o C) indicado en el inventario.
> 4. Si al programar aparece una pantalla nueva, se agrega primero al inventario y a la galería (§3) con su mockup, y luego se construye.

---

## 1. Mapa general

```mermaid
flowchart LR
  A[Splash] --> B{¿Sesión iniciada?}
  B -- No --> C[Bienvenida] --> D[Registro / Login] --> E[Verificación]
  B -- Sí --> F[Inicio]
  E --> F
  F --> G[{{Pantalla principal 1}}]
  F --> H[{{Pantalla principal 2}}]
  F --> I[Perfil / Ajustes]
```

## 2. Inventario de pantallas

Patrón de pantalla (ver `04-UIUX` §5): **A** tarjetas cerradas tonales · **B** capas superpuestas · **C** hero de imagen + hoja · **D** imagen fundida · **E** tareas y agenda por color · **F1–F7** pantalla de ingreso (elegir una variante) · **G1–G4** flujo guiado (onboarding, registro por pasos o elegir un elemento) · **H1–H8** pedidos, pago y entrega (inicio de tienda, escáner, análisis, detalle, carrito, pago, pedido realizado, seguimiento).

Estado del mockup: ⬜ sin diseñar · 🎨 diseñado, en revisión · ✅ aprobado (ya se puede programar) · 🔁 cambió, volver a revisar

| ID | Pantalla | Ruta | Objetivo | Patrón | Requisitos (PRD) | Acceso | Mockup | Estado |
|---|---|---|---|---|---|---|---|---|
| P-01 | Splash | `/` | Cargar sesión | — | — | Público | `pantallas/P-01-splash.png` | ⬜ |
| P-02 | Bienvenida | `/bienvenida` | Explicar valor en 3 pasos | D | — | Público | `pantallas/P-02-bienvenida.png` | ⬜ |
| P-03 | Ingreso / Registro | `/auth` | Entrar | {{F1–F7}} | RF-xx | Público | `pantallas/P-03-auth.png` | ⬜ |
| P-04 | Inicio | `/inicio` | {{}} | A | {{}} | Privado | `pantallas/P-04-inicio.png` | ⬜ |
| P-05 | {{Listado / catálogo}} | | | B | | | `pantallas/P-05-….png` | ⬜ |
| P-06 | {{Detalle}} | | | C | | | `pantallas/P-06-….png` | ⬜ |
| P-07 | Perfil / Ajustes | `/perfil` | Datos y preferencias | A | | Privado | `pantallas/P-07-perfil.png` | ⬜ |
| E-01 | Estado vacío | — | Invitar a la primera acción | — | | — | `pantallas/E-01-vacio.png` | ⬜ |
| E-02 | Estado de error | — | Explicar y reintentar | — | | — | `pantallas/E-02-error.png` | ⬜ |
| E-03 | Sin conexión | — | Avisar y reintentar | — | | — | `pantallas/E-03-offline.png` | ⬜ |
| H-01 | {{Hoja "Nuevo"}} | — | Acciones rápidas | — | | | `pantallas/H-01-nuevo.png` | ⬜ |

**Base común:** todas las apps tienen Splash, Auth, Inicio, Perfil/Ajustes, estado vacío, estado de error y estado sin conexión. Prefijos: **P** pantalla · **E** estado · **H** hoja o modal.

## 2b. Tabla de tipos y colores (si la app tiene tareas, agenda, pedidos o estados)

Cada tipo usa un color de `08-PALETAS` §5, siempre el mismo en lista, calendario, filtros y estadísticas. Máximo 8 tipos.

| Tipo | Color (`--cat-…`) | Ícono | Ejemplo |
|---|---|---|---|
| {{Ej.: Venta}} | `verde` | {{carrito}} | {{Venta de 3 pares}} |
| {{Ej.: Reposición}} | `cafe` | {{caja}} | {{Pedir Runner Pro T-41}} |
| {{Ej.: Cliente}} | `ambar` | {{personas}} | {{Llamar a tienda Trujillo}} |
| {{Ej.: Envío}} | `cian` | {{camión}} | {{Despacho a Lima}} |
| {{Ej.: Urgente}} | `rojo` | {{alerta}} | {{Stock agotado}} |

## 3. Galería de pantallas (mockups)

Todas las imágenes viven en `docs-base/pantallas/`, dentro de cada proyecto.

**Cómo se nombran:** `{{ID}}-{{nombre}}.png` para modo claro y `{{ID}}-{{nombre}}-oscuro.png` para modo oscuro. Ejemplo: `P-04-inicio.png` y `P-04-inicio-oscuro.png`.

**Qué debe mostrar cada mockup:**
- Tamaño de celular (390 × 844 px) con datos realistas de la app, nunca "lorem ipsum".
- La paleta elegida (`08-PALETAS`) y el patrón asignado (`04-UIUX` §5).
- La barra de navegación con la pestaña activa correcta.
- Si la pantalla tiene un movimiento importante, una nota con su nombre (por ejemplo, "al tocar la tarjeta → `shared-element`").

**Cómo se hacen:** se le pide a Claude: *"Diseña los mockups de todas las pantallas del inventario de `03-APPFLOW.md` con la paleta {{id}}, en claro y oscuro"*. Se revisan, se piden cambios, y al aprobarlos se marca ✅ en el inventario.

**Vista rápida** (reemplazar por las imágenes reales):

| P-04 Inicio | P-05 {{Listado}} | P-06 {{Detalle}} |
|---|---|---|
| ![P-04](pantallas/P-04-inicio.png) | ![P-05](pantallas/P-05-listado.png) | ![P-06](pantallas/P-06-detalle.png) |

## 4. Navegación principal

- **Patrón base:** una sola barra flotante centrada con 3–4 destinos y el botón "+" dentro, como último elemento (regla en `04-UIUX` §5, "Reglas comunes"). Nombres de una palabra, máximo 7 letras.
- Destinos de la barra: {{Inicio · … · Perfil}}
- Navegación secundaria: pantallas de detalle apiladas (push) y hojas inferiores (bottom sheets) para acciones rápidas.

## 5. Interacciones por pantalla

Repetir este bloque por cada pantalla.

### P-04 · Inicio

| Elemento | Acción del usuario | Resultado | Transición (07-MOTION) |
|---|---|---|---|
| Tarjeta de producto | Toca | Abre detalle P-05 | `shared-element` |
| Botón "+" | Toca | Abre hoja "Nuevo" | `sheet-up` |
| Lista | Desliza abajo | Recarga datos | `pull-refresh` |
| Elemento de lista | Desliza a la izquierda | Muestra "Eliminar" | `swipe-reveal` |
| Pestaña de la barra | Toca | Cambia de sección; solo la activa muestra su nombre | `tab-crossfade` + `indicator-slide` + `label-slide` |
| Casilla de tarea | Toca | Marca como hecha y la manda al final | `task-check` + `task-complete-sink` |
| FAB "+" (lista o agenda) | Toca | Abre "Nueva actividad" a pantalla completa | `fab-fill-reveal` |

**Estados:** cargando (`skeleton-shimmer`) · vacío (ilustración + CTA) · error (mensaje + reintentar) · sin conexión (banner).

## 6. Flujos críticos (paso a paso)

### Flujo 1: {{Ej.: Registrar un producto}}
1. Usuario toca "+" en Inicio.
2. Se abre hoja con "Escanear QR" / "Manual".
3. …
4. Confirmación con animación `success-check` y toast.

## 7. Notificaciones y entradas externas

| Evento | Canal | Abre la pantalla |
|---|---|---|
| {{Stock bajo}} | WhatsApp | {{P-05 con enlace profundo}} |

## 8. Cambios respecto a la base
{{}}
