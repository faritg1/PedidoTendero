import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import {
  obtenerPedidosConsolidados,
  obtenerDetalleConsolidado,
  actualizarEstadoConsolidado,
  obtenerPedidos,
  obtenerEstadisticas,
  obtenerZonasAsignadas,
  obtenerTiendasPorZona
} from '../controllers/proveedorController.js';

const router = express.Router();

// Middleware: verificar que el usuario es un proveedor
const verificarProveedor = (req, res, next) => {
  if (req.usuario.tipo_usuario !== 'proveedor') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para proveedores.' });
  }
  next();
};

// Aplicar middleware a todas las rutas
router.use(verificarToken);
router.use(verificarProveedor);

// ===============================
// RUTAS DEL PROVEEDOR
// ===============================

// GET /api/proveedor/consolidados - Obtener pedidos consolidados asignados
router.get('/consolidados', obtenerPedidosConsolidados);

// GET /api/proveedor/consolidados/:consolidado_id - Detalle de un consolidado
router.get('/consolidados/:consolidado_id', obtenerDetalleConsolidado);

// PUT /api/proveedor/consolidados/:consolidado_id/estado - Actualizar estado
router.put('/consolidados/:consolidado_id/estado', actualizarEstadoConsolidado);

// GET /api/proveedor/pedidos - Obtener todos los pedidos (con filtros)
router.get('/pedidos', obtenerPedidos);

// GET /api/proveedor/estadisticas - Obtener estadísticas
router.get('/estadisticas', obtenerEstadisticas);

// GET /api/proveedor/zonas - Obtener zonas asignadas
router.get('/zonas', obtenerZonasAsignadas);

// GET /api/proveedor/tiendas - Obtener tiendas por zona
router.get('/tiendas', obtenerTiendasPorZona);

export default router;
