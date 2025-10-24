-- Base de datos para Sistema de Pedidos para Tenderos
-- MySQL/XAMPP Compatible - VERSIÓN MEJORADA

-- =======================
-- TABLA DE USUARIOS
-- =======================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('tendero', 'plataforma', 'proveedor') NOT NULL,
    zona VARCHAR(50),
    contacto VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- =======================
-- TABLA DE PRODUCTOS
-- =======================
CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    unidad_medida VARCHAR(20) DEFAULT 'unidad',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- =======================
-- TABLA DE PEDIDOS INDIVIDUALES
-- =======================
CREATE TABLE pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tendero_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_total DECIMAL(10, 2) NOT NULL,
    zona VARCHAR(50) NOT NULL,
    estado ENUM('pendiente', 'consolidacion', 'asignacion', 'despacho', 'enviado', 'entregado', 'recibido') DEFAULT 'pendiente',
    proveedor_id INT,
    pedido_consolidado_id INT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite_entrega TIMESTAMP NULL, -- 72 horas desde consolidación
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY (tendero_id) REFERENCES usuarios(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (proveedor_id) REFERENCES usuarios(id),
    FOREIGN KEY (pedido_consolidado_id) REFERENCES pedidos_consolidados(id)
);

-- =======================
-- TABLA DE PEDIDOS CONSOLIDADOS
-- =======================
CREATE TABLE pedidos_consolidados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zona VARCHAR(50) NOT NULL,
    proveedor_id INT,
    estado ENUM('en_preparacion', 'enviado', 'entregado') DEFAULT 'en_preparacion',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_despacho TIMESTAMP NULL,
    fecha_entrega_estimada TIMESTAMP NULL, -- Máximo 72 horas
    total_productos INT DEFAULT 0,
    total_valor DECIMAL(10, 2) DEFAULT 0,
    observaciones TEXT,
    FOREIGN KEY (proveedor_id) REFERENCES usuarios(id)
);

