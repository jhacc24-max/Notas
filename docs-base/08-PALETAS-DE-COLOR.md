---
documento: Paletas de color — plantilla por color, modo claro y oscuro
version_base: 1.0
app: "{{NOMBRE_APP}}"
paleta_elegida: "{{marino | azul | indigo | violeta | rosa | rojo | naranja | ambar | verde | esmeralda | turquesa | cian | cafe | pizarra}}"
ultima_actualizacion: "{{AAAA-MM-DD}}"
---

# 08 · Paletas de color

> **Para qué sirve:** eliges **un color** y ya tienes la plantilla completa, exacta, para modo claro y oscuro. No se inventan colores por app.
> **Vista visual:** `paletas/paletas.html` (página "Paletas de color"): eliges color, cambias claro/oscuro y ves las pantallas A, B y C con esa paleta.
> **Código listo:** `paletas/paletas.css` (todas las paletas) y `paletas/paletas.json` (los mismos datos para scripts).

---

## 1. Cómo se usa

1. Abre la página de paletas, prueba colores con las pantallas reales y elige uno.
2. Escribe su `id` arriba en `paleta_elegida`.
3. En la app: copia `paletas.css` (o solo el bloque de tu color) y pon `<html data-palette="{{id}}">`.
4. El modo oscuro se activa solo según el celular; para forzarlo, `data-theme="dark"` o `"light"`.
5. En el código **solo se usan roles** (`var(--hero)`, `var(--tint)`…), nunca hex sueltos. Así cambiar de color es cambiar una palabra.

## 2. Cómo está construida cada paleta

- **Escala de 11 tonos** (`--tone-50` … `--tone-950`) calculada en OKLCH: la misma luminosidad en todos los colores, por eso todas las paletas "pesan" igual y las pantallas no se desbalancean al cambiar de color.
- **Neutros teñidos**: fondo, texto y bordes llevan un toque del color elegido (nunca gris puro).
- **Roles**: cada parte de la interfaz tiene un nombre fijo que apunta a un tono distinto en claro y en oscuro.
- **Contraste verificado**: texto sobre fondo y blanco sobre `hero` cumplen AA (≥ 4.5) en ambos modos.

## 3. Roles (iguales para todas las paletas)

| Rol | Dónde se usa |
|---|---|
| `--bg` | Fondo de pantalla y paneles (Patrón A y B) |
| `--surface` | Tarjetas blancas, hojas (Patrón C) |
| `--tint` | Tarjetas tintadas (métricas, "Habla con…") |
| `--selected` | Acceso rápido / chip seleccionado |
| `--hero` | Superficie oscura: cabecera B, tarjeta héroe A, CTA C |
| `--hero-2` | Botones sobre superficie hero (filtros) |
| `--on-hero` | Texto principal sobre hero |
| `--on-hero-soft` | Texto secundario sobre hero (línea 2 del título) |
| `--accent` | Botones primarios, enlaces, foco |
| `--on-accent` | Texto sobre accent |
| `--text` | Texto principal |
| `--text-2` | Texto secundario |
| `--border` | Bordes y divisores |
| `--nav` | Fondo de la barra de navegación flotante |
| `--nav-active` | Píldora de la pestaña activa |
| `--on-nav-active` | Ícono + nombre de la pestaña activa |
| `--img-1a … img-3b` | Degradados de relleno para tarjetas-imagen sin foto |

**Regla de jerarquía tonal** (de `04-UIUX` §5): en claro, `hero` (oscuro) → `tint` → `surface` → `bg`. En oscuro se invierte la lógica: `hero` es la superficie **más clara y saturada**, luego `tint`, `surface` y `bg` (el más oscuro). La jerarquía se mantiene: lo importante siempre destaca más.

## 4. Catálogo de paletas

### Azul marino · `marino`

_Sugerido para: Salud, finanzas, servicios profesionales (ref. 01)._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#F2F7FF` | `#E3EDFF` | `#C8DCFF` | `#A3C2F9` | `#7BA1E7` | `#5883D2` | `#4269B4` | `#305394` | `#213D73` | `#132954` | `#071738` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#F1F6FE` | `#090E19` |
| `--surface` | `#FFFFFF` | `#121927` |
| `--tint` | `#E3EDFF` | `#1A2740` |
| `--selected` | `#C8DCFF` | `#213D73` |
| `--hero` | `#132954` | `#305394` |
| `--hero-2` | `#213D73` | `#4269B4` |
| `--on-hero-soft` | `#A3C2F9` | `#C8DCFF` |
| `--accent` | `#4269B4` | `#7BA1E7` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#12161E` | `#EDF2FA` |
| `--text-2` | `#5C6471` | `#9CA5B4` |
| `--border` | `#DADEE6` | `#262E3D` |
| `--nav` | `#FFFFFF` | `#1A2230` |
| `--nav-active` | `#132954` | `#5883D2` |

Contraste: texto 16.7:1 / 17.2:1 · blanco sobre hero 14.3:1 / 7.5:1

### Azul · `azul`

_Sugerido para: Tecnología, logística, confianza._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#F2F7FF` | `#E1EEFF` | `#C3DDFF` | `#96C4FF` | `#5AA3FF` | `#0782F8` | `#0069CD` | `#0053A5` | `#003E7E` | `#002A59` | `#001939` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#F0F6FE` | `#070F19` |
| `--surface` | `#FFFFFF` | `#101A27` |
| `--tint` | `#E1EEFF` | `#09274C` |
| `--selected` | `#C3DDFF` | `#003E7E` |
| `--hero` | `#002A59` | `#0053A5` |
| `--hero-2` | `#003E7E` | `#0069CD` |
| `--on-hero-soft` | `#96C4FF` | `#C3DDFF` |
| `--accent` | `#0069CD` | `#5AA3FF` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#11161E` | `#EDF2FA` |
| `--text-2` | `#5A6471` | `#9BA6B4` |
| `--border` | `#D9DFE6` | `#242F3C` |
| `--nav` | `#FFFFFF` | `#18222F` |
| `--nav-active` | `#002A59` | `#0782F8` |

Contraste: texto 16.7:1 / 17.1:1 · blanco sobre hero 14.2:1 / 7.6:1

### Índigo · `indigo`

_Sugerido para: Productividad, educación._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#F4F6FF` | `#E7ECFF` | `#D0D9FF` | `#AFBCFF` | `#8797FF` | `#6570FF` | `#5056DE` | `#3E40B9` | `#2D2D91` | `#1D1B6C` | `#100B4A` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#F3F5FE` | `#0B0D19` |
| `--surface` | `#FFFFFF` | `#151827` |
| `--tint` | `#E7ECFF` | `#1D224E` |
| `--selected` | `#D0D9FF` | `#2D2D91` |
| `--hero` | `#1D1B6C` | `#3E40B9` |
| `--hero-2` | `#2D2D91` | `#5056DE` |
| `--on-hero-soft` | `#AFBCFF` | `#D0D9FF` |
| `--accent` | `#5056DE` | `#8797FF` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#14151E` | `#EFF1FA` |
| `--text-2` | `#5F6271` | `#A0A4B4` |
| `--border` | `#DBDEE6` | `#292D3C` |
| `--nav` | `#FFFFFF` | `#1D2130` |
| `--nav-active` | `#1D1B6C` | `#6570FF` |

Contraste: texto 16.7:1 / 17.2:1 · blanco sobre hero 14.7:1 / 8.0:1

### Violeta · `violeta`

