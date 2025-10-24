import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import plataformaRoutes from "./routes/plataforma.js";

// Cargar variables de entorno
dotenv.config();

// Verificar que las variables de entorno se cargaron
console.log('🔧 Configuración de Base de Datos:');
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT);

// Crea una instancia de la aplicación Express
const app = express();

// Define el puerto del servidor
const PORT = process.env.PORT || 3000;

// Habilita CORS para permitir peticiones desde otros dominios
app.use(cors());

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/plataforma", plataformaRoutes);

// Ruta de prueba (GET)
app.get("/api/mensaje", (req, res) => {
  res.json({ texto: "Hola desde el backend - Sistema de Pedidos Tenderos" });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Inicia el servidor y escucha en el puerto definido
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
});