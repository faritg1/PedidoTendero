-- Script para actualizar las contraseñas de los usuarios con el hash correcto
-- Ejecutar esto en phpMyAdmin o tu cliente MySQL

USE pedido;

-- Actualizar TODOS los usuarios con el hash correcto de "password123"
UPDATE usuarios SET password = '$2b$10$rsfQJZnyZ8jjuLgRjpm0o.ddZ9gi2UAeqvRJ7r6V7wRu1iLKPQFLm';

-- Verificar que se actualizaron correctamente
SELECT id, nombre, email, tipo_usuario, zona FROM usuarios;
