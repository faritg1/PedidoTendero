# 📦 Implementación del Módulo TENDERO

## 🎯 Resumen de Funcionalidades

El módulo del **TENDERO** permite a los dueños de tiendas:

1. ✅ Ver catálogo de productos disponibles
2. ✅ Crear pedidos de productos (con restricción de 1 pedido activo)
3. ✅ Ver estado de sus pedidos en tiempo real
4. ✅ Marcar pedidos como recibidos
5. ✅ Ver estadísticas de compras
6. ✅ Ver historial de pedidos completados

---

## 🏗️ Arquitectura Implementada

### Backend (Node.js + Express)

#### 📁 Estructura de Archivos
```
BackEnd/
├── controllers/
│   └── tenderoController.js    ✅ Nuevo
├── routes/
│   └── tendero.js              ✅ Nuevo
└── server.js                   ✅ Actualizado
```

#### 🔧 Controlador: `tenderoController.js`

**Funciones implementadas:**

1. **`obtenerProductos()`**
   - Devuelve todos los productos activos del catálogo
   - No requiere parámetros adicionales

2. **`verificarPedidosActivos()`**
   - Valida si el tendero tiene pedidos activos (no entregados/recibidos)
   - Evita crear nuevos pedidos si tiene uno en curso

3. **`crearPedido()`**
   - Crea un nuevo pedido
   - **Validaciones:**
     - Solo si NO tiene pedidos activos
     - Cantidad debe ser > 0
     - Producto debe existir y estar activo
   - Calcula automáticamente `precio_total`
   - Estado inicial: `'pendiente'`

4. **`obtenerMisPedidos()`**
   - Lista todos los pedidos del tendero
   - Separa en:
     - `pedidos_activos`: No entregados/recibidos
     - `historial`: Entregados o recibidos

5. **`marcarComoRecibido()`**
   - Cambia estado de `'entregado'` → `'recibido'`
   - Solo si el pedido es del tendero autenticado
   - Registra cambio en tabla `historial_pedidos`

6. **`obtenerEstadisticas()`**
   - Total de pedidos realizados
   - Pedidos por estado
   - Total invertido (suma de pedidos completados)
   - Productos más pedidos (top 5)

#### 🛣️ Rutas: `/api/tendero/*`

| Método | Ruta | Función | Descripción |
|--------|------|---------|-------------|
| GET | `/productos` | `obtenerProductos` | Catálogo de productos |
| GET | `/verificar-pedidos-activos` | `verificarPedidosActivos` | Valida si puede pedir |
| POST | `/pedidos` | `crearPedido` | Crear nuevo pedido |
| GET | `/pedidos` | `obtenerMisPedidos` | Ver mis pedidos |
| PUT | `/pedidos/:pedido_id/recibido` | `marcarComoRecibido` | Confirmar recepción |
| GET | `/estadisticas` | `obtenerEstadisticas` | Ver estadísticas |

**Middleware aplicado:**
- ✅ `verificarToken`: Valida JWT
- ✅ `verificarTendero`: Solo usuarios tipo "tendero"

---

### Frontend (React)

#### 📁 Componentes Creados

```
frontend/src/
├── components/
│   ├── DashboardTendero.jsx        ✅ Nuevo
│   ├── DashboardTendero.css        ✅ Nuevo
│   ├── CrearPedidoTendero.jsx      ✅ Nuevo
│   └── CrearPedido.css             ✅ Nuevo
├── services/
│   └── api.js                      ✅ Actualizado
└── App.jsx                         ✅ Actualizado
```

#### 🎨 Componente: `DashboardTendero.jsx`

**Características:**

1. **Header con información del tendero**
   - Nombre de la tienda
   - Zona asignada
   - Botón de cerrar sesión

2. **Tarjetas de estadísticas** (Grid responsive)
   - Total de pedidos
   - Total invertido
   - Pedidos activos
   - Pedidos completados

3. **Botón "Crear Pedido"**
   - Solo visible si NO tiene pedidos activos
   - Muestra alerta si ya tiene pedido en curso

4. **Sección: Pedidos Activos**
   - Lista de pedidos no completados
   - Muestra:
     - Producto y cantidad
     - Precio total
     - Estado actual (badge colorido)
     - Proveedor asignado
     - Fecha límite de entrega
   - **Botón "Marcar como Recibido"** (solo si estado = 'entregado')

5. **Sección: Historial**
   - Pedidos completados (entregados/recibidos)
   - Diseño minimalista (color gris)

6. **Sección: Productos Más Pedidos** (Top 5)
   - Ranking de productos favoritos del tendero
   - Muestra cantidad total pedida

#### 🛒 Componente: `CrearPedidoTendero.jsx`

**Funcionalidad:**

1. **Selector de producto**
   - Dropdown con todos los productos activos
   - Muestra precio y unidad de medida

2. **Detalle del producto seleccionado**
   - Card con gradiente morado
   - Nombre, descripción, precio, unidad

3. **Input de cantidad**
   - Tipo numérico
   - Mínimo: 1

4. **Cálculo automático del total**
   - Cantidad × precio_unitario
   - Formato de moneda colombiana (COP)

5. **Alertas informativas**
   - ℹ️ Restricción de 1 pedido activo
   - ⏰ Tiempo máximo de entrega (72 horas)

6. **Botones de acción**
   - ❌ Cancelar (vuelve al dashboard)
   - ✅ Crear Pedido (envía formulario)

#### 🎨 Estilos CSS

**Características del diseño:**

