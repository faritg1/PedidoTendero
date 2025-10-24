import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }

  try {
    // Buscar usuario
    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = usuarios[0];

    // Verificar password
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        zona: usuario.zona
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        zona: usuario.zona,
        contacto: usuario.contacto
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ===============================
// REGISTRO
// ===============================
export const registro = async (req, res) => {
  const { nombre, email, password, tipo_usuario, zona, contacto } = req.body;

  if (!nombre || !email || !password || !tipo_usuario) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    // Verificar si el email ya existe
    const [emailExiste] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (emailExiste.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, tipo_usuario, zona, contacto)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, email, passwordHash, tipo_usuario, zona || null, contacto || null]
    );

    res.json({
      mensaje: 'Usuario registrado exitosamente',
      usuario_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};
