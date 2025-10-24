import express from "express";
import { obtenerTenderos } from "../controllers/tenderoController.js";

const router = express.Router();
router.get("/", obtenerTenderos);
export default router;
