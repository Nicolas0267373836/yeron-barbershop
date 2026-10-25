// POST /api/reservar — crea una cita pendiente. Todo se valida en la base (función crear_cita).
import { consulta } from './_lib/db.js';
import { responder, leerJson, ipDe, codigoDeError, esChoqueDeHora, permitir, registrarIntento, limpiarIntentos } from './_lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { error: 'metodo' });
  const b = await leerJson(req);
  if (!b || typeof b !== 'object') return responder(res, 400, { error: 'cuerpo' });
  const texto = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  try {
    const ip = ipDe(req);
    if (!(await permitir(consulta, 'reserva', ip, 20, 60))) return responder(res, 429, { error: 'demasiados_intentos' });
    await registrarIntento(consulta, 'reserva', ip);
    if (Math.random() < 0.02) limpiarIntentos(consulta).catch(() => {});
    const [r] = await consulta(
      'select crear_cita($1, $2::date, $3::int, $4, $5, $6, $7::int, $8) as id',
      [texto(b.servicio, 150), texto(b.fecha, 10), Number.isInteger(b.hora) ? b.hora : -1, texto(b.nombre, 120), texto(b.telefono, 40),
        texto(b.sector, 200), Number.isInteger(b.personas) ? b.personas : 1, texto(b.nota, 400)],
    );
    return responder(res, 200, { id: r.id });
  } catch (err) {
    const codigo = codigoDeError(err);
    if (codigo) return responder(res, codigo === 'hora_ocupada' ? 409 : 400, { error: codigo });
    if (esChoqueDeHora(err)) return responder(res, 409, { error: 'hora_ocupada' });
    if (/invalid input syntax|out of range/i.test(String(err && err.message))) return responder(res, 400, { error: 'fecha_invalida' });
    return responder(res, 500, { error: 'servidor' });
  }
}
