import bcrypt from 'bcrypt';

// Script para generar passwords hasheados
const password = 'password123';

async function generarHash() {
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n--- SQL para actualizar usuarios ---\n');
  console.log(`-- Actualizar todos los usuarios con la nueva contraseña hasheada`);
  console.log(`UPDATE usuarios SET password = '${hash}';`);
}

generarHash();
