import pool from '../config/database.js';

export const obtenerPedidosConsolidados = async (req, res) => {
  const proveedor_id = req.usuario.id;

  try {
    const [consolidados] = await pool.query(`
      SELECT 
        pc.id,
        pc.zona,
        pc.estado,
        pc.fecha_creacion,
        pc.fecha_despacho,
        pc.fecha_entrega_estimada,
        pc.total_productos,
        pc.total_valor,
        pc.observaciones,
        COUNT(DISTINCT p.id) as num_pedidos,
        COUNT(DISTINCT p.tendero_id) as num_tiendas
      FROM pedidos_consolidados pc
      LEFT JOIN pedidos p ON pc.id = p.pedido_consolidado_id
      WHERE pc.proveedor_id = ?
      GROUP BY pc.id
      ORDER BY pc.fecha_creacion DESC
    `, [proveedor_id]);

    res.json({ consolidados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pedidos consolidados' });
  }
};

// ===============================
// 2. OBTENER DETALLE DE UN CONSOLIDADO
// ===============================
export const obtenerDetalleConsolidado = async (req, res) => {
  const proveedor_id = req.usuario.id;
  const { consolidado_id } = req.params;

  try {
    // Verificar que el consolidado es del proveedor
    const [consolidados] = await pool.query(
      'SELECT * FROM pedidos_consolidados WHERE id = ? AND proveedor_id = ?',
      [consolidado_id, proveedor_id]
    );

    if (consolidados.length === 0) {
      return res.status(404).json({ error: 'Consolidado no encontrado' });
    }

    const consolidado = consolidados[0];

    // Obtener pedidos del consolidado
    const [pedidos] = await pool.query(`
      SELECT 
        p.id,
        p.cantidad,
        p.precio_total,
        p.estado,
        p.fecha_pedido,
        pr.nombre as producto,
        pr.precio_unitario,
        pr.unidad_medida,
        u.nombre as tendero,
        u.contacto as tendero_contacto,
        u.zona as tendero_zona
      FROM pedidos p
      JOIN productos pr ON p.producto_id = pr.id
      JOIN usuarios u ON p.tendero_id = u.id
      WHERE p.pedido_consolidado_id = ?
      ORDER BY u.nombre, pr.nombre
    `, [consolidado_id]);

    // Obtener resumen por producto
    const [resumenProductos] = await pool.query(`
      SELECT 
        dc.producto_id,
        dc.cantidad_total,
        dc.precio_total,
        dc.num_tiendas,
        pr.nombre as producto,
        pr.unidad_medida
      FROM detalle_consolidado dc
      JOIN productos pr ON dc.producto_id = pr.id
      WHERE dc.pedido_consolidado_id = ?
      ORDER BY pr.nombre
    `, [consolidado_id]);

    res.json({
      consolidado,
      pedidos,
      resumen_productos: resumenProductos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener detalle del consolidado' });
  }
};

// ===============================
// 3. ACTUALIZAR ESTADO DEL CONSOLIDADO
// ===============================
export const actualizarEstadoConsolidado = async (req, res) => {
  const proveedor_id = req.usuario.id;
  const { consolidado_id } = req.params;
  const { nuevo_estado, observaciones } = req.body;

  // Validar estado
  const estadosPermitidos = ['en_preparacion', 'enviado', 'entregado'];
  if (!estadosPermitidos.includes(nuevo_estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar que el consolidado es del proveedor
    const [consolidados] = await connection.query(
      'SELECT estado FROM pedidos_consolidados WHERE id = ? AND proveedor_id = ?',
      [consolidado_id, proveedor_id]
    );

    if (consolidados.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Consolidado no encontrado' });
    }

    const estado_actual = consolidados[0].estado;

    // Actualizar consolidado
    await connection.query(
      `UPDATE pedidos_consolidados 
       SET estado = ?, observaciones = ?
       WHERE id = ?`,
      [nuevo_estado, observaciones || null, consolidado_id]
    );

    // Actualizar pedidos individuales según el estado del consolidado
    let estado_pedidos = '';
    if (nuevo_estado === 'en_preparacion') {
      estado_pedidos = 'despacho';
    } else if (nuevo_estado === 'enviado') {
      estado_pedidos = 'enviado';
    } else if (nuevo_estado === 'entregado') {
      estado_pedidos = 'entregado';
    }

    await connection.query(
      `UPDATE pedidos 
       SET estado = ?
       WHERE pedido_consolidado_id = ?`,
      [estado_pedidos, consolidado_id]
    );

    // Registrar en historial para cada pedido
    const [pedidos] = await connection.query(
      'SELECT id FROM pedidos WHERE pedido_consolidado_id = ?',
      [consolidado_id]
    );

    for (const pedido of pedidos) {
      await connection.query(
        `INSERT INTO historial_pedidos (pedido_id, estado_anterior, estado_nuevo, usuario_id, observaciones)
         VALUES (?, ?, ?, ?, ?)`,
        [pedido.id, estado_actual, estado_pedidos, proveedor_id, observaciones || null]
      );
    }

    await connection.commit();

    res.json({ 
      mensaje: 'Estado actualizado exitosamente',
      nuevo_estado,
      pedidos_actualizados: pedidos.length
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  } finally {
    connection.release();
  }
};

// ===============================
// 4. OBTENER TODOS LOS PEDIDOS (por zona o tienda)
// ===============================
export const obtenerPedidos = async (req, res) => {
  const proveedor_id = req.usuario.id;
  const { zona, tendero_id } = req.query;

  try {
    let query = `
      SELECT 
        p.id,
        p.cantidad,
        p.precio_total,
        p.zona,
        p.estado,
        p.fecha_pedido,
        p.fecha_limite_entrega,
        p.pedido_consolidado_id,
        pr.nombre as producto,
        pr.precio_unitario,
        pr.unidad_medida,
        u.nombre as tendero,
        u.contacto as tendero_contacto,
        pc.fecha_entrega_estimada
      FROM pedidos p
      JOIN productos pr ON p.producto_id = pr.id
      JOIN usuarios u ON p.tendero_id = u.id
      LEFT JOIN pedidos_consolidados pc ON p.pedido_consolidado_id = pc.id
      WHERE p.proveedor_id = ?
    `;

    const params = [proveedor_id];

    if (zona) {
      query += ' AND p.zona = ?';
      params.push(zona);
    }

    if (tendero_id) {
      query += ' AND p.tendero_id = ?';
      params.push(tendero_id);
    }

    query += ' ORDER BY p.fecha_pedido DESC';

    const [pedidos] = await pool.query(query, params);

    res.json({ pedidos, total: pedidos.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// ===============================
// 5. OBTENER ESTADÍSTICAS DEL PROVEEDOR
// ===============================
export const obtenerEstadisticas = async (req, res) => {
  const proveedor_id = req.usuario.id;

  try {
    // Total de consolidados
    const [totalConsolidados] = await pool.query(`
      SELECT COUNT(*) as total
      FROM pedidos_consolidados
      WHERE proveedor_id = ?
    `, [proveedor_id]);

    // Consolidados por estado
    const [consolidadosPorEstado] = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM pedidos_consolidados
      WHERE proveedor_id = ?
      GROUP BY estado
    `, [proveedor_id]);

    // Total de pedidos
    const [totalPedidos] = await pool.query(`
      SELECT COUNT(*) as total
      FROM pedidos
      WHERE proveedor_id = ?
    `, [proveedor_id]);

    // Pedidos por estado
    const [pedidosPorEstado] = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM pedidos
      WHERE proveedor_id = ?
      GROUP BY estado
    `, [proveedor_id]);

    // Total vendido
    const [totalVendido] = await pool.query(`
      SELECT COALESCE(SUM(precio_total), 0) as total
      FROM pedidos
      WHERE proveedor_id = ? AND estado IN ('enviado', 'entregado', 'recibido')
    `, [proveedor_id]);

    // Pedidos por zona
    const [pedidosPorZona] = await pool.query(`
      SELECT zona, COUNT(*) as cantidad, SUM(precio_total) as total_valor
      FROM pedidos
      WHERE proveedor_id = ?
      GROUP BY zona
      ORDER BY cantidad DESC
    `, [proveedor_id]);

    // Productos más despachados
    const [productosMasDespachados] = await pool.query(`
      SELECT 
        pr.nombre,
        SUM(p.cantidad) as cantidad_total,
        COUNT(*) as veces_despachado
      FROM pedidos p
      JOIN productos pr ON p.producto_id = pr.id
      WHERE p.proveedor_id = ?
      GROUP BY pr.id, pr.nombre
      ORDER BY cantidad_total DESC
      LIMIT 5
    `, [proveedor_id]);

    // Tiendas atendidas
    const [tiendasAtendidas] = await pool.query(`
      SELECT 
        u.nombre,
        u.zona,
        COUNT(*) as total_pedidos,
        SUM(p.precio_total) as total_comprado
      FROM pedidos p
      JOIN usuarios u ON p.tendero_id = u.id
      WHERE p.proveedor_id = ?
      GROUP BY u.id, u.nombre, u.zona
      ORDER BY total_comprado DESC
    `, [proveedor_id]);

    res.json({
      total_consolidados: totalConsolidados[0].total,
      consolidados_por_estado: consolidadosPorEstado,
      total_pedidos: totalPedidos[0].total,
      pedidos_por_estado: pedidosPorEstado,
      total_vendido: parseFloat(totalVendido[0].total),
      pedidos_por_zona: pedidosPorZona,
      productos_mas_despachados: productosMasDespachados,
      tiendas_atendidas: tiendasAtendidas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// ===============================
// 6. OBTENER ZONAS ASIGNADAS
// ===============================
export const obtenerZonasAsignadas = async (req, res) => {
  const proveedor_id = req.usuario.id;

  try {
    const [zonas] = await pool.query(`
      SELECT DISTINCT zona
      FROM pedidos
      WHERE proveedor_id = ?
      ORDER BY zona
    `, [proveedor_id]);

    res.json({ zonas: zonas.map(z => z.zona) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener zonas' });
  }
};

// ===============================
// 7. OBTENER TIENDAS POR ZONA
// ===============================
export const obtenerTiendasPorZona = async (req, res) => {
  const proveedor_id = req.usuario.id;
  const { zona } = req.query;

  try {
    let query = `
      SELECT DISTINCT
        u.id,
        u.nombre,
        u.zona,
        u.contacto,
        COUNT(p.id) as total_pedidos,
        SUM(p.precio_total) as total_comprado
      FROM usuarios u
      JOIN pedidos p ON u.id = p.tendero_id
      WHERE p.proveedor_id = ?
    `;

    const params = [proveedor_id];

    if (zona) {
      query += ' AND u.zona = ?';
      params.push(zona);
    }

    query += `
      GROUP BY u.id, u.nombre, u.zona, u.contacto
      ORDER BY u.nombre
    `;

    const [tiendas] = await pool.query(query, params);

    res.json({ tiendas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tiendas' });
  }
};
