---
documento: TRD — Technical Requirements Document
version_base: 1.0
app: "{{NOMBRE_APP}}"
ultima_actualizacion: "{{AAAA-MM-DD}}"
---

# 02 · TRD — Con qué y cómo se construye

> **Para qué sirve:** fija el stack y las reglas técnicas para que la IA no improvise librerías distintas en cada sesión.
> **Regla de oro para la IA:** *no agregues dependencias que no estén en este documento sin preguntar.*

---

## 1. Stack

Marca la opción elegida. La columna "Base" es el valor por defecto recomendado para todas tus apps; cámbialo solo si la app lo necesita.

| Capa | Base (por defecto) | Alternativas | Elegido en esta app |
|---|---|---|---|
| Lenguaje | TypeScript | JavaScript | {{}} |
| Frontend web | React + Vite (o Next.js si necesita SEO) | Vue, Angular | {{}} |
| Móvil | PWA instalable | React Native + Expo · Swift · Kotlin | {{}} |
| Estilos | Tailwind CSS + variables CSS (tokens) | CSS Modules | {{}} |
| Animación | Framer Motion (web) · Reanimated/Moti (RN) · Lottie | GSAP | {{}} |
| Backend / BD | Supabase (Postgres + Auth + Storage + Edge Functions) | Firebase | {{}} |
| Mensajería | WhatsApp Cloud API | Telegram Bot API · Twilio | {{}} |
| Hosting | Vercel / Netlify (capa gratuita) | Cloudflare Pages | {{}} |
| Control de versiones | GitHub | | {{}} |

## 2. Estructura de carpetas (base)

```
/docs-base       ← el kit de documentos base
/src
  /app | /pages  ← pantallas (una por ruta del 03-APPFLOW)
  /components    ← UI reutilizable (botones, tarjetas, sheets…)
  /motion        ← tokens y variantes de animación (07-MOTION)
  /lib           ← cliente Supabase, utilidades
  /hooks
  /styles        ← tokens.css
/supabase
  /migrations    ← SQL del 05-BACKEND-SCHEMA
  /functions     ← Edge Functions (webhooks WhatsApp, etc.)
```

## 3. Convenciones de código

- Componentes en `PascalCase`, hooks `useAlgo`, archivos de utilidades en `kebab-case`.
- Nada de colores, duraciones o curvas "a mano": siempre desde tokens (`04-UIUX` y `07-MOTION`).
- Textos de interfaz en español, centralizados si la app crecerá a otros idiomas.
- Cada función que toca la BD maneja errores y muestra un estado al usuario.

## 4. Integraciones

| Servicio | Para qué | Credenciales (nombre de variable) | Límite gratuito a vigilar |
|---|---|---|---|
| WhatsApp Cloud API | Notificaciones / bot | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | {{}} |
| Supabase | BD, auth, archivos | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | {{}} |
| {{}} | | | |

## 5. Seguridad (base)

- Row Level Security (RLS) activado en **todas** las tablas.
- Claves secretas solo en el servidor / Edge Functions, nunca en el frontend.
- Variables en `.env` (no se sube a GitHub); `.env.example` sí se sube.
- Validar datos en el cliente **y** en la BD (constraints).

## 6. Entornos y despliegue

| Entorno | URL | Rama | BD |
|---|---|---|---|
| Desarrollo | localhost | `dev` | proyecto Supabase de prueba / branch |
| Producción | {{}} | `main` | proyecto Supabase principal |

## 7. Calidad

- Revisar en un celular real antes de dar por terminada una pantalla.
- Pruebas mínimas: flujo de login, flujo principal del PRD, sin conexión.
- Lighthouse ≥ 85 en rendimiento y accesibilidad.

## 8. Decisiones propias de esta app

| Decisión | Por qué se aparta de la base |
|---|---|
| {{}} | {{}} |
