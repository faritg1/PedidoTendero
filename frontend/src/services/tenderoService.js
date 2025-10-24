// src/services/tenderoService.js
const API_URL = "http://localhost:3000/api"; // Cambia el puerto si tu backend usa otro

// 🔹 Registrar un nuevo tendero
export const registrarTendero = async (tendero) => {
  try {
    const res = await fetch(`${API_URL}/tendero`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tendero),
    });
    return res;
  } catch (error) {
    console.error("Error al registrar tendero:", error);
    return null;
  }
};

// 🔹 Crear un pedido
export const crearPedido = async (pedido) => {
  try {
    const res = await fetch(`${API_URL}/pedido`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    });
    return res;
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return null;
  }
};

// 🔹 Obtener todos los productos
export const obtenerProductos = async () => {
  try {
    const res = await fetch(`${API_URL}/productos`);
    if (!res.ok) throw new Error("Error al obtener productos");
    return await res.json();
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
};

// 🔹 Obtener todos los pedidos
export const obtenerPedidos = async () => {
  try {
    const res = await fetch(`${API_URL}/pedidos`);
    if (!res.ok) throw new Error("Error al obtener pedidos");
    return await res.json();
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return [];
  }
};

// 🔹 Marcar pedido como recibido
export const marcarRecibido = async (id) => {
  try {
    const res = await fetch(`${API_URL}/pedidos/${id}/recibido`, {
      method: "PUT",
    });
    return res.ok;
  } catch (error) {
    console.error("Error al marcar pedido como recibido:", error);
    return false;
  }
};
