import { useState, useEffect } from "react";
import { crearPedido } from "./tenderoService";

export default function PedidoForm({ tenderoId, productos, onPedidoCreado }) {
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!productoId) return alert("Selecciona un producto");
    const res = await crearPedido({ tenderoId, productoId, cantidad });
    alert(res.mensaje);
    onPedidoCreado();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear Pedido</h2>
      <select value={productoId} onChange={e => setProductoId(e.target.value)} required>
        <option value="">Seleccione un producto</option>
        {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </select>
      <input type="number" value={cantidad} min="1" onChange={e => setCantidad(e.target.value)} required/>
      <button type="submit">Enviar Pedido</button>
    </form>
  );
}
