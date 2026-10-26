---
documento: Implementation Plan — Plan de implementación
version_base: 1.0
app: "{{NOMBRE_APP}}"
ultima_actualizacion: "{{AAAA-MM-DD}}"
---

# 06 · Implementation Plan — Paso a paso

> **Para qué sirve:** convierte los otros documentos en tareas pequeñas que la IA puede ejecutar una a una sin perderse.
> **Regla para la IA:** trabaja **una tarea a la vez**, márcala como hecha, y no empieces la siguiente sin que la anterior funcione.

---

## Cómo usar este plan con la IA

Prompt sugerido por tarea:

> "Lee `docs-base/` completo. Implementa la tarea **T-XX** del `06-IMPLEMENTATION-PLAN.md`. Respeta el stack del TRD, los tokens del UI/UX Brief y las animaciones de MOTION. Al terminar, dime cómo probarlo."

Estado: ⬜ pendiente · 🟨 en curso · ✅ hecho · ⛔ bloqueado

---

## Fase D — Diseño en imagen (obligatoria, antes de escribir código)

| ID | Tarea | Referencia | Estado |
|---|---|---|---|
| D-01 | Elegir paleta en la página "Paletas de color" y anotarla | 08-PALETAS §1 | ⬜ |
| D-01b | Elegir librería y estilo de íconos y armar el set en el "Selector de íconos" | 09-ICONOS §1 | ⬜ |
| D-02 | Completar el inventario con **todas** las pantallas, estados y hojas | APPFLOW §2 | ⬜ |
| D-03 | Generar los mockups de todas las pantallas, en claro y oscuro | APPFLOW §3 | ⬜ |
| D-04 | Revisar y aprobar los mockups (todas las pantallas en ✅) | APPFLOW §2 | ⬜ |

> Ninguna tarea de las fases siguientes que construya una pantalla puede empezar si esa pantalla no tiene su mockup en ✅.

## Fase 0 — Cimientos (igual en todas las apps)

| ID | Tarea | Referencia | Estado |
|---|---|---|---|
| T-01 | Crear repo, proyecto Vite/Next + TypeScript + Tailwind | TRD §1 | ⬜ |
| T-02 | Crear `tokens.css` con la paleta elegida (`paletas.css`), tipografía y espacios | 08-PALETAS · UIUX §2–4 | ⬜ |
| T-03 | Crear `/src/motion` con tokens y variantes base | MOTION §2–3 | ⬜ |
| T-04 | Conectar Supabase y variables de entorno | TRD §4–6 | ⬜ |
| T-05 | Crear tablas base + RLS | SCHEMA §2, §6 | ⬜ |
| T-06 | Componentes base: Botón, Tarjeta, Input, Toast, Sheet, Skeleton (con su motion) | UIUX §6 · MOTION §4 | ⬜ |
| T-07 | Layout con barra inferior flotante + transiciones entre pestañas | APPFLOW §4 · MOTION §5 | ⬜ |
| T-08 | Auth completa (registro, login, verificación, cierre de sesión) | SCHEMA §5 · APPFLOW P-03 | ⬜ |
| T-09 | Plantillas de pantalla A, B, C, D y E con su movimiento | UIUX §5 · MOTION §3.3 | ⬜ |

## Fase 1 — MVP (propio de cada app)

| ID | Tarea | Requisito PRD | Pantalla (mockup ✅) | Estado |
|---|---|---|---|---|
| T-10 | {{}} | RF-01 | P-04 | ⬜ |
| T-11 | {{}} | RF-02 | | ⬜ |

## Fase 2 — Integraciones

| ID | Tarea | Referencia | Estado |
|---|---|---|---|
| T-20 | Webhook y envío por WhatsApp | TRD §4 · SCHEMA §8 | ⬜ |
| T-21 | Enlaces profundos desde notificaciones | APPFLOW §7 | ⬜ |

## Fase 3 — Pulido

| ID | Tarea | Referencia | Estado |
|---|---|---|---|
| T-30 | Estados vacío / error / sin conexión en todas las pantallas | APPFLOW §2 | ⬜ |
| T-31 | Pasada de motion: revisar que cada interacción tenga feedback | MOTION §9 (checklist) | ⬜ |
| T-32 | Accesibilidad y "reducir movimiento" | UIUX §8 · MOTION §8 | ⬜ |
| T-33 | Prueba en celular real gama media + Lighthouse | TRD §7 | ⬜ |

## Fase 4 — Lanzamiento

| ID | Tarea | Estado |
|---|---|---|
| T-40 | Desplegar en producción | ⬜ |
| T-41 | Probar con 3–5 usuarios reales y anotar fricciones | ⬜ |

---

## Registro de avance

| Fecha | Tarea | Nota |
|---|---|---|
| {{}} | | |
