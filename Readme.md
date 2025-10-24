# 📋 Documentación Funcional - Base de Datos Sistema de Pedidos

## 🎯 Objetivo General
Gestionar un sistema de pedidos donde múltiples tenderos hacen pedidos individuales, la plataforma los consolida por zona y los proveedores los despachan.

---

## 📊 Estructura de Tablas

### 1️⃣ **Tabla: `usuarios`**
**Propósito**: Almacenar TODOS los tipos de usuarios del sistema en una sola tabla.

**Campos principales**:
- `id`: Identificador único
- `email` y `password`: Credenciales de acceso
- `tipo_usuario`: Determina el rol (tendero, plataforma, proveedor)
- `zona`: Ubicación geográfica (Norte, Sur, Centro, etc.)

**¿Cómo funciona?**
- Un único login valida email/password y según `tipo_usuario` redirecciona a su dashboard correspondiente
- Los tenderos y proveedores tienen zona asignada para agrupar pedidos

---

### 2️⃣ **Tabla: `productos`**
**Propósito**: Catálogo de productos disponibles para pedir.

**Campos principales**:
- `nombre`: Nombre del producto (ej: "Arroz Diana x 500g")
- `precio_unitario`: Precio base del producto
- `activo`: Si está disponible o descontinuado

**¿Cómo funciona?**
- Solo la PLATAFORMA puede crear productos
- Los TENDEROS solo seleccionan de esta lista (no crean nuevos)
- Se usa para calcular `precio_total` en pedidos

---

### 3️⃣ **Tabla: `pedidos`**
**Propósito**: Pedidos INDIVIDUALES de cada tendero.

**Campos principales**:
- `tendero_id`: Quién hace el pedido
- `producto_id`: Qué producto pidió
- `cantidad`: Cuántas unidades
- `precio_total`: cantidad × precio_unitario
- `estado`: Ciclo de vida del pedido
- `proveedor_id`: Quién lo despachará
- `pedido_consolidado_id`: A qué consolidado pertenece
- `fecha_limite_entrega`: 72 horas desde que se consolida

**Estados del pedido** (flujo):
```
pendiente → consolidacion → asignacion → despacho → enviado → entregado → recibido
```

**¿Cómo funciona el flujo?**

1. **TENDERO crea pedido**: `estado = 'pendiente'`
2. **PLATAFORMA consolida**: Cambia a `consolidacion` (agrupa por zona)
3. **PLATAFORMA asigna proveedor**: Cambia a `asignacion`, asigna `proveedor_id`
4. **PLATAFORMA envía a proveedor**: Cambia a `despacho`, crea `pedido_consolidado_id`
5. **PROVEEDOR prepara**: Cambia a `enviado`
6. **PROVEEDOR entrega**: Cambia a `entregado`
7. **TENDERO confirma**: Cambia a `recibido`

---

### 4️⃣ **Tabla: `pedidos_consolidados`**
**Propósito**: Agrupar múltiples pedidos de una ZONA para enviar al proveedor.

**Campos principales**:
- `zona`: Zona geográfica (Norte, Sur, etc.)
- `proveedor_id`: Quién despachará este consolidado
- `estado`: en_preparacion → enviado → entregado
- `fecha_entrega_estimada`: Máximo 72 horas

**¿Cómo funciona?**
- La PLATAFORMA crea un consolidado para una zona
- Asigna todos los pedidos de esa zona al mismo `pedido_consolidado_id`
- El PROVEEDOR ve este consolidado con todos los pedidos incluidos

**Ejemplo práctico**:
```
Consolidado #1 (Zona Norte)
├── Pedido #5: Tienda Don José - 10 bolsas arroz
├── Pedido #7: Tienda La Económica - 5 botellas aceite
└── Pedido #9: Tienda Don José - 8 bolsas azúcar
```

---

### 5️⃣ **Tabla: `detalle_consolidado`**
**Propósito**: Resumen de productos en cada consolidado (para el proveedor).

**Campos principales**:
- `pedido_consolidado_id`: A qué consolidado pertenece
- `producto_id`: Qué producto
- `cantidad_total`: Suma de todas las cantidades
- `num_tiendas`: Cuántas tiendas pidieron este producto

**¿Cómo funciona?**
- Se llena automáticamente al crear un consolidado
- Agrupa productos iguales sumando cantidades

**Ejemplo**:
```
Consolidado #1 - Detalle:
- Arroz: 25 bolsas (3 tiendas)
- Aceite: 15 botellas (2 tiendas)
```

---

### 6️⃣ **Tabla: `historial_pedidos`**
**Propósito**: Auditoría de cambios de estado.

**¿Cómo funciona?**
- Cada vez que cambia el estado de un pedido, se registra aquí
- Permite rastrear quién y cuándo cambió cada estado

---

### 7️⃣ **Vistas**

#### `vista_pedidos_activos`
- Muestra cuántos pedidos activos tiene cada tendero
- **Uso**: Validar que un tendero solo tenga 1 pedido activo

#### `vista_ventas_proveedor`
- Muestra cuánto ha vendido cada proveedor a cada tendero
- **Uso**: Reportes de desempeño y estadísticas

---

