import pool from '../config/database.js';


export const obtenerProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        precio_unitario,
        unidad_medida
      FROM productos
      WHERE activo = TRUE
      ORDER BY nombre ASC
    `);

    res.json({ productos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ===============================
// 2. VERIFICAR SI TIENE PEDIDOS ACTIVOS
// ===============================
export const verificarPedidosActivos = async (req, res) => {
  const tendero_id = req.usuario.id;

  try {
    const [pedidos] = await pool.query(`
      SELECT COUNT(*) as pedidos_activos
      FROM pedidos
      WHERE tendero_id = ?
      AND estado NOT IN ('entregado', 'recibido')
    `, [tendero_id]);

    const tienePedidosActivos = pedidos[0].pedidos_activos > 0;

    res.json({ 
      tiene_pedidos_activos: tienePedidosActivos,
      cantidad: pedidos[0].pedidos_activos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar pedidos activos' });
  }
};

// ===============================
// 3. CREAR PEDIDO
// ===============================
export const crearPedido = async (req, res) => {
  const tendero_id = req.usuario.id;
  const zona = req.usuario.zona;
  const { producto_id, cantidad } = req.body;

  // Validaciones
  if (!producto_id || !cantidad) {
    return res.status(400).json({ error: 'Producto y cantidad son requeridos' });
  }

  if (cantidad <= 0) {
    return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
  }

  if (!zona) {
    return res.status(400).json({ error: 'El tendero debe tener una zona asignada' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar si tiene pedidos activos
    const [pedidosActivos] = await connection.query(`
      SELECT COUNT(*) as pedidos_activos
      FROM pedidos
      WHERE tendero_id = ?
      AND estado NOT IN ('entregado', 'recibido')
    `, [tendero_id]);

    if (pedidosActivos[0].pedidos_activos > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Ya tienes un pedido activo. Debes esperar a que se entregue para hacer otro.' 
      });
    }

    // Obtener precio del producto
    const [productos] = await connection.query(
      'SELECT precio_unitario, activo FROM productos WHERE id = ?',
      [producto_id]
    );

    if (productos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (!productos[0].activo) {
      await connection.rollback();
      return res.status(400).json({ error: 'Producto no disponible' });
    }

    const precio_unitario = productos[0].precio_unitario;
    const precio_total = precio_unitario * cantidad;

    // Crear pedido
    const [result] = await connection.query(`
      INSERT INTO pedidos (
        tendero_id,
        producto_id,
        cantidad,
        precio_total,
        zona,
        estado
      ) VALUES (?, ?, ?, ?, ?, 'pendiente')
    `, [tendero_id, producto_id, cantidad, precio_total, zona]);

    await connection.commit();

    res.json({
      mensaje: 'Pedido creado exitosamente',
      pedido: {
        id: result.insertId,
        producto_id,
        cantidad,
        precio_total,
        zona,
        estado: 'pendiente'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al crear pedido' });
  } finally {
    connection.release();
  }
};

// ===============================
// 4. OBTENER MIS PEDIDOS
// ===============================
export const obtenerMisPedidos = async (req, res) => {
  const tendero_id = req.usuario.id;

  try {
    const [pedidos] = await pool.query(`
      SELECT 
        p.id,
        p.cantidad,
        p.precio_total,
        p.zona,
        p.estado,
        p.fecha_pedido,
        p.fecha_limite_entrega,
        p.observaciones,
        pr.nombre as producto,
        pr.precio_unitario,
        pr.unidad_medida,
        prov.nombre as proveedor,
        prov.contacto as proveedor_contacto
      FROM pedidos p
      JOIN productos pr ON p.producto_id = pr.id
      LEFT JOIN usuarios prov ON p.proveedor_id = prov.id
      WHERE p.tendero_id = ?
      ORDER BY p.fecha_pedido DESC
    `, [tendero_id]);

    // Separar pedidos activos e historial
    const pedidosActivos = pedidos.filter(p => 
      !['entregado', 'recibido'].includes(p.estado)
    );
    
    const historial = pedidos.filter(p => 
      ['entregado', 'recibido'].includes(p.estado)
    );

    res.json({ 
      pedidos_activos: pedidosActivos,
      historial: historial,
      total: pedidos.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// ===============================
// 5. MARCAR PEDIDO COMO RECIBIDO
// ===============================
export const marcarComoRecibido = async (req, res) => {
  const tendero_id = req.usuario.id;
  const { pedido_id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar que el pedido es del tendero y está en estado 'entregado'
    const [pedidos] = await connection.query(`
      SELECT id, estado
      FROM pedidos
      WHERE id = ? AND tendero_id = ?
    `, [pedido_id, tendero_id]);

    if (pedidos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedidos[0].estado !== 'entregado') {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Solo puedes marcar como recibido pedidos que están en estado "entregado"' 
      });
    }

    // Actualizar estado
    await connection.query(`
      UPDATE pedidos
      SET estado = 'recibido'
      WHERE id = ?
    `, [pedido_id]);

    // Registrar en historial
    await connection.query(`
      INSERT INTO historial_pedidos (pedido_id, estado_anterior, estado_nuevo, usuario_id)
      VALUES (?, 'entregado', 'recibido', ?)
    `, [pedido_id, tendero_id]);

    await connection.commit();

    res.json({ mensaje: 'Pedido marcado como recibido' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al marcar pedido como recibido' });
  } finally {
    connection.release();
  }
};

// ===============================
// 6. OBTENER ESTADÍSTICAS
// ===============================
export const obtenerEstadisticas = async (req, res) => {
  const tendero_id = req.usuario.id;

  try {
    // Total de pedidos
    const [totalPedidos] = await pool.query(`
      SELECT COUNT(*) as total
      FROM pedidos
      WHERE tendero_id = ?
    `, [tendero_id]);

    // Pedidos por estado
    const [pedidosPorEstado] = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM pedidos
      WHERE tendero_id = ?
      GROUP BY estado
    `, [tendero_id]);

    // Total gastado
    const [totalGastado] = await pool.query(`
      SELECT COALESCE(SUM(precio_total), 0) as total
      FROM pedidos
      WHERE tendero_id = ? AND estado IN ('entregado', 'recibido')
    `, [tendero_id]);

    // Productos más pedidos
    const [productosMasPedidos] = await pool.query(`
      SELECT 
        pr.nombre,
        COUNT(*) as veces_pedido,
        SUM(p.cantidad) as cantidad_total
      FROM pedidos p
      JOIN productos pr ON p.producto_id = pr.id
      WHERE p.tendero_id = ?
      GROUP BY pr.id, pr.nombre
      ORDER BY cantidad_total DESC
      LIMIT 5
    `, [tendero_id]);

    res.json({
      total_pedidos: totalPedidos[0].total,
      pedidos_por_estado: pedidosPorEstado,
      total_gastado: parseFloat(totalGastado[0].total),
      productos_mas_pedidos: productosMasPedidos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
