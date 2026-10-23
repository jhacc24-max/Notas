---
documento: Backend Schema — Estructura de datos
version_base: 1.0
app: "{{NOMBRE_APP}}"
ultima_actualizacion: "{{AAAA-MM-DD}}"
---

# 05 · Backend Schema — Cómo se organizan los datos

> **Para qué sirve:** define tablas, relaciones, autenticación y permisos. Evita que la IA invente tablas distintas en cada sesión.
> **Regla:** cualquier tabla o columna nueva se agrega **primero aquí** y luego como migración en `/supabase/migrations`.

---

## 1. Diagrama de entidades

```mermaid
erDiagram
  PROFILES ||--o{ {{ENTIDAD_PRINCIPAL}} : "posee"
  {{ENTIDAD_PRINCIPAL}} ||--o{ {{ENTIDAD_DETALLE}} : "tiene"
  PROFILES ||--o{ NOTIFICATIONS : "recibe"
```

## 2. Tablas base (comunes a todas las apps)

### `profiles`
| Columna | Tipo | Reglas | Descripción |
|---|---|---|---|
| id | uuid | PK, = `auth.users.id` | |
| full_name | text | | |
| phone | text | único, formato E.164 (+51…) | Para WhatsApp |
| role | text | `owner` · `staff` · `admin` | |
| created_at | timestamptz | default `now()` | |

### `notifications`
| Columna | Tipo | Reglas | Descripción |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK → profiles | |
| channel | text | `whatsapp` · `telegram` · `in_app` | |
| payload | jsonb | | |
| status | text | `pending` · `sent` · `failed` | |
| created_at | timestamptz | | |

### `activity_types` (si la app tiene tareas, agenda o estados — ver `03-APPFLOW` §2b)
| Columna | Tipo | Reglas | Descripción |
|---|---|---|---|
| id | uuid | PK | |
| owner_id | uuid | FK → profiles | Cada negocio puede tener sus tipos |
| name | text | NOT NULL | "Venta", "Reposición"… |
| color | text | uno de: violeta, azul, verde, ambar, rojo, cian, rosa, cafe | Se pinta con `--cat-{color}-*` |
| icon | text | | Nombre del ícono |
| sort | int | | Orden en filtros |

Las tablas de tareas o eventos llevan `type_id uuid → activity_types`, más `starts_at` / `ends_at` (timestamptz), `done boolean` y una tabla puente `event_participants (event_id, profile_id)` para los avatares.

### `audit_log` (opcional)
Registro de quién cambió qué y cuándo.

## 3. Tablas propias de esta app

### `{{tabla}}`
| Columna | Tipo | Reglas | Descripción |
|---|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` | |
| owner_id | uuid | FK → profiles, NOT NULL | Dueño del registro |
| {{}} | | | |
| created_at | timestamptz | default `now()` | |
| updated_at | timestamptz | trigger | |

## 4. Relaciones

| Desde | Hacia | Tipo | Al borrar |
|---|---|---|---|
| {{tabla}}.owner_id | profiles.id | muchos a uno | cascade |

## 5. Autenticación

- **Método base:** teléfono con código (OTP) o correo + enlace mágico. {{elegir}}
- Al registrarse se crea la fila en `profiles` (trigger).
- Roles definidos en `profiles.role`.

## 6. Permisos (RLS)

| Tabla | Leer | Crear | Editar | Borrar |
|---|---|---|---|---|
| profiles | el propio | sistema | el propio | — |
| {{tabla}} | `owner_id = auth.uid()` | autenticado | dueño | dueño |

```sql
alter table {{tabla}} enable row level security;
create policy "dueño lee" on {{tabla}} for select using (owner_id = auth.uid());
```

## 7. Archivos (Storage)

| Bucket | Contenido | Público | Tamaño máx. |
|---|---|---|---|
| {{avatars}} | fotos de perfil | sí | 2 MB |

**Color de imagen (base común):** toda tabla que guarde una imagen grande (portada, producto, colección) tiene además la columna `image_color text` con el color dominante en hex (por ejemplo, `#EE9A55`). Se calcula al subir la imagen y lo usa el Patrón D (`04-UIUX` §5) para fundir la imagen con el fondo.

## 8. Funciones del servidor / webhooks

| Función | Disparador | Qué hace |
|---|---|---|
| `whatsapp-webhook` | mensaje entrante | {{}} |
| `notify` | inserción en `notifications` | envía por el canal indicado |

## 9. Tiempo real

Tablas con suscripción en vivo (para animar cambios en pantalla, ver `07-MOTION` › `live-update-flash`): {{}}

## 10. Cambios respecto a la base
{{}}
