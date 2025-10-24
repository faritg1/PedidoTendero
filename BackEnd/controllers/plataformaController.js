import pool from '../config/database.js';

// ===============================
// 1. VISUALIZAR TODOS LOS PEDIDOS
// ===============================
export const obtenerTodosPedidos = async (req, res) => {
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
        u.nombre as tendero,
        u.contacto as tendero_contacto,
        prov.nombre as proveedor
      FROM pedidos p
      JOIN productos pr ON p.producto_id = pr.id
      JOIN usuarios u ON p.tendero_id = u.id
      LEFT JOIN usuarios prov ON p.proveedor_id = prov.id
      ORDER BY p.fecha_pedido DESC
    `);

    res.json({ pedidos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// ===============================
// 2. CAMBIAR PEDIDOS A CONSOLIDACIÓN
// ===============================
export const consolidarPedidos = async (req, res) => {
  const { pedidos_ids } = req.body;

  if (!pedidos_ids || pedidos_ids.length === 0) {
    return res.status(400).json({ error: 'Debe seleccionar al menos un pedido' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Calcular fecha límite (72 horas)
    const fechaLimite = new Date();
    fechaLimite.setHours(fechaLimite.getHours() + 72);

    // Actualizar pedidos a consolidación
    const [result] = await connection.query(
      `UPDATE pedidos 
       SET estado = 'consolidacion', 
           fecha_limite_entrega = ? 
       WHERE id IN (?) AND estado = 'pendiente'`,
      [fechaLimite, pedidos_ids]
    );

    await connection.commit();

    res.json({ 
      mensaje: 'Pedidos consolidados exitosamente',
      pedidos_actualizados: result.affectedRows
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al consolidar pedidos' });
  } finally {
    connection.release();
  }
};

// ===============================
// 3. ASIGNAR PROVEEDOR A PEDIDOS
// ===============================
export const asignarProveedor = async (req, res) => {
  const { pedidos_ids, proveedor_id } = req.body;

  if (!pedidos_ids || pedidos_ids.length === 0 || !proveedor_id) {
    return res.status(400).json({ error: 'Debe proporcionar pedidos y proveedor' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar que el proveedor existe y es tipo proveedor
    const [proveedor] = await connection.query(
      'SELECT id FROM usuarios WHERE id = ? AND tipo_usuario = "proveedor"',
      [proveedor_id]
    );

    if (proveedor.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Proveedor no válido' });
    }

    // Asignar proveedor y cambiar a estado asignación
    const [result] = await connection.query(
      `UPDATE pedidos 
       SET proveedor_id = ?, 
           estado = 'asignacion' 
       WHERE id IN (?) AND estado = 'consolidacion'`,
      [proveedor_id, pedidos_ids]
    );

    await connection.commit();

    res.json({ 
      mensaje: 'Proveedor asignado exitosamente',
      pedidos_actualizados: result.affectedRows
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al asignar proveedor' });
  } finally {
    connection.release();
  }
};

// ===============================
// 4. CREAR PEDIDO CONSOLIDADO Y DESPACHAR
// ===============================
export const despacharPedidoConsolidado = async (req, res) => {
  const { pedidos_ids, zona, proveedor_id } = req.body;

  if (!pedidos_ids || pedidos_ids.length === 0 || !zona || !proveedor_id) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Calcular fecha de entrega estimada (72 horas)
    const fechaEntregaEstimada = new Date();
    fechaEntregaEstimada.setHours(fechaEntregaEstimada.getHours() + 72);

    // Crear pedido consolidado
    const [consolidado] = await connection.query(
      `INSERT INTO pedidos_consolidados (zona, proveedor_id, fecha_entrega_estimada)
       VALUES (?, ?, ?)`,
      [zona, proveedor_id, fechaEntregaEstimada]
    );

    const consolidadoId = consolidado.insertId;

    // Obtener datos de los pedidos para el detalle
    const [pedidos] = await connection.query(
      `SELECT producto_id, SUM(cantidad) as cantidad_total, SUM(precio_total) as precio_total,
              COUNT(DISTINCT tendero_id) as num_tiendas
       FROM pedidos
       WHERE id IN (?)
       GROUP BY producto_id`,
      [pedidos_ids]
    );

    // Insertar detalle del consolidado
    for (const pedido of pedidos) {
      await connection.query(
        `INSERT INTO detalle_consolidado 
         (pedido_consolidado_id, producto_id, cantidad_total, precio_total, num_tiendas)
         VALUES (?, ?, ?, ?, ?)`,
        [consolidadoId, pedido.producto_id, pedido.cantidad_total, pedido.precio_total, pedido.num_tiendas]
      );
    }

    // Actualizar totales del consolidado
    await connection.query(
      `UPDATE pedidos_consolidados 
       SET total_productos = (SELECT SUM(cantidad_total) FROM detalle_consolidado WHERE pedido_consolidado_id = ?),
           total_valor = (SELECT SUM(precio_total) FROM detalle_consolidado WHERE pedido_consolidado_id = ?)
       WHERE id = ?`,
      [consolidadoId, consolidadoId, consolidadoId]
    );

    // Actualizar pedidos individuales
    await connection.query(
      `UPDATE pedidos 
       SET estado = 'despacho', 
           pedido_consolidado_id = ?
       WHERE id IN (?) AND estado = 'asignacion'`,
      [consolidadoId, pedidos_ids]
    );

    await connection.commit();

    res.json({ 
      mensaje: 'Pedido consolidado creado y despachado exitosamente',
      consolidado_id: consolidadoId
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al despachar pedido consolidado' });
  } finally {
    connection.release();
  }
};

// ===============================
// 5. OBTENER RESUMEN POR ZONA Y ESTADO
// ===============================
export const obtenerResumenPedidos = async (req, res) => {
  try {
    const [resumen] = await pool.query(`
      SELECT 
        zona,
        estado,
        COUNT(*) as total_pedidos,
        SUM(cantidad) as total_productos,
        SUM(precio_total) as valor_total
      FROM pedidos
      GROUP BY zona, estado
      ORDER BY zona, estado
    `);

    res.json({ resumen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};

// ===============================
// 6. CREAR PRODUCTO (Solo plataforma)
// ===============================
export const crearProducto = async (req, res) => {
  const { nombre, descripcion, precio_unitario, unidad_medida } = req.body;

  if (!nombre || !precio_unitario) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio_unitario, unidad_medida)
       VALUES (?, ?, ?, ?)`,
      [nombre, descripcion || '', precio_unitario, unidad_medida || 'unidad']
    );

    res.json({ 
      mensaje: 'Producto creado exitosamente',
      producto_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// ===============================
// 7. LISTAR PROVEEDORES
// ===============================
export const obtenerProveedores = async (req, res) => {
  try {
    const [proveedores] = await pool.query(
      `SELECT id, nombre, zona, contacto, email
       FROM usuarios
       WHERE tipo_usuario = 'proveedor' AND activo = TRUE`
    );

    res.json({ proveedores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

// ===============================
// 8. OBTENER PRODUCTOS
// ===============================
export const obtenerProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(
      `SELECT id, nombre, descripcion, precio_unitario, unidad_medida
       FROM productos
       WHERE activo = TRUE
       ORDER BY nombre`
    );

    res.json({ productos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};
