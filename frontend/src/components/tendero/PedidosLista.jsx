import React, { useEffect, useState } from "react";
import { obtenerPedidos, marcarRecibido } from "../../services/tenderoService";

const PedidosLista = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    obtenerPedidos().then((data) => setPedidos(data || []));
  }, []);

  const handleRecibir = async (id) => {
    await marcarRecibido(id);
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, recibido: true } : p))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-10 text-slate-200">
      <h2 className="text-3xl font-bold text-center text-indigo-400 mb-8">
        📦 Pedidos Registrados
      </h2>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {pedidos.length === 0 ? (
          <p className="text-center text-slate-400">
            No hay pedidos registrados aún.
          </p>
        ) : (
          pedidos.map((p) => (
            <div
              key={p.id}
              className="p-5 bg-slate-800/70 border border-slate-700 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
              <h3 className="text-lg font-semibold text-indigo-300">
                {p.producto}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Cantidad: <span className="text-slate-200">{p.cantidad}</span>
              </p>
              <p className="text-sm text-slate-400">
                Tendero: <span className="text-slate-200">{p.tendero}</span>
              </p>

              <div className="mt-4">
                {p.recibido ? (
                  <span className="text-green-400 font-medium">✅ Recibido</span>
                ) : (
                  <button
                    onClick={() => handleRecibir(p.id)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-500 transition-all duration-300 hover:scale-105"
                  >
                    Marcar como recibido
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PedidosLista;
