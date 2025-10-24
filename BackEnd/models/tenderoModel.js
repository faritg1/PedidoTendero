import { db } from "./db.js";

export const crearTendero = async (nombre, zona, contacto, email, password) => {
  const [rows] = await db.query(
    `INSERT INTO usuarios (nombre, zona, contacto, email, password, tipo_usuario)
     VALUES (?, ?, ?, ?, ?, 'tendero')`,
    [nombre, zona, contacto, email, password]
  );
  return rows.insertId;
};

export const obtenerProductos = async () => {
  const [rows] = await db.query(`SELECT id, nombre, precio_unitario FROM productos WHERE activo = 1`);
  return rows;
};

export const crearPedido = async (tenderoId, productoId, cantidad, precioTotal, zona) => {
  const [rows] = await db.query(
    `INSERT INTO pedidos (tendero_id, producto_id, cantidad, precio_total, zona)
     VALUES (?, ?, ?, ?, ?)`,
    [tenderoId, productoId, cantidad, precioTotal, zona]
  );
  return rows.insertId;
};

export const obtenerPedidosPorTendero = async (tenderoId) => {
  const [rows] = await db.query(
    `SELECT p.id, pr.nombre AS producto, p.cantidad, p.precio_total, p.estado, p.fecha_pedido
     FROM pedidos p
     JOIN productos pr ON p.producto_id = pr.id
     WHERE p.tendero_id = ?`,
    [tenderoId]
  );
  return rows;
};

export const marcarPedidoRecibido = async (pedidoId) => {
  const [rows] = await db.query(
    `UPDATE pedidos SET estado = 'recibido' WHERE id = ?`,
    [pedidoId]
  );
  return rows.affectedRows > 0;
};
