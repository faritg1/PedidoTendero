import express from 'express';
import { verificarToken, verificarPlataforma } from '../middleware/auth.js';
import {
  obtenerTodosPedidos,
  consolidarPedidos,
  asignarProveedor,
  despacharPedidoConsolidado,
  obtenerResumenPedidos,
  crearProducto,
  obtenerProveedores,
  obtenerProductos
} from '../controllers/plataformaController.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de plataforma
router.use(verificarToken);
router.use(verificarPlataforma);

// 1. Visualizar todos los pedidos
router.get('/pedidos', obtenerTodosPedidos);

// 2. Consolidar pedidos (cambiar a estado consolidación)
router.post('/pedidos/consolidar', consolidarPedidos);

// 3. Asignar proveedor a pedidos
router.post('/pedidos/asignar-proveedor', asignarProveedor);

// 4. Crear pedido consolidado y despachar
router.post('/pedidos/despachar', despacharPedidoConsolidado);

// 5. Obtener resumen de pedidos por zona y estado
router.get('/pedidos/resumen', obtenerResumenPedidos);

// 6. Crear producto
router.post('/productos', crearProducto);

// 7. Listar proveedores
router.get('/proveedores', obtenerProveedores);

// 8. Listar productos
router.get('/productos', obtenerProductos);

export default router;
