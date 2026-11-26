// GET /api/publico?desde=AAAA-MM-DD&hasta=AAAA-MM-DD
// Datos públicos para la web: horario, días cerrados, configuración y horas ocupadas (sin datos personales).
import { consulta } from './_lib/db.js';
import { responder } from './_lib/util.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  if (req.method !== 'GET') return responder(res, 405, { error: 'metodo' });
  try {
    const url = new URL(req.url, 'http://x');
    const desde = url.searchParams.get('desde') || '';
    const hasta = url.searchParams.get('hasta') || '';
    if (!FECHA.test(desde) || !FECHA.test(hasta)) return responder(res, 400, { error: 'fechas' });
    const [horario, cierres, config, ocupadas, barberos, contacto] = await Promise.all([
      consulta('select h.barbero, h.dow, h.modo, h.abre, h.cierra from horario_barberos h join barberos b on b.id = h.barbero where b.activo order by h.barbero, h.dow'),
      consulta(`select fecha::text as fecha, tipo, motivo from cierres where fecha >= $1::date order by fecha`, [desde]),
      consulta('select domicilio_desde, aviso, aviso_activo from config where id = 1'),
      consulta(`select fecha::text as fecha, hora, barbero from citas
                where estado in ('pendiente', 'confirmada') and fecha between $1::date and least($2::date, $1::date + 60)`, [desde, hasta]),
      consulta('select id, nombre, whatsapp from barberos where activo order by nombre'),
      consulta('select whatsapp from barberos where id = $1', ['yeron']),
    ]);
    return responder(res, 200, { barberos, horario, cierres, config: config[0] || null, ocupadas, whatsappYeron: contacto[0]?.whatsapp || null });
  } catch (err) {
    return responder(res, 500, { error: 'servidor' });
  }
}
