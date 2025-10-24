import React, { useState } from "react";
import TenderoRegistro from "./components/tendero/TenderoRegistro";
import PedidoForm from "./components/tendero/PedidoForm";
import PedidosLista from "./components/tendero/PedidosLista";

function App() {
  const [vista, setVista] = useState("registro");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra superior */}
      <header className="bg-indigo-600 text-white py-4 shadow-md">
        <h1 className="text-center text-2xl font-bold">Panel del Tendero</h1>
      </header>

      {/* Botones de navegación */}
      <nav className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setVista("registro")}
          className={`px-4 py-2 rounded-lg font-medium ${
            vista === "registro"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          }`}
        >
          Registro
        </button>
        <button
          onClick={() => setVista("pedido")}
          className={`px-4 py-2 rounded-lg font-medium ${
            vista === "pedido"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          }`}
        >
          Hacer Pedido
        </button>
        <button
          onClick={() => setVista("lista")}
          className={`px-4 py-2 rounded-lg font-medium ${
            vista === "lista"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          }`}
        >
          Mis Pedidos
        </button>
      </nav>

      {/* Contenido dinámico */}
      <main className="p-6">
        {vista === "registro" && <TenderoRegistro />}
        {vista === "pedido" && <PedidoForm />}
        {vista === "lista" && <PedidosLista />}
      </main>
    </div>
  );
}

export default App;
