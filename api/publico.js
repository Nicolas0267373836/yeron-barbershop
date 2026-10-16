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
    const [horario, cierres, config, ocupadas] = await Promise.all([
      consulta('select dow, modo, abre, cierra from horario order by dow'),
      consulta(`select fecha::text as fecha, tipo, motivo from cierres where fecha >= $1::date order by fecha`, [desde]),
      consulta('select domicilio_desde, aviso, aviso_activo from config where id = 1'),
      consulta(`select fecha::text as fecha, hora from citas
                where estado in ('pendiente', 'confirmada') and fecha between $1::date and least($2::date, $1::date + 60)`, [desde, hasta]),
    ]);
    return responder(res, 200, { horario, cierres, config: config[0] || null, ocupadas }, {
      'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=30',
    });
  } catch (err) {
    return responder(res, 500, { error: 'servidor' });
  }
}
