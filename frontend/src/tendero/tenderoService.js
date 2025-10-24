const API_URL = "/api";

export async function registrarTendero(tendero) {
  const res = await fetch(`${API_URL}/tenderos/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tendero),
  });
  return res.json();
}

export async function crearPedido(pedido) {
  const res = await fetch(`${API_URL}/pedidos/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });
  return res.json();
}

export async function listarPedidos(tenderoId) {
  const res = await fetch(`${API_URL}/pedidos/${tenderoId}`);
  return res.json();
}

export async function marcarRecibido(pedidoId) {
  const res = await fetch(`${API_URL}/pedidos/recibido/${pedidoId}`, {
    method: "PUT",
  });
  return res.json();
}
