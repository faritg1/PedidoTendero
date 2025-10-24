import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token inválido' });
  }
};

export const verificarPlataforma = (req, res, next) => {
  if (req.usuario.tipo_usuario !== 'plataforma') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para usuarios de plataforma.' });
  }
  next();
};
