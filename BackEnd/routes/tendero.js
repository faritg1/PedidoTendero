import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import {
  obtenerProductos,
  verificarPedidosActivos,
  crearPedido,
  obtenerMisPedidos,
  marcarComoRecibido,
  obtenerEstadisticas
} from '../controllers/tenderoController.js';

const router = express.Router();

// Middleware: verificar que el usuario es un tendero
const verificarTendero = (req, res, next) => {
  if (req.usuario.tipo_usuario !== 'tendero') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para tenderos.' });
  }
  next();
};

// Aplicar middleware a todas las rutas
router.use(verificarToken);
router.use(verificarTendero);

// ===============================
// RUTAS DEL TENDERO
// ===============================

// GET /api/tendero/productos - Obtener productos disponibles
router.get('/productos', obtenerProductos);

// GET /api/tendero/verificar-pedidos-activos - Verificar si tiene pedidos activos
router.get('/verificar-pedidos-activos', verificarPedidosActivos);

// POST /api/tendero/pedidos - Crear un nuevo pedido
router.post('/pedidos', crearPedido);

// GET /api/tendero/pedidos - Obtener mis pedidos
router.get('/pedidos', obtenerMisPedidos);

// PUT /api/tendero/pedidos/:pedido_id/recibido - Marcar pedido como recibido
router.put('/pedidos/:pedido_id/recibido', marcarComoRecibido);

// GET /api/tendero/estadisticas - Obtener estadísticas
router.get('/estadisticas', obtenerEstadisticas);

export default router;
