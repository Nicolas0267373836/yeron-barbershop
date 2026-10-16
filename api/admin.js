// POST /api/admin  { accion, ...datos } — panel de Yeron. Todo requiere la sesión firmada, salvo «login».
import { consulta } from './_lib/db.js';
import { responder, leerJson, ipDe, esChoqueDeHora, permitir, registrarIntento } from './_lib/util.js';
import { claveCorrecta, crearCookie, cookieVacia, sesionValida } from './_lib/auth.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'completada'];
const MODOS = ['barberia', 'domicilio', 'cerrado', 'por_confirmar'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { error: 'metodo' });
  // Defensa contra CSRF: solo JSON con una cabecera propia (un formulario de otro sitio no puede enviarla).
  if (!String(req.headers['content-type'] || '').includes('application/json') || req.headers['x-yeron'] !== '1') return responder(res, 403, { error: 'origen' });
  const b = await leerJson(req);
  if (!b || typeof b !== 'object' || typeof b.accion !== 'string') return responder(res, 400, { error: 'cuerpo' });

  try {
    if (b.accion === 'login') {
      const ip = ipDe(req);
      if (!(await permitir(consulta, 'login', ip, 6, 15))) return responder(res, 429, { error: 'demasiados_intentos' });
      if (!claveCorrecta(String(b.usuario || ''), String(b.clave || ''))) {
        await registrarIntento(consulta, 'login', ip);
        return responder(res, 401, { error: 'credenciales' });
      }
      return responder(res, 200, { ok: true }, { 'Set-Cookie': crearCookie(req) });
    }
    if (b.accion === 'logout') return responder(res, 200, { ok: true }, { 'Set-Cookie': cookieVacia() });
    if (!sesionValida(req)) return responder(res, 401, { error: 'sin_sesion' });

    switch (b.accion) {
      case 'sesion':
        return responder(res, 200, { ok: true });

      case 'citas': {
        const desde = FECHA.test(b.desde) ? b.desde : '1970-01-01';
        const filas = await consulta(
          `select id, creado, servicio, fecha::text as fecha, hora, lugar, nombre, telefono, sector, personas, nota, estado, nota_interna
           from citas where fecha >= $1::date order by fecha, hora limit 1000`, [desde]);
        const cierres = await consulta(`select fecha::text as fecha, tipo, motivo from cierres where fecha >= $1::date order by fecha`, [FECHA.test(b.hoy) ? b.hoy : desde]);
        return responder(res, 200, { citas: filas, cierres });
      }

      case 'ajustes': {
        const [horario, config] = await Promise.all([
          consulta('select dow, modo, abre, cierra from horario order by dow'),
          consulta('select domicilio_desde, aviso, aviso_activo from config where id = 1'),
        ]);
        return responder(res, 200, { horario, config: config[0] || { domicilio_desde: 1000, aviso: '', aviso_activo: false } });
      }

      case 'cita_actualizar': {
        const id = String(b.id || '');
        if (!/^[0-9a-f-]{36}$/i.test(id)) return responder(res, 400, { error: 'id' });
        const sets = []; const p = [id];
        if (b.estado !== undefined) {
          if (!ESTADOS.includes(b.estado)) return responder(res, 400, { error: 'estado' });
          p.push(b.estado); sets.push(`estado = $${p.length}`);
        }
        if (b.fecha !== undefined || b.hora !== undefined) {
          if (!FECHA.test(b.fecha) || !Number.isInteger(b.hora) || b.hora < 0 || b.hora > 23) return responder(res, 400, { error: 'fecha_hora' });
          p.push(b.fecha); sets.push(`fecha = $${p.length}::date`);
          p.push(b.hora); sets.push(`hora = $${p.length}::int`);
        }
        if (!sets.length) return responder(res, 400, { error: 'sin_cambios' });
        try {
          const filas = await consulta(
            `update citas set ${sets.join(', ')} where id = $1::uuid
             returning id, creado, servicio, fecha::text as fecha, hora, lugar, nombre, telefono, sector, personas, nota, estado, nota_interna`, p);
          if (!filas.length) return responder(res, 404, { error: 'no_existe' });
          return responder(res, 200, { cita: filas[0] });
        } catch (err) {
          if (esChoqueDeHora(err)) return responder(res, 409, { error: 'hora_ocupada' });
          throw err;
        }
      }

      case 'cierre_guardar': {
        if (!FECHA.test(b.fecha) || !['feriado', 'cerrado'].includes(b.tipo)) return responder(res, 400, { error: 'datos' });
        const motivo = typeof b.motivo === 'string' ? b.motivo.trim().slice(0, 120) : '';
        await consulta(
          `insert into cierres (fecha, tipo, motivo) values ($1::date, $2, $3)
           on conflict (fecha) do update set tipo = excluded.tipo, motivo = excluded.motivo`, [b.fecha, b.tipo, motivo]);
        return responder(res, 200, { ok: true });
      }

      case 'cierre_borrar': {
        if (!FECHA.test(b.fecha)) return responder(res, 400, { error: 'datos' });
        await consulta('delete from cierres where fecha = $1::date', [b.fecha]);
        return responder(res, 200, { ok: true });
      }

      case 'horario_guardar': {
        const dias = Array.isArray(b.dias) ? b.dias : [];
        const limpios = [];
        for (const d of dias) {
          if (!d || !Number.isInteger(d.dow) || d.dow < 0 || d.dow > 6 || !MODOS.includes(d.modo)) return responder(res, 400, { error: 'datos' });
          const conHoras = d.modo === 'barberia' || d.modo === 'domicilio';
          if (d.modo === 'domicilio' && d.dow !== 3) return responder(res, 400, { error: 'domicilio_miercoles' });
          if (conHoras && !(Number.isInteger(d.abre) && Number.isInteger(d.cierra) && d.abre >= 0 && d.abre < d.cierra && d.cierra <= 24)) return responder(res, 400, { error: 'horas' });
          limpios.push({ dow: d.dow, modo: d.modo, abre: conHoras ? d.abre : null, cierra: conHoras ? d.cierra : null });
        }
        if (!limpios.length) return responder(res, 400, { error: 'datos' });
        // Una sola sentencia: se guardan todos los días o ninguno.
        await consulta(
          `update horario h set modo = x.modo, abre = x.abre, cierra = x.cierra
           from json_to_recordset($1::json) as x(dow int, modo text, abre int, cierra int) where h.dow = x.dow`, [JSON.stringify(limpios)]);
        return responder(res, 200, { ok: true });
      }

      case 'config_guardar': {
        const sets = []; const p = [];
        if (b.domicilio_desde !== undefined) {
          if (!Number.isInteger(b.domicilio_desde) || b.domicilio_desde < 0 || b.domicilio_desde > 1000000) return responder(res, 400, { error: 'monto' });
          p.push(b.domicilio_desde); sets.push(`domicilio_desde = $${p.length}`);
        }
        if (b.aviso !== undefined || b.aviso_activo !== undefined) {
          const aviso = typeof b.aviso === 'string' ? b.aviso.trim().slice(0, 200) : '';
          p.push(aviso); sets.push(`aviso = $${p.length}`);
          p.push(Boolean(b.aviso_activo)); sets.push(`aviso_activo = $${p.length}`);
        }
        if (!sets.length) return responder(res, 400, { error: 'sin_cambios' });
        await consulta(`update config set ${sets.join(', ')} where id = 1`, p);
        return responder(res, 200, { ok: true });
      }

      default:
        return responder(res, 400, { error: 'accion' });
    }
  } catch (err) {
    return responder(res, 500, { error: 'servidor' });
  }
}
