import { useEffect, useState } from "react";

// Componente principal de la aplicación
function App() {
  // Estado para guardar el mensaje que viene del backend
  const [mensaje, setMensaje] = useState("");

  // Hook que se ejecuta una sola vez al cargar el componente
  useEffect(() => {
    // Hace una petición GET al backend
    fetch("/api/mensaje")
      // Convierte la respuesta a JSON
      .then((res) => res.json())
      // Guarda el texto de la respuesta en el estado 'mensaje'
      .then((data) => setMensaje(data.texto));
  // El array vacío asegura que se ejecute solo al montar el componente
  }, []);

  // Renderiza el contenido en pantalla
  return (
    <div>
      <h1>Frontend conectado</h1>
      {/* Muestra el mensaje recibido del backend */}
      <p>{mensaje}</p>
    </div>
  );
}

export default App;