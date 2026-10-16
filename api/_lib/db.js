// Acceso a Neon (Postgres). Solo se usa desde el servidor: la cadena de conexión nunca llega al navegador.
// Funciona con la integración de Neon del Marketplace de Vercel (inyecta POSTGRES_URL / DATABASE_URL solas)
// o con una cadena pegada a mano. Las tablas se crean solas la primera vez (como en DentalSpace).
// Para pruebas locales se puede indicar un adaptador con YERON_DB_ADAPTER (módulo que exporte «consulta»).
import { pathToFileURL } from 'node:url';
import { SENTENCIAS } from './esquema.js';

let _sql = null;
let _adaptador = null;
let _listo = null;

const cadena = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || '';

async function ejecutar(texto, params = []) {
  const url = cadena();
  if (!url) throw Object.assign(new Error('sin_base'), { interno: true });
  if (process.env.YERON_DB_ADAPTER) {
    if (!_adaptador) _adaptador = await import(pathToFileURL(process.env.YERON_DB_ADAPTER).href);
    return _adaptador.consulta(texto, params);
  }
  if (!_sql) { const { neon } = await import('@neondatabase/serverless'); _sql = neon(url); }
  return _sql.query(texto, params);
}

const ESTA_LISTA = `select (to_regclass('public.horario') is not null
  and to_regclass('public.cierres') is not null and to_regclass('public.config') is not null
  and to_regclass('public.citas') is not null and to_regclass('public.intentos') is not null
  and to_regprocedure('crear_cita(text,date,integer,text,text,text,integer,text)') is not null) as ok`;

/** Crea las tablas y la función la primera vez (idempotente). Si dos instancias lo hacen a la vez, la segunda reintenta. */
async function asegurarEsquema() {
  const [r] = await ejecutar(ESTA_LISTA);
  if (r && r.ok) return;
  for (const s of SENTENCIAS) {
    try { await ejecutar(s); } catch (err) {
      const [otra] = await ejecutar(ESTA_LISTA).catch(() => [{}]);
      if (!(otra && otra.ok)) throw err;
    }
  }
}

export async function consulta(texto, params = []) {
  if (!_listo) _listo = asegurarEsquema().catch((e) => { _listo = null; throw e; });
  await _listo;
  return ejecutar(texto, params);
}
