// Genera ADMIN_CLAVE_HASH y SESSION_SECRET para las variables de entorno de Vercel.
// Uso:  npm run clave     (la contraseña se escribe sin mostrarse y no se guarda en ningún archivo)
import { randomBytes, scryptSync } from 'node:crypto';
import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl._writeToOutput = (s) => { if (s.includes('Contraseña')) rl.output.write(s); };
rl.question('Contraseña nueva para Yeron (mín. 10 caracteres): ', (clave) => {
  rl.close();
  process.stdout.write('\n');
  if (clave.length < 10) { console.error('Muy corta: usa al menos 10 caracteres.'); process.exit(1); }
  const sal = randomBytes(16);
  const hash = scryptSync(clave, sal, 64).toString('hex');
  console.log('Copia estas líneas en Vercel → Settings → Environment Variables:\n');
  console.log(`ADMIN_CLAVE_HASH=scrypt$${sal.toString('hex')}$${hash}`);
  console.log(`SESSION_SECRET=${randomBytes(32).toString('hex')}`);
  console.log('\nTambién agrega ADMIN_USUARIO (el correo o nombre con el que Yeron entrará) y DATABASE_URL (la cadena de conexión de Neon).');
});
