---
documento: PRD — Product Requirements Document
version_base: 1.0
app: "{{NOMBRE_APP}}"
estado: borrador | en revisión | aprobado
ultima_actualizacion: "{{AAAA-MM-DD}}"
---

# 01 · PRD — Qué construimos y por qué

> **Para qué sirve:** es la "fuente de verdad" del producto. Si la IA o tú dudan sobre si algo entra o no en la app, se responde aquí.
> **Regla:** el PRD dice *qué* y *por qué*, nunca *cómo* (eso va en el TRD).

---

## 1. Resumen (overview)

| Campo | Valor |
|---|---|
| Nombre | {{NOMBRE_APP}} |
| Una línea | {{Ej.: "Inventario con etiquetas QR para tiendas de calzado, gestionado desde WhatsApp"}} |
| Problema que resuelve | {{Qué duele hoy, en palabras del usuario}} |
| Plataforma | Web responsive · PWA · Móvil nativo (elegir) |
| Idioma | Español (Perú) por defecto |

## 2. Usuarios

| Perfil | Quién es | Qué necesita lograr | Nivel técnico |
|---|---|---|---|
| Principal | {{}} | {{}} | Bajo / Medio / Alto |
| Secundario | {{}} | {{}} | |
| Administrador | {{}} | {{}} | |

**Base común a todas las apps:** asumimos usuarios con celular Android de gama media, conexión inestable y que ya usan WhatsApp a diario. La app debe entenderse sin tutorial.

## 3. Objetivos y métricas

| Objetivo | Métrica | Meta |
|---|---|---|
| {{Ej.: reducir tiempo de registro de stock}} | {{segundos por producto}} | {{< 10 s}} |
| Adopción | Usuarios activos semanales | {{}} |
| Retención | % que vuelve a los 7 días | {{}} |

## 4. Alcance

### 4.1 MVP (sí entra)
- [ ] {{Funcionalidad 1}}
- [ ] {{Funcionalidad 2}}

### 4.2 Fuera de alcance (no entra ahora)
- {{Ej.: pagos en línea}}

### 4.3 Futuro (ideas aparcadas)
- {{}}

## 5. Requisitos funcionales

Formato historia de usuario + criterio de aceptación. Numerar como `RF-XX` para que el Implementation Plan los referencie.

| ID | Como… | quiero… | para… | Criterio de aceptación | Prioridad |
|---|---|---|---|---|---|
| RF-01 | {{dueño de tienda}} | {{registrar un producto escaneando un QR}} | {{no escribir a mano}} | {{Al escanear, se abre la ficha en < 2 s}} | Alta |
| RF-02 | | | | | |

## 6. Requisitos no funcionales (base común)

Estos aplican a **todas** las apps salvo que aquí se indique lo contrario:

- **Rendimiento:** primera carga < 3 s en 4G; interacciones responden en < 100 ms (feedback visual inmediato, ver `07-MOTION.md`).
- **Accesibilidad:** contraste AA, objetivos táctiles ≥ 44 px, respeta "reducir movimiento" del sistema.
- **Offline:** la app no se rompe sin conexión; muestra estado y reintenta.
- **Seguridad:** autenticación obligatoria para datos privados; cada usuario solo ve sus datos.
- **Costo:** priorizar servicios con capa gratuita sin perjudicar el servicio.
- **Canal de comunicación:** WhatsApp como canal principal de notificaciones (Telegram como alternativa).

**Cambios de esta app respecto a la base:** {{ninguno / listar}}

## 7. Supuestos, riesgos y preguntas abiertas

| Tipo | Descripción | Cómo lo mitigamos |
|---|---|---|
| Riesgo | {{}} | {{}} |
| Pregunta | {{}} | {{}} |

## 8. Historial de cambios

| Fecha | Cambio | Motivo |
|---|---|---|
| {{}} | Creación desde base v1.0 | |
