/* ----------------------------------------------------------------------------
   Conexión con Supabase (panel de Yeron)
   Déjalo vacío para que la web funcione sola, sin panel (reserva solo por WhatsApp).

   supabaseUrl      → Supabase → Project Settings → API → Project URL
   supabaseAnonKey  → la clave «anon» / «publishable». Es PÚBLICA por diseño: los
                      permisos los fija la base de datos (RLS, ver supabase/schema.sql).
   ¡NUNCA pegues aquí la clave «service_role» ni «secret»!
---------------------------------------------------------------------------- */
window.YERON_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
};
