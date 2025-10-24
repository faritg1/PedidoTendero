import express from 'express';
import { login, registro } from '../controllers/authController.js';

const router = express.Router();

// Login
router.post('/login', login);

// Registro
router.post('/registro', registro);

export default router;
