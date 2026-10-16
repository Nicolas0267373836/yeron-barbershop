// Utilidades comunes de las funciones /api (sin dependencias).
export function responder(res, estado, datos, cabeceras = {}) {
  res.statusCode = estado;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!cabeceras['Cache-Control']) res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(cabeceras)) res.setHeader(k, v);
  res.end(datos === undefined ? '' : JSON.stringify(datos));
}

export async function leerJson(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return null; } }
    if (Buffer.isBuffer(req.body)) { try { return JSON.parse(req.body.toString('utf8')); } catch { return null; } }
    return typeof req.body === 'object' ? req.body : null;
  }
  const trozos = [];
  let total = 0;
  for await (const t of req) {
    total += t.length;
    if (total > 20000) return null;
    trozos.push(t);
  }
  try { return JSON.parse(Buffer.concat(trozos).toString('utf8') || 'null'); } catch { return null; }
}

export const ipDe = (req) => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconocida').split(',')[0].trim().slice(0, 64);

const CODIGOS = new Set([
  'servicio_invalido', 'nombre_invalido', 'telefono_invalido', 'fecha_invalida', 'dia_no_disponible', 'dia_cerrado',
  'hora_invalida', 'hora_pasada', 'servicio_no_disponible', 'sector_requerido', 'demasiadas_citas', 'hora_ocupada',
]);
/** Convierte un error de la base en un código de la API, o null si no es uno conocido. */
export const codigoDeError = (err) => {
  const m = String((err && err.message) || '').trim();
  if (CODIGOS.has(m)) return m;
  for (const c of CODIGOS) if (m.includes(c)) return c;
  return null;
};
export const esChoqueDeHora = (err) => err && (err.code === '23505' || /citas_hora_unica|duplicate key/i.test(String(err.message || '')));

/** Limita intentos por IP (tabla intentos). Devuelve true si todavía puede intentar. */
export async function permitir(consulta, tipo, ip, maximo, minutos) {
  const [r] = await consulta(
    `select count(*)::int as n from intentos where tipo = $1 and ip = $2 and creado > now() - ($3 || ' minutes')::interval`,
    [tipo, ip, String(minutos)],
  );
  return r.n < maximo;
}
export const registrarIntento = (consulta, tipo, ip) => consulta('insert into intentos (tipo, ip) values ($1, $2)', [tipo, ip]);
export const limpiarIntentos = (consulta) => consulta(`delete from intentos where creado < now() - interval '1 day'`);
