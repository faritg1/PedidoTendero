import { useEffect, useState } from "react";
import { listarPedidos, marcarRecibido } from "./tenderoService";

export default function PedidosList({ tenderoId }) {
  const [pedidos, setPedidos] = useState([]);

  const cargarPedidos = async () => {
    const res = await listarPedidos(tenderoId);
    setPedidos(res.pedidos || []);
  };

  useEffect(() => {
    if(tenderoId) cargarPedidos();
  }, [tenderoId]);

  const handleRecibido = async (pedidoId) => {
    const res = await marcarRecibido(pedidoId);
    alert(res.mensaje);
    cargarPedidos();
  };

  return (
    <div>
      <h2>Mis Pedidos</h2>
      <ul>
        {pedidos.map(p => (
          <li key={p.id}>
            {p.productoNombre} - Cantidad: {p.cantidad} - Estado: {p.estado}
            {p.estado !== "Recibido" && <button onClick={() => handleRecibido(p.id)}>Marcar como recibido</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
