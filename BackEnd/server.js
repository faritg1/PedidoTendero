import express from "express";
import cors from "cors";
import tenderoRoutes from "./routes/tenderoRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/tendero", tenderoRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Servidor backend en http://localhost:${PORT}`));
