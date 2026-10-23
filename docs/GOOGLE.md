# Configurar Google (una sola vez, por quien publica la app)

Los usuarios solo pulsan «Conectar con Google». Para que esa ventana exista, la app necesita un **Client ID** (es público, no es una contraseña).

1. Entra en <https://console.cloud.google.com> → crea un proyecto (p. ej. «Notas»).
2. **APIs y servicios → Biblioteca**: habilita **Google Calendar API** y **Google Tasks API**.
3. **Pantalla de consentimiento OAuth**: tipo *Externo*; nombre de la app, tu correo; en *Permisos* añade
   `.../auth/calendar.events` y `.../auth/tasks`; en *Usuarios de prueba* añade las cuentas que usarán la app.
4. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web**. En *Orígenes JavaScript autorizados* pon la URL donde está publicada la app, p. ej. `https://TU_USUARIO.github.io` (sin barra final ni ruta). No hace falta URI de redirección.
5. Copia el ID (`xxxx.apps.googleusercontent.com`) y pégalo en `js/config.js` → `googleClientId`, o (solo para probar) en Ajustes → Google → Opciones avanzadas.

**Importante sobre el modo «Prueba»:** mientras la app esté en modo de prueba, solo pueden conectar las cuentas listadas como *usuarios de prueba* (hasta 100) y Google muestra un aviso de «app no verificada» (se continúa con *Avanzado → Ir a…*). Para abrirla a cualquier persona hay que enviar la app a verificación de Google (los permisos de Calendar/Tasks son «sensibles»).