_Sugerido para: Creatividad, bienestar._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#F8F5FF` | `#EFE9FF` | `#DFD3FF` | `#C9B2FF` | `#B085FF` | `#975EEF` | `#7D44CF` | `#6530AC` | `#4D2087` | `#360F63` | `#220344` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#F6F4FD` | `#100C17` |
| `--surface` | `#FFFFFF` | `#1B1725` |
| `--tint` | `#EFE9FF` | `#2D1D49` |
| `--selected` | `#DFD3FF` | `#4D2087` |
| `--hero` | `#360F63` | `#6530AC` |
| `--hero-2` | `#4D2087` | `#7D44CF` |
| `--on-hero-soft` | `#C9B2FF` | `#DFD3FF` |
| `--accent` | `#7D44CF` | `#B085FF` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#17141D` | `#F2F0F9` |
| `--text-2` | `#65616F` | `#A6A2B2` |
| `--border` | `#DFDCE5` | `#2F2B3B` |
| `--nav` | `#FFFFFF` | `#231F2E` |
| `--nav-active` | `#360F63` | `#975EEF` |

Contraste: texto 16.7:1 / 17.1:1 · blanco sobre hero 14.9:1 / 8.2:1

### Rosa · `rosa`

_Sugerido para: Belleza, moda, comunidad._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#FFF3F8` | `#FFE4F0` | `#FFC9E1` | `#FF9ECD` | `#EE6EB0` | `#D64295` | `#B6267B` | `#951263` | `#74034B` | `#520034` | `#34001F` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#FDF3F7` | `#160A10` |
| `--surface` | `#FFFFFF` | `#24141B` |
| `--tint` | `#FFE4F0` | `#42152D` |
| `--selected` | `#FFC9E1` | `#74034B` |
| `--hero` | `#520034` | `#951263` |
| `--hero-2` | `#74034B` | `#B6267B` |
| `--on-hero-soft` | `#FF9ECD` | `#FFC9E1` |
| `--accent` | `#B6267B` | `#EE6EB0` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#1C1317` | `#F9EFF3` |
| `--text-2` | `#6E5E65` | `#B19FA7` |
| `--border` | `#E5DBDF` | `#392830` |
| `--nav` | `#FFFFFF` | `#2C1C24` |
| `--nav-active` | `#520034` | `#D64295` |

Contraste: texto 16.7:1 / 17.2:1 · blanco sobre hero 14.9:1 / 8.3:1

### Rojo · `rojo`

_Sugerido para: Comida, urgencias, deporte._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#FFF4F3` | `#FFE6E4` | `#FFCDC8` | `#FFA59E` | `#FE6B66` | `#E83A3E` | `#C71826` | `#A30018` | `#7C000F` | `#580008` | `#380003` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#FEF3F2` | `#180A09` |
| `--surface` | `#FFFFFF` | `#251413` |
| `--tint` | `#FFE6E4` | `#471312` |
| `--selected` | `#FFCDC8` | `#7C000F` |
| `--hero` | `#580008` | `#A30018` |
| `--hero-2` | `#7C000F` | `#C71826` |
| `--on-hero-soft` | `#FFA59E` | `#FFCDC8` |
| `--accent` | `#C71826` | `#FE6B66` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#1E1312` | `#FAEFEE` |
| `--text-2` | `#705E5C` | `#B39F9D` |
| `--border` | `#E6DBDA` | `#3B2826` |
| `--nav` | `#FFFFFF` | `#2E1C1B` |
| `--nav-active` | `#580008` | `#E83A3E` |

Contraste: texto 16.7:1 / 17.2:1 · blanco sobre hero 14.8:1 / 8.2:1

### Naranja · `naranja`

_Sugerido para: Delivery, energía, ofertas._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#FFF4EF` | `#FFE7DC` | `#FFCFB7` | `#FFA97D` | `#F17D38` | `#D15D00` | `#AC4B00` | `#893B00` | `#682B00` | `#491C00` | `#2E0F00` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#FDF4EF` | `#170B06` |
| `--surface` | `#FFFFFF` | `#24150E` |
| `--tint` | `#FFE7DC` | `#431A02` |
| `--selected` | `#FFCFB7` | `#682B00` |
| `--hero` | `#491C00` | `#893B00` |
| `--hero-2` | `#682B00` | `#AC4B00` |
| `--on-hero-soft` | `#FFA97D` | `#FFCFB7` |
| `--accent` | `#AC4B00` | `#F17D38` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#1D140F` | `#F9F0EB` |
| `--text-2` | `#6F5F58` | `#B2A098` |
| `--border` | `#E5DCD7` | `#3A2A21` |
| `--nav` | `#FFFFFF` | `#2D1D15` |
| `--nav-active` | `#491C00` | `#D15D00` |