-- =======================
-- TABLA DE DETALLE CONSOLIDADO (Para reportes)
-- =======================
CREATE TABLE detalle_consolidado (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_consolidado_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad_total INT NOT NULL,
    precio_total DECIMAL(10, 2) NOT NULL,
    num_tiendas INT NOT NULL, -- Cuántas tiendas pidieron este producto
    FOREIGN KEY (pedido_consolidado_id) REFERENCES pedidos_consolidados(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- =======================
-- TABLA DE HISTORIAL (Auditoría)
-- =======================
CREATE TABLE historial_pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    usuario_id INT, -- Quién hizo el cambio
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =======================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =======================
CREATE INDEX idx_pedidos_tendero ON pedidos(tendero_id);
CREATE INDEX idx_pedidos_zona ON pedidos(zona);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_proveedor ON pedidos(proveedor_id);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_consolidado_zona ON pedidos_consolidados(zona);
CREATE INDEX idx_consolidado_proveedor ON pedidos_consolidados(proveedor_id);

-- =======================
-- DATOS INICIALES
-- =======================

-- Usuario de Plataforma (admin)
INSERT INTO usuarios (nombre, email, password, tipo_usuario, zona, contacto) VALUES
('Administrador Plataforma', 'admin@plataforma.com', '$2a$10$xQxY9Z8K9Z8K9Z8K9Z8K9e', 'plataforma', 'Central', '3001234567');

-- Proveedores
INSERT INTO usuarios (nombre, email, password, tipo_usuario, zona, contacto) VALUES
('Distribuidora Norte S.A.S', 'proveedor1@email.com', '$2a$10$xQxY9Z8K9Z8K9Z8K9Z8K9e', 'proveedor', 'Norte', '3101234567'),
('Abastecedora Sur Ltda', 'proveedor2@email.com', '$2a$10$xQxY9Z8K9Z8K9Z8K9Z8K9e', 'proveedor', 'Sur', '3201234567'),
('Proveedor Centro', 'proveedor3@email.com', '$2a$10$xQxY9Z8K9Z8K9Z8K9Z8K9e', 'proveedor', 'Centro', '3301234567');

-- Tenderos
INSERT INTO usuarios (nombre, email, password, tipo_usuario, zona, contacto) VALUES
('Tienda Don José', 'tienda1@email.com', '$2a$10$xQxY9Z8K9Z8K9Z8K9Z8K9e', 'tendero', 'Norte', '3001111111'),
('Tienda La Económica', 'tienda2@email.com', '$2a$10$xQxY9Z8K9Z8K9Z8K9Z8K9e', 'tendero', 'Norte', '3002222222'),
('Tienda El Ahorro', 'tienda3@email.com', '$2a$10$xQxY9Z8K9Z8K9Z8K9Z8K9e', 'tendero', 'Sur', '3003333333'),
('Tienda Mi Barrio', 'tienda4@email.com', '$2a$10$xQxY9Z8K9Z8K9Z8K9Z8K9e', 'tendero', 'Sur', '3004444444');

-- Productos iniciales
INSERT INTO productos (nombre, descripcion, precio_unitario, unidad_medida) VALUES
('Arroz Diana x 500g', 'Arroz de primera calidad', 2500.00, 'bolsa'),
('Aceite Gourmet x 1L', 'Aceite vegetal', 8500.00, 'botella'),
('Azúcar Riopaila x 1kg', 'Azúcar refinada', 3200.00, 'bolsa'),
('Sal Marina x 500g', 'Sal de cocina', 1500.00, 'bolsa'),
('Frijol Rojo x 500g', 'Frijol cargamanto', 4000.00, 'bolsa'),
('Panela x 500g', 'Panela tradicional', 2800.00, 'unidad'),
('Café x 250g', 'Café molido', 7500.00, 'paquete'),
('Chocolate x 500g', 'Chocolate de mesa', 5500.00, 'tableta'),
('Pasta x 500g', 'Pasta espagueti', 3500.00, 'paquete'),
('Atún Van Camps', 'Atún en aceite', 4200.00, 'lata');

-- =======================
-- VISTAS ÚTILES
-- =======================

-- Vista: Pedidos activos por tendero
CREATE VIEW vista_pedidos_activos AS
SELECT 
    p.id,
    p.tendero_id,
    u.nombre as tendero,
    u.zona,
    p.estado,
    COUNT(*) as num_pedidos_activos
FROM pedidos p
JOIN usuarios u ON p.tendero_id = u.id
WHERE p.estado NOT IN ('entregado', 'recibido')
GROUP BY p.tendero_id, u.nombre, u.zona, p.estado, p.id;

-- Vista: Resumen de ventas por proveedor
CREATE VIEW vista_ventas_proveedor AS
SELECT 
    p.proveedor_id,
    u.nombre as proveedor,
    p.tendero_id,
    t.nombre as tendero,
    COUNT(*) as total_pedidos,
    SUM(p.precio_total) as total_vendido,
    SUM(p.cantidad) as total_productos
FROM pedidos p
JOIN usuarios u ON p.proveedor_id = u.id
JOIN usuarios t ON p.tendero_id = t.id
WHERE p.estado IN ('entregado', 'recibido')
GROUP BY p.proveedor_id, u.nombre, p.tendero_id, t.nombre;

-- =======================
-- NOTA IMPORTANTE
-- =======================
-- Password de prueba para TODOS los usuarios: "password123"
-- En producción, hashear con bcrypt antes de insertar
-- 
-- CONSULTAS ÚTILES:
-- 
-- 1. Ver proveedores que más le venden a un tendero:
-- SELECT * FROM vista_ventas_proveedor WHERE tendero_id = 1 ORDER BY total_vendido DESC;
--
-- 2. Verificar si un tendero tiene pedidos activos:
-- SELECT * FROM vista_pedidos_activos WHERE tendero_id = 1;
--
-- 3. Pedidos por consolidar en una zona:
-- SELECT * FROM pedidos WHERE zona = 'Norte' AND estado = 'pendiente';