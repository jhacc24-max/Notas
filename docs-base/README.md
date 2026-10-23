# Documentos base para crear apps

Kit de 9 documentos reutilizables para todas tus apps (StockZap, NutriApp, apps con WhatsApp y las que vengan). Los 6 primeros siguen el método del video; el 7.º es el de movimiento, el 8.º el de paletas de color y el 9.º el de íconos.

| # | Archivo | Responde a | ¿Cuánto cambia por app? |
|---|---|---|---|
| 01 | `01-PRD.md` | ¿Qué construimos y por qué? | Mucho (es la identidad de cada app) |
| 02 | `02-TRD.md` | ¿Con qué tecnología? | Poco (el stack base se repite) |
| 03 | `03-APPFLOW.md` | ¿Qué pantallas hay, cómo se ven (mockups) y cómo se navega? | Mucho |
| 04 | `04-UIUX-DESIGN-BRIEF.md` | ¿Cómo se ve? Patrones A–H | Poco (tipografía, variante de barra y de ingreso) |
| 05 | `05-BACKEND-SCHEMA.md` | ¿Cómo se guardan los datos? | Medio (tablas base + propias) |
| 06 | `06-IMPLEMENTATION-PLAN.md` | ¿En qué orden se construye? | Medio (Fases D y 0 siempre iguales) |
| 07 | `07-MOTION-DESIGN.md` | ¿Cómo se mueve? | Poco (nivel + animación firma) |
| 08 | `08-PALETAS-DE-COLOR.md` | ¿Qué colores, en claro y oscuro? | Solo eliges una paleta |
| 09 | `09-ICONOS.md` | ¿Qué tipo de íconos y cuáles? | Eliges librería, estilo y set |

**Archivos de apoyo**
- `catalogo-motion.html`: animaciones y patrones de pantalla en vivo.
- `iconos/selector-iconos.html`: los 12 tipos de ícono con 8 librerías reales y la colección propia Miniatura 3D, para elegir y armar el set de la app.
- `flujos/efectos-flujo.html`: 4 modelos de flujo (G1–G4) con sus efectos: onboarding, registro por pasos y elección de opciones.
- `iconos/miniatura-3d/`: 100 íconos Miniatura 3D (.webp de 512 px) y su generador para crear más.
- `pedidos/app-pedidos.html`: app de pedidos con delivery (Patrón H): inicio, escaneo de carta, plato, carrito, pago, pedido realizado y seguimiento; cada efecto se puede ver por separado.
- `ingreso/pantallas-ingreso.html`: las 7 pantallas de ingreso (F1–F7) con sus efectos.
- `paletas/paletas.html`: eliges color y ves las pantallas en claro y oscuro. `paletas/paletas.css` y `paletas/paletas.json` contienen el código.
- `referencias/`: imágenes de referencia de diseño.
- `AGENTS.md`: instrucciones para la IA.

## Reglas generales (todas las apps)

1. **Imagen antes que código.** Todas las pantallas figuran en el App Flow y cada una tiene su mockup aprobado, en claro y oscuro, antes de programarla.
2. **Un color, una plantilla.** Se elige una paleta del documento 08 y en el código solo se usan sus roles.
3. **Todo se mueve.** Cada interacción tiene su animación del documento 07.

## Cómo funciona "base + cambios por app"

1. **Esta carpeta es la base.** No se edita por app; solo se mejora cuando algo vale para todas. Sube `version_base` al cambiarla.
2. **Para cada app**, copia la carpeta como `docs-base/` en la raíz del proyecto y crea `docs-base/pantallas/` para los mockups.
3. **Rellena** todo lo que está entre `{{ }}`.
4. **Registra las diferencias** en la sección final de cada documento ("Cambios respecto a la base" / "Personalización de esta app").
5. **Copia `AGENTS.md`** a la raíz del proyecto (renómbralo `CLAUDE.md` si usas Claude Code).

## Orden de trabajo

PRD → App Flow (inventario completo) → Paleta → Íconos → **Mockups de todas las pantallas y aprobación** → UI/UX → Motion → Backend Schema → TRD → Implementation Plan → código

## Cómo usarlos con la IA

> Para diseñar: "Lee `docs-base/`. Diseña los mockups de todas las pantallas del inventario de `03-APPFLOW.md` con la paleta {{id}}, en claro y oscuro."
>
> Para programar: "Lee `docs-base/`. Implementa la tarea T-XX del Implementation Plan respetando el mockup aprobado, la paleta, el UI/UX y MOTION."

Los nombres de animación (`press-scale`, `shared-element`, `sheet-up`…) y de rol de color (`--hero`, `--tint`…) son un vocabulario común entre todos los documentos.
