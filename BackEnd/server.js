import express from "express";
import cors from "cors";

// Crea una instancia de la aplicación Express
const app = express();

// Define el puerto del servidor
const PORT = 3000;

// Habilita CORS para permitir peticiones desde otros dominios
app.use(cors());

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Ruta de prueba (GET)
app.get("/api/mensaje", (req, res) => {
  // Envía una respuesta JSON
  res.json({ texto: "Hola desde el backend " });
});

// Inicia el servidor y escucha en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});