import { useState, useEffect } from "react";
import TenderoRegistro from "./tendero/TenderoRegistro";
import PedidoForm from "./tendero/PedidoForm";
import PedidosList from "./tendero/PedidosList";

function App() {
  const [tenderoId, setTenderoId] = useState(null);
  const [productos, setProductos] = useState([]);

  // Aquí podrías cargar los productos desde el backend
  useEffect(() => {
    fetch("/api/productos")
      .then(res => res.json())
      .then(data => setProductos(data.productos));
  }, []);

  return (
    <div>
      <h1>Plataforma de Pedidos - Tendero</h1>
      {!tenderoId && <TenderoRegistro onRegister={setTenderoId} />}
      {tenderoId && (
        <>
          <PedidoForm tenderoId={tenderoId} productos={productos} onPedidoCreado={() => {}}/>
          <PedidosList tenderoId={tenderoId} />
        </>
      )}
    </div>
  );
}

export default App;
