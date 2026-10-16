// Acceso a Neon (Postgres). Solo se usa desde el servidor: DATABASE_URL nunca llega al navegador.
// Para pruebas locales se puede indicar un adaptador con YERON_DB_ADAPTER (ruta a un módulo que exporte «consulta»).
import { pathToFileURL } from 'node:url';

let _sql = null;
let _adaptador = null;

export async function consulta(texto, params = []) {
  const url = process.env.DATABASE_URL;
  if (!url) throw Object.assign(new Error('sin_base'), { interno: true });
  if (process.env.YERON_DB_ADAPTER) {
    if (!_adaptador) _adaptador = await import(pathToFileURL(process.env.YERON_DB_ADAPTER).href);
    return _adaptador.consulta(texto, params);
  }
  if (!_sql) { const { neon } = await import('@neondatabase/serverless'); _sql = neon(url); }
  return _sql.query(texto, params);
}
