// Sesión del administrador: un solo usuario definido por variables de entorno (sin contraseñas en el código).
//   ADMIN_USUARIO         correo o nombre de usuario de Yeron
//   ADMIN_CLAVE_HASH      resultado de «npm run clave» (scrypt); la contraseña real nunca se guarda
//   SESSION_SECRET        texto aleatorio largo para firmar la sesión
import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const DURACION = 7 * 24 * 3600;   // 7 días
const NOMBRE = 'yeron_sesion';

const iguales = (a, b) => {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export function claveCorrecta(usuario, clave) {
  const u = process.env.ADMIN_USUARIO || '';
  const h = process.env.ADMIN_CLAVE_HASH || '';
  const partes = h.split('$');
  // Se hace el cálculo siempre, para que el tiempo no revele si el usuario existe.
  let ok = false;
  if (partes.length === 3 && partes[0] === 'scrypt' && u) {
    try {
      const calculado = scryptSync(String(clave), Buffer.from(partes[1], 'hex'), 64).toString('hex');
      ok = iguales(calculado, partes[2]);
    } catch { ok = false; }
  }
  const mismoUsuario = iguales(String(usuario).trim().toLowerCase(), u.trim().toLowerCase());
  return ok && mismoUsuario;
}

const firmar = (texto) => createHmac('sha256', process.env.SESSION_SECRET || '').update(texto).digest('base64url');

export function crearCookie(req) {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 24) throw Object.assign(new Error('sin_secreto'), { interno: true });
  const carga = Buffer.from(JSON.stringify({ e: Math.floor(Date.now() / 1000) + DURACION })).toString('base64url');
  const valor = `${carga}.${firmar(carga)}`;
  const seguro = !/^(localhost|127\.0\.0\.1)(:|$)/.test(String(req.headers.host || ''));
  return `${NOMBRE}=${valor}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${DURACION}${seguro ? '; Secure' : ''}`;
}
export const cookieVacia = () => `${NOMBRE}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0`;

export function sesionValida(req) {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 24) return false;
  const c = String(req.headers.cookie || '').split(';').map((s) => s.trim()).find((s) => s.startsWith(`${NOMBRE}=`));
  if (!c) return false;
  const [carga, firma] = c.slice(NOMBRE.length + 1).split('.');
  if (!carga || !firma || !iguales(firma, firmar(carga))) return false;
  try { return JSON.parse(Buffer.from(carga, 'base64url').toString('utf8')).e > Date.now() / 1000; } catch { return false; }
}