Contraste: texto 16.7:1 / 17.2:1 · blanco sobre hero 14.5:1 / 7.8:1

### Ámbar · `ambar`

_Sugerido para: Construcción, ahorro, alertas._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#FFF5E7` | `#FEEACC` | `#F7D5A2` | `#E9B869` | `#D3940A` | `#AE7900` | `#8E6200` | `#714D00` | `#563A00` | `#3C2700` | `#251600` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#FAF5ED` | `#140D04` |
| `--surface` | `#FFFFFF` | `#211809` |
| `--tint` | `#FEEACC` | `#372300` |
| `--selected` | `#F7D5A2` | `#563A00` |
| `--hero` | `#3C2700` | `#714D00` |
| `--hero-2` | `#563A00` | `#8E6200` |
| `--on-hero-soft` | `#E9B869` | `#F7D5A2` |
| `--accent` | `#8E6200` | `#D3940A` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#1B150D` | `#F6F1E9` |
| `--text-2` | `#6B6254` | `#ADA394` |
| `--border` | `#E2DDD5` | `#362C1D` |
| `--nav` | `#FFFFFF` | `#292011` |
| `--nav-active` | `#3C2700` | `#AE7900` |

Contraste: texto 16.7:1 / 17.1:1 · blanco sobre hero 14.2:1 / 7.6:1

### Verde · `verde`

_Sugerido para: Nutrición, agro, sostenibilidad._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#EDFCED` | `#DAF6DA` | `#BAEABA` | `#8FD591` | `#5BBA61` | `#219F35` | `#008321` | `#006818` | `#004F10` | `#003608` | `#002103` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#F1F8F1` | `#081108` |
| `--surface` | `#FFFFFF` | `#111D11` |
| `--tint` | `#DAF6DA` | `#0D3010` |
| `--selected` | `#BAEABA` | `#004F10` |
| `--hero` | `#003608` | `#006818` |
| `--hero-2` | `#004F10` | `#008321` |
| `--on-hero-soft` | `#8FD591` | `#BAEABA` |
| `--accent` | `#008321` | `#5BBA61` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#111811` | `#EDF4ED` |
| `--text-2` | `#5B675B` | `#9CA99C` |
| `--border` | `#D9E0D9` | `#253225` |
| `--nav` | `#FFFFFF` | `#192519` |
| `--nav-active` | `#003608` | `#219F35` |

Contraste: texto 16.7:1 / 17.2:1 · blanco sobre hero 13.7:1 / 7.0:1

### Esmeralda · `esmeralda`

_Sugerido para: Salud, pagos, crecimiento._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#EBFCF3` | `#D6F6E5` | `#B3E9CE` | `#82D5AF` | `#42BA8A` | `#009D6D` | `#008058` | `#006645` | `#004C33` | `#003522` | `#002013` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#EFF8F3` | `#05120B` |
| `--surface` | `#FFFFFF` | `#0C1E16` |
| `--tint` | `#D6F6E5` | `#03301F` |
| `--selected` | `#B3E9CE` | `#004C33` |
| `--hero` | `#003522` | `#006645` |
| `--hero-2` | `#004C33` | `#008058` |
| `--on-hero-soft` | `#82D5AF` | `#B3E9CE` |
| `--accent` | `#008058` | `#42BA8A` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#0E1914` | `#EBF4EF` |
| `--text-2` | `#57685F` | `#98AAA0` |
| `--border` | `#D7E1DC` | `#20322A` |
| `--nav` | `#FFFFFF` | `#14261E` |
| `--nav-active` | `#003522` | `#009D6D` |

Contraste: texto 16.6:1 / 17.1:1 · blanco sobre hero 13.7:1 / 7.0:1

### Turquesa · `turquesa`

_Sugerido para: Viajes, agua, limpieza._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#EBFBF9` | `#D6F4F1` | `#B3E7E1` | `#82D2CA` | `#43B6AD` | `#009991` | `#007D76` | `#00635D` | `#004A46` | `#003330` | `#001F1D` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#EDF9F7` | `#021210` |
| `--surface` | `#FFFFFF` | `#071E1C` |
| `--tint` | `#D6F4F1` | `#032F2C` |
| `--selected` | `#B3E7E1` | `#004A46` |
| `--hero` | `#003330` | `#00635D` |
| `--hero-2` | `#004A46` | `#007D76` |
| `--on-hero-soft` | `#82D2CA` | `#B3E7E1` |
| `--accent` | `#007D76` | `#43B6AD` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#0C1917` | `#E9F5F3` |
| `--text-2` | `#546866` | `#94AAA7` |
| `--border` | `#D6E1DF` | `#1C3330` |
| `--nav` | `#FFFFFF` | `#102624` |
| `--nav-active` | `#003330` | `#009991` |

Contraste: texto 16.7:1 / 17.2:1 · blanco sobre hero 13.9:1 / 7.1:1

### Cian · `cian`

_Sugerido para: Mensajería, comunicación._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#EBFAFF` | `#D3F3FF` | `#AAE6FB` | `#72D0EF` | `#11B3DB` | `#0093B5` | `#007894` | `#005F76` | `#00475A` | `#00313E` | `#001D27` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#EEF8FC` | `#031116` |
| `--surface` | `#FFFFFF` | `#081C23` |
| `--tint` | `#D3F3FF` | `#002D39` |
| `--selected` | `#AAE6FB` | `#00475A` |
| `--hero` | `#00313E` | `#005F76` |
| `--hero-2` | `#00475A` | `#007894` |
| `--on-hero-soft` | `#72D0EF` | `#AAE6FB` |
| `--accent` | `#007894` | `#11B3DB` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#0D181C` | `#EAF4F8` |
| `--text-2` | `#55676D` | `#95A8AF` |
| `--border` | `#D6E0E4` | `#1D3138` |
| `--nav` | `#FFFFFF` | `#11252C` |
| `--nav-active` | `#00313E` | `#0093B5` |

Contraste: texto 16.7:1 / 17.2:1 · blanco sobre hero 13.9:1 / 7.2:1

### Café · `cafe`

_Sugerido para: Calzado, cuero, artesanía._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#FCF5F1` | `#F7EAE2` | `#ECD6C8` | `#D9BAA5` | `#C0987E` | `#A67A5C` | `#8B6145` | `#704C33` | `#563823` | `#3C2515` | `#261508` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#FBF4F1` | `#140C08` |
| `--surface` | `#FFFFFF` | `#211710` |
| `--tint` | `#F7EAE2` | `#32241B` |
| `--selected` | `#ECD6C8` | `#563823` |
| `--hero` | `#3C2515` | `#704C33` |
| `--hero-2` | `#563823` | `#8B6145` |
| `--on-hero-soft` | `#D9BAA5` | `#ECD6C8` |
| `--accent` | `#8B6145` | `#C0987E` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#1B1511` | `#F7F0ED` |
| `--text-2` | `#6B615A` | `#ADA29B` |
| `--border` | `#E3DDD9` | `#362B24` |
| `--nav` | `#FFFFFF` | `#291F18` |
| `--nav-active` | `#3C2515` | `#A67A5C` |

Contraste: texto 16.6:1 / 17.2:1 · blanco sobre hero 14.3:1 / 7.6:1

### Pizarra · `pizarra`

_Sugerido para: Neutro sobrio, herramientas internas._

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#F5F7FA` | `#E9EDF3` | `#D4DBE5` | `#B7C2D0` | `#95A3B5` | `#77869A` | `#5F6D80` | `#4A5666` | `#36414E` | `#242C37` | `#141A22` |

| Rol | Claro | Oscuro |
|---|---|---|
| `--bg` | `#F4F6F9` | `#0C0F12` |
| `--surface` | `#FFFFFF` | `#161A1E` |
| `--tint` | `#E9EDF3` | `#23282E` |
| `--selected` | `#D4DBE5` | `#36414E` |
| `--hero` | `#242C37` | `#4A5666` |
| `--hero-2` | `#36414E` | `#5F6D80` |
| `--on-hero-soft` | `#B7C2D0` | `#D4DBE5` |
| `--accent` | `#5F6D80` | `#95A3B5` |
| `--on-accent` | `#FFFFFF` | `#111318` |
| `--text` | `#141619` | `#F0F2F5` |
| `--text-2` | `#606468` | `#A1A5AA` |
| `--border` | `#DCDEE1` | `#2A2E33` |
| `--nav` | `#FFFFFF` | `#1E2226` |
| `--nav-active` | `#242C37` | `#77869A` |

Contraste: texto 16.7:1 / 17.1:1 · blanco sobre hero 14.1:1 / 7.5:1

## 5. Colores por categoría (tareas, agenda, etiquetas)

Cuando la app tiene **tipos de actividad** (tareas, eventos de calendario, pedidos por estado, productos por familia), cada tipo lleva un color fijo. Estos 8 colores son **independientes de la paleta principal**: conviven con cualquiera y tienen su versión clara y oscura.

Cada categoría tiene 3 valores:
- `--cat-{id}-stripe`: la **franja vertical izquierda** de la tarjeta (el detalle de color que distingue la actividad).
- `--cat-{id}-bg`: fondo del **cuadro del ícono** y de chips.
- `--cat-{id}-fg`: color del **ícono** y del texto del chip.

| Categoría | Uso sugerido | Ícono sugerido | Claro (franja / fondo / ícono) | Oscuro (franja / fondo / ícono) |
|---|---|---|---|---|
| `violeta` | Salud y ejercicio | pesa | `#975EEF` / `#EFE9FF` / `#6530AC` | `#B085FF` / `#33244E` / `#C9B2FF` |
| `azul` | Reuniones y diseño | laptop | `#0782F8` / `#E1EEFF` / `#0053A5` | `#5AA3FF` / `#122E51` / `#96C4FF` |
| `verde` | Trabajo principal / ventas | código o carrito | `#219F35` / `#DAF6DA` / `#006818` | `#5BBA61` / `#163618` / `#8FD591` |
| `ambar` | Clientes y comunicación | personas | `#D3940A` / `#FEEACC` / `#714D00` | `#D3940A` / `#3E2901` / `#E9B869` |
| `rojo` | Urgente / personal | libro o alerta | `#E83A3E` / `#FFE6E4` / `#A30018` | `#FE6B66` / `#4D1C1A` / `#FFA59E` |
| `cian` | Logística y envíos | camión | `#0093B5` / `#D3F3FF` / `#005F76` | `#11B3DB` / `#023441` / `#72D0EF` |
| `rosa` | Eventos y comunidad | estrella | `#D64295` / `#FFE4F0` / `#951263` | `#EE6EB0` / `#471D33` / `#FF9ECD` |
| `cafe` | Inventario y producción | caja | `#A67A5C` / `#F7EAE2` / `#704C33` | `#C0987E` / `#382B22` / `#D9BAA5` |

**Reglas:**
- Cada app define su **tabla de tipos** (en `03-APPFLOW` §2b): qué tipo usa qué color. Máximo 8 tipos.
- El color **nunca va solo**: siempre acompañado del ícono y del nombre del tipo (accesibilidad).
- No usar la categoría del mismo tono que la paleta principal para tipos importantes (se confunde con botones).
- El código está en `paletas/paletas.css` (al final) y `paletas/categorias.json`.

## 6. Personalización de esta app

| Ajuste | Valor |
|---|---|
| Paleta elegida | {{}} |
| ¿Modo oscuro habilitado? | sí (base) / no |
| Color secundario (opcional, solo para gráficos o etiquetas) | {{otra paleta, tono 500}} |
| Excepciones | {{}} |
