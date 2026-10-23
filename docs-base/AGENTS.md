# Instrucciones para la IA — {{NOMBRE_APP}}

Antes de escribir código, lee la carpeta `docs-base/` en este orden:

1. `01-PRD.md` — qué hace la app y qué NO hace.
2. `03-APPFLOW.md` — todas las pantallas, su mockup, navegación y transiciones.
3. `08-PALETAS-DE-COLOR.md` — paleta elegida (claro y oscuro).
4. `09-ICONOS.md` — librería, estilo y set de íconos de la app.
5. `04-UIUX-DESIGN-BRIEF.md` — patrones de pantalla, tokens y componentes.
6. `07-MOTION-DESIGN.md` — animaciones obligatorias.
7. `05-BACKEND-SCHEMA.md` — tablas, relaciones y permisos.
8. `02-TRD.md` — stack y reglas técnicas.
9. `06-IMPLEMENTATION-PLAN.md` — tarea actual.

## Reglas

- Responde y escribe la interfaz en español.
- **Imagen antes que código:** no programes ninguna pantalla que no esté en el inventario de `03-APPFLOW.md` con su mockup aprobado (✅) en `docs-base/pantallas/`. Si falta, detente y ofrece diseñar el mockup primero.
- Si durante el trabajo hace falta una pantalla nueva, agrégala al inventario, diseña su mockup y espera aprobación.
- El resultado debe parecerse al mockup aprobado; si algo no se puede igualar, avísalo.
- Usa solo los roles de la paleta (`var(--hero)`, `var(--tint)`…), nunca hex sueltos, y verifica que funcione en claro y oscuro.
- Usa solo la librería y los íconos del set de `09-ICONOS.md`; si falta uno, propón el equivalente de la misma librería y agrégalo al set.
- Trabaja una tarea del Implementation Plan a la vez y márcala al terminar.
- No agregues dependencias fuera del TRD sin preguntar.
- No uses duraciones ni curvas sueltas: usa los tokens de MOTION.
- Toda interacción debe tener la animación indicada en MOTION; si no está definida, usa la más parecida del catálogo y avísalo.
- Toda tabla nueva se agrega primero en `05-BACKEND-SCHEMA.md` y luego como migración con RLS.
- Si algo contradice el PRD, pregunta antes de implementarlo.
