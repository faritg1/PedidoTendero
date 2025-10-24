import React, { useState, useEffect } from "react";
import { crearPedido, obtenerProductos } from "../../services/tenderoService";

const PedidoForm = () => {
  const [productos, setProductos] = useState([]);
  const [pedido, setPedido] = useState({ tenderoId: "", productoId: "", cantidad: 1 });
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    obtenerProductos().then((data) => setProductos(data || []));
  }, []);

  const handleChange = (e) => setPedido({ ...pedido, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await crearPedido(pedido);
    setMensaje(res?.ok ? "✅ Pedido creado con éxito" : "❌ Error al crear el pedido");
  };

  return (
    <div className="flex justify-center items-center py-10 bg-slate-900 min-h-screen">
      <div className="bg-slate-800/80 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-400 mb-6">
          🧾 Crear Pedido
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="tenderoId"
            placeholder="ID del tendero"
            value={pedido.tenderoId}
            onChange={handleChange}
            className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <select
            name="productoId"
            value={pedido.productoId}
            onChange={handleChange}
            className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Seleccionar producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="cantidad"
            placeholder="Cantidad"
            min="1"
            value={pedido.cantidad}
            onChange={handleChange}
            className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 font-semibold transition-all duration-300 hover:scale-[1.02]"
          >
            Crear Pedido
          </button>
        </form>

        {mensaje && (
          <p
            className={`mt-5 text-center text-sm ${
              mensaje.includes("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
};

export default PedidoForm;