## 🔄 Flujo Completo del Sistema
```
1. TENDERO hace login
   ↓
2. TENDERO crea pedido (producto + cantidad)
   → Se guarda en tabla `pedidos` con estado='pendiente'
   ↓
3. PLATAFORMA ve todos los pedidos pendientes
   ↓
4. PLATAFORMA consolida pedidos de una zona
   → Cambia estado a 'consolidacion'
   → Calcula fecha_limite_entrega (+ 72 horas)
   ↓
5. PLATAFORMA asigna proveedor
   → Cambia estado a 'asignacion'
   → Asigna proveedor_id
   ↓
6. PLATAFORMA crea consolidado y lo despacha
   → Crea registro en `pedidos_consolidados`
   → Crea registros en `detalle_consolidado`
   → Cambia pedidos a estado='despacho'
   → Asigna pedido_consolidado_id a los pedidos
   ↓
7. PROVEEDOR recibe notificación
   ↓
8. PROVEEDOR actualiza estado a 'enviado'
   ↓
9. PROVEEDOR marca como 'entregado'
   ↓
10. TENDERO marca como 'recibido'
```

---

## 🛠️ Implementación en Express

### **Paso 1: Instalar dependencias**
```bash
npm install express mysql2 bcrypt jsonwebtoken dotenv cors
```

### **Paso 2: Crear archivo `.env`**
```env
DB_HOST=tu-host-clever-cloud.mysql.com
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=nombre_base_datos
DB_PORT=3306
JWT_SECRET=tu_clave_secreta_super_segura
PORT=5000
```

### **Paso 3: Estructura de carpetas**
```
backend/
├── config/
│   └── database.js          # Conexión a MySQL
├── models/
│   ├── Usuario.js           # Modelo de usuarios
│   ├── Producto.js          # Modelo de productos
│   ├── Pedido.js            # Modelo de pedidos
│   └── PedidoConsolidado.js # Modelo de consolidados
├── controllers/
│   ├── authController.js    # Login/Register
│   ├── tenderoController.js # Funciones del tendero
│   ├── plataformaController.js # Funciones de plataforma
│   └── proveedorController.js  # Funciones del proveedor
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── tendero.js           # Rutas del tendero
│   ├── plataforma.js        # Rutas de plataforma
│   └── proveedor.js         # Rutas del proveedor
├── middleware/
│   └── auth.js              # Verificar JWT
├── .env
├── server.js                # Archivo principal
└── package.json
```

### **Paso 4: Configurar conexión a BD** (`config/database.js`)
```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

### **Paso 5: Crear servidor** (`server.js`)
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tendero', require('./routes/tendero'));
app.use('/api/plataforma', require('./routes/plataforma'));
app.use('/api/proveedor', require('./routes/proveedor'));

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

---

## 🔐 Sistema de Login (JWT)

### **¿Cómo funciona?**

1. Usuario envía `email` y `password`
2. Backend busca en tabla `usuarios`
3. Compara password con bcrypt
4. Si es correcto, genera un JWT que incluye:
   - `id` del usuario
   - `tipo_usuario` (tendero/plataforma/proveedor)
   - `zona`
5. El frontend guarda el JWT y lo envía en cada petición

### **Ejemplo de JWT payload**:
```json
{
  "id": 4,
  "email": "tienda1@email.com",
  "tipo_usuario": "tendero",
  "zona": "Norte"
}
```

---

## 📝 Consultas SQL Útiles

### **1. Validar si un tendero puede hacer un nuevo pedido**
```sql
SELECT COUNT(*) as pedidos_activos 
FROM pedidos 
WHERE tendero_id = ? 
AND estado NOT IN ('entregado', 'recibido');
```
Si retorna > 0, NO puede hacer otro pedido.

### **2. Obtener pedidos pendientes de una zona**
```sql
SELECT p.*, pr.nombre as producto, u.nombre as tendero
FROM pedidos p
JOIN productos pr ON p.producto_id = pr.id
JOIN usuarios u ON p.tendero_id = u.id
WHERE p.zona = ? AND p.estado = 'pendiente';
```

### **3. Ver detalle de un consolidado**
```sql
SELECT dc.*, pr.nombre as producto
FROM detalle_consolidado dc
JOIN productos pr ON dc.producto_id = pr.id
WHERE dc.pedido_consolidado_id = ?;
```

### **4. Estadísticas de proveedor**
```sql
SELECT * FROM vista_ventas_proveedor 
WHERE proveedor_id = ? 
ORDER BY total_vendido DESC;
```

---

## ✅ Checklist de Implementación

- [ ] Crear base de datos en Clever Cloud
- [ ] Ejecutar script SQL completo
- [ ] Configurar archivo `.env`
- [ ] Crear estructura de carpetas del backend
- [ ] Implementar conexión a BD
- [ ] Crear modelos (Usuario, Producto, Pedido)
- [ ] Implementar login con JWT
- [ ] Crear rutas para cada tipo de usuario
- [ ] Probar endpoints con Postman
- [ ] Conectar con frontend React

---

## 🚨 Reglas de Negocio Importantes

1. **Un tendero solo puede tener 1 pedido activo** → Validar en backend antes de crear
2. **72 horas máximo** → Calcular `fecha_limite_entrega` al consolidar
3. **Solo la plataforma crea productos** → Validar rol en endpoint
4. **Estados secuenciales** → No se puede saltar de pendiente a entregado
5. **Zona obligatoria** → Todo pedido debe tener zona para consolidar

---

## 🎓 Para Entender Mejor

**Piensa en esto como un sistema de delivery grupal:**
- Los tenderos son como personas pidiendo comida
- La plataforma es como Rappi/Uber Eats agrupando pedidos
- Los proveedores son los restaurantes que preparan
- El consolidado es cuando agrupan pedidos cercanos en un solo domicilio