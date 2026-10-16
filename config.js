/* ----------------------------------------------------------------------------
   Conexión con el panel de Yeron (funciones /api en Vercel + base de datos Neon)

   api: '/api'  → la web lee horario, días cerrados y avisos del panel, y guarda las citas.
   api: ''      → la web funciona sola, sin panel (la reserva solo abre WhatsApp).

   Aquí NO va ninguna clave: la conexión a Neon (DATABASE_URL) y el acceso de Yeron
   se configuran como variables de entorno en Vercel (ver README, «Panel administrativo»).
   Si la API no responde, la web sigue funcionando con los datos de script.js.
---------------------------------------------------------------------------- */
window.YERON_CONFIG = {
  api: '/api',
};