- 🎨 Gradiente morado (`#667eea` → `#764ba2`)
- 📱 **Responsive** (mobile-first)
- 🎭 Animaciones suaves (hover, transform)
- 🎯 Badges coloridos por estado:
  - 🟡 Pendiente: `#ffc107`
  - 🔵 Consolidación: `#17a2b8`
  - ⚫ Asignación: `#6c757d`
  - 🔵 Despacho: `#007bff`
  - 🟢 Enviado: `#28a745`
  - 🟢 Entregado: `#28a745`
  - ⚫ Recibido: `#6c757d`
- 📊 Cards con sombras y efectos hover
- 💰 Formato de moneda colombiana (COP)

---

## 🔄 Flujo Completo del Tendero

```
1. TENDERO inicia sesión
   ↓
2. Ve su Dashboard con estadísticas
   ↓
3. Si NO tiene pedidos activos:
   ├─> Puede hacer clic en "Crear Nuevo Pedido"
   ├─> Selecciona producto del catálogo
   ├─> Ingresa cantidad
   ├─> Ve el total calculado automáticamente
   ├─> Confirma el pedido
   └─> Vuelve al dashboard
   ↓
4. El pedido aparece en "Pedidos Activos" con estado "Pendiente"
   ↓
5. La PLATAFORMA consolida el pedido → Estado cambia a "Consolidación"
   ↓
6. La PLATAFORMA asigna proveedor → Estado cambia a "Asignación"
   ↓
7. La PLATAFORMA despacha → Estado cambia a "Despacho"
   ↓
8. El PROVEEDOR marca como enviado → Estado cambia a "Enviado"
   ↓
9. El PROVEEDOR marca como entregado → Estado cambia a "Entregado"
   ├─> El TENDERO ve el botón "Marcar como Recibido"
   └─> Hace clic para confirmar la recepción
   ↓
10. Estado cambia a "Recibido"
    ↓
11. El pedido pasa al "Historial"
    ↓
12. Ahora puede crear un nuevo pedido (se desbloquea el botón)
```

---

## 🔐 Seguridad Implementada

### Backend
- ✅ **JWT Token**: Todas las rutas requieren autenticación
- ✅ **Verificación de rol**: Middleware `verificarTendero`
- ✅ **Validación de pertenencia**: Solo puede ver/modificar sus propios pedidos
- ✅ **Transacciones SQL**: Operaciones críticas usan `beginTransaction`
- ✅ **Validaciones de negocio**: 
  - No crear pedido si tiene uno activo
  - Solo marcar como recibido si estado = 'entregado'
  - Producto debe estar activo

### Frontend
- ✅ **Token almacenado**: `localStorage` con Bearer Token
- ✅ **Headers automáticos**: Función `getHeaders()` incluye token
- ✅ **Manejo de errores**: Try-catch en todas las peticiones
- ✅ **Validación de formularios**: Required, min, type="number"

---

## 📊 Datos de Prueba (SQL)

```sql
-- Tenderos de prueba en el archivo sql.sql:

-- Zona Norte:
Email: tienda1@email.com
Email: tienda2@email.com
Password: password123

-- Zona Sur:
Email: tienda3@email.com
Email: tienda4@email.com
Password: password123
```

---

## 🧪 Pruebas del Sistema

### 1. Crear Pedido Exitoso
```bash
POST /api/tendero/pedidos
Authorization: Bearer <token>
Body: {
  "producto_id": 1,
  "cantidad": 5
}

Respuesta esperada:
{
  "mensaje": "Pedido creado exitosamente",
  "pedido": {
    "id": 1,
    "producto_id": 1,
    "cantidad": 5,
    "precio_total": 12500.00,
    "zona": "Norte",
    "estado": "pendiente"
  }
}
```

### 2. Intentar Crear Segundo Pedido (debe fallar)
```bash
POST /api/tendero/pedidos
Body: { "producto_id": 2, "cantidad": 3 }

Respuesta esperada:
{
  "error": "Ya tienes un pedido activo. Debes esperar a que se entregue para hacer otro."
}
```

### 3. Ver Mis Pedidos
```bash
GET /api/tendero/pedidos
Authorization: Bearer <token>

Respuesta esperada:
{
  "pedidos_activos": [...],
  "historial": [...],
  "total": 5
}
```

### 4. Marcar Como Recibido
```bash
PUT /api/tendero/pedidos/1/recibido
Authorization: Bearer <token>

Respuesta esperada:
{
  "mensaje": "Pedido marcado como recibido"
}
```

---

## 🚀 Siguiente Paso

Ahora que el módulo del **TENDERO** está completo, el siguiente paso sería implementar el módulo del **PROVEEDOR** con funcionalidades para:

1. Ver pedidos consolidados asignados
2. Actualizar estado de envíos
3. Ver pedidos por zona
4. Marcar como enviado/entregado
5. Estadísticas de ventas

---

## ✅ Checklist de Implementación

- [x] Backend: Controller del tendero
- [x] Backend: Rutas del tendero
- [x] Backend: Middleware de autenticación
- [x] Backend: Registro en server.js
- [x] Frontend: Componente DashboardTendero
- [x] Frontend: Componente CrearPedidoTendero
- [x] Frontend: Estilos CSS
- [x] Frontend: Servicios API actualizados
- [x] Frontend: Integración en App.jsx
- [x] Validaciones de negocio
- [x] Manejo de errores
- [x] Formato de moneda
- [x] Responsive design
- [x] Documentación

---

## 📝 Notas Importantes

1. **Un tendero solo puede tener 1 pedido activo** → Validado en backend y frontend
2. **72 horas máximo de entrega** → Fecha calculada al consolidar (plataforma)
3. **Estados secuenciales** → No se puede saltar estados
4. **Zona obligatoria** → Se toma del usuario autenticado
5. **Precio calculado automáticamente** → precio_unitario × cantidad

---

¡El módulo del TENDERO está 100% funcional! 🎉
