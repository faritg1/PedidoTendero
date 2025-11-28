# 🚀 GUÍA RÁPIDA DE INICIO - Sistema de Pedidos Tenderos

## ✅ Estado Actual: Backend funcionando ✅

---

## 📋 PASO 1: Actualizar Contraseñas en la Base de Datos

**IMPORTANTE:** Antes de poder hacer login, debes actualizar las contraseñas en la base de datos.

### Opción A: Desde phpMyAdmin (XAMPP)

1. Abre **phpMyAdmin** (http://localhost/phpmyadmin)
2. Selecciona la base de datos `pedido`
3. Ve a la pestaña **SQL**
4. Copia y pega este código:

```sql
UPDATE usuarios SET password = '$2b$10$rsfQJZnyZ8jjuLgRjpm0o.ddZ9gi2UAeqvRJ7r6V7wRu1iLKPQFLm';
```

5. Clic en **Continuar**

### Opción B: Desde la Terminal

```bash
mysql -u root pedido < actualizar_passwords.sql
```

---

## 📋 PASO 2: Verificar que el Backend esté corriendo

El backend **YA ESTÁ CORRIENDO** en http://localhost:3000

Si necesitas reiniciarlo:

```bash
cd BackEnd
node server.js
```

Debes ver:
```
🔧 Configuración de Base de Datos:
Host: localhost
Database: pedido
Port: 3306
✅ Servidor backend corriendo en http://localhost:3000
```

---

## 📋 PASO 3: Iniciar el Frontend

Abre **OTRA TERMINAL** (no cierres la del backend) y ejecuta:

```bash
cd frontend
npm run dev
```

Abrirá automáticamente en: **http://localhost:5173**

---

## 📋 PASO 4: Probar el Login

### Como TENDERO:

```
Email: tienda1@email.com
Password: password123
```

Otros tenderos disponibles:
- `tienda2@email.com` (Zona Norte)
- `tienda3@email.com` (Zona Sur)
- `tienda4@email.com` (Zona Sur)

### Como PLATAFORMA (Admin):

```
Email: admin@plataforma.com
Password: password123
```

### Como PROVEEDOR:

```
Email: proveedor1@email.com (Zona Norte)
Email: proveedor2@email.com (Zona Sur)
Email: proveedor3@email.com (Zona Centro)
Password: password123
```

---

## 🎯 PASO 5: Flujo de Prueba Completo

### 1️⃣ Login como TENDERO

1. Ve a http://localhost:5173
2. Ingresa:
   - Email: `tienda1@email.com`
   - Password: `password123`
3. Clic en **Iniciar Sesión**

### 2️⃣ Crear un Pedido

1. Verás tu dashboard con estadísticas
2. Clic en **"➕ Crear Nuevo Pedido"**
3. Selecciona un producto (ej: Arroz Diana x 500g)
4. Ingresa cantidad (ej: 10)
5. Verás el total calculado automáticamente
6. Clic en **"✅ Crear Pedido"**

### 3️⃣ Ver tu Pedido Activo

1. Vuelves automáticamente al dashboard
2. Tu pedido aparece en **"Pedidos Activos"**
3. Estado: **"⏳ Pendiente"**
4. El botón "Crear Nuevo Pedido" ya NO aparece (solo 1 pedido activo)

### 4️⃣ Cerrar Sesión

1. Clic en **"Cerrar Sesión"** (esquina superior derecha)

### 5️⃣ Login como PLATAFORMA

1. Ingresa:
   - Email: `admin@plataforma.com`
   - Password: `password123`
2. Verás el dashboard de la plataforma
3. Tu pedido aparece en la lista
4. Consolida, asigna proveedor y despacha (funciones ya implementadas)

### 6️⃣ Volver a Login como TENDERO

1. Cierra sesión de la plataforma
2. Ingresa nuevamente como `tienda1@email.com`
3. Verás el pedido con el nuevo estado actualizado

---

## 🎨 Características del Dashboard del Tendero

### 📊 Estadísticas (4 Cards):
- Total de Pedidos
- Total Invertido
- Pedidos Activos
- Completados

### 📦 Pedidos Activos:
- Muestra todos los pedidos NO completados
- Badges coloridos por estado
- Información del proveedor
- Fecha límite de entrega
- **Botón "Marcar como Recibido"** (solo cuando estado = 'entregado')

### 📋 Historial:
- Pedidos completados (entregados/recibidos)
- Diseño en gris para diferenciar

### 🏆 Productos Más Pedidos:
- Top 5 de productos que más pides
- Cantidad total pedida

---

## 🐛 Solución de Problemas

### ❌ Error: "Credenciales inválidas"

**Causa:** Las contraseñas en la base de datos no están actualizadas

**Solución:**
```sql
-- Ejecuta esto en phpMyAdmin:
UPDATE usuarios SET password = '$2b$10$rsfQJZnyZ8jjuLgRjpm0o.ddZ9gi2UAeqvRJ7r6V7wRu1iLKPQFLm';
```

### ❌ Error: "Cannot find module 'dotenv'"

**Solución:**
```bash
cd BackEnd
npm install
```

### ❌ Error: "Network Error" o "Failed to fetch"

**Causa:** El backend no está corriendo

**Solución:**
```bash
cd BackEnd
node server.js
```

### ❌ Error: XAMPP MySQL no inicia

**Solución:**
1. Cierra Skype (usa puerto 3306)
2. O cambia el puerto de MySQL en XAMPP
3. Actualiza el `.env` con el nuevo puerto

### ❌ El frontend no abre automáticamente

**Solución:**
```
Abre manualmente: http://localhost:5173
```

---

## 📂 Estructura de Archivos del Proyecto

```
PedidoTendero/
├── BackEnd/
│   ├── controllers/
│   │   ├── authController.js           ✅
│   │   ├── plataformaController.js     ✅
│   │   └── tenderoController.js        ✅ NUEVO
│   ├── routes/
│   │   ├── auth.js                     ✅
│   │   ├── plataforma.js               ✅
│   │   └── tendero.js                  ✅ NUEVO
│   ├── middleware/
│   │   └── auth.js                     ✅
│   ├── config/
│   │   └── database.js                 ✅
│   ├── .env                            ✅
│   ├── server.js                       ✅
│   └── package.json                    ✅
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx               ✅
│   │   │   ├── DashboardPlataforma.jsx ✅
│   │   │   ├── DashboardTendero.jsx    ✅ NUEVO
│   │   │   ├── CrearPedidoTendero.jsx  ✅ NUEVO
│   │   │   ├── CrearProducto.jsx       ✅
│   │   │   └── ...css files            ✅
│   │   ├── services/
│   │   │   └── api.js                  ✅
│   │   ├── App.jsx                     ✅
│   │   └── main.jsx                    ✅
│   └── package.json                    ✅
│
├── sql.sql                             ✅
├── actualizar_passwords.sql            ✅ NUEVO
├── IMPLEMENTACION_TENDERO.md           ✅ NUEVO
└── RESUMEN_IMPLEMENTACION_TENDERO.md   ✅ NUEVO
```

---

## 🎯 Reglas de Negocio Clave

### ⚠️ RESTRICCIÓN IMPORTANTE:
**Un tendero solo puede tener 1 pedido activo a la vez.**

Esto significa:
- ✅ Si NO tienes pedidos activos → Puedes crear uno nuevo
- ❌ Si YA tienes un pedido activo → Debes esperar a que se entregue y marcarlo como "Recibido"

### Estados del Pedido:

1. **Pendiente** 🟡 - Esperando consolidación
2. **Consolidación** 🔵 - Agrupado con otros pedidos de la zona
3. **Asignación** ⚫ - Proveedor asignado
4. **Despacho** 🔵 - Enviado al proveedor
5. **Enviado** 🟢 - El proveedor lo envió
6. **Entregado** ✅ - Llegó a tu tienda (AQUÍ PUEDES MARCARLO COMO RECIBIDO)
7. **Recibido** ✔️ - Confirmaste que lo recibiste (pasa al historial)

---

## 📞 Contacto y Soporte

Si tienes problemas:

1. **Verifica que XAMPP esté corriendo** (Apache + MySQL)
2. **Verifica que la base de datos `pedido` exista**
3. **Verifica que ejecutaste el `actualizar_passwords.sql`**
4. **Verifica que el backend esté corriendo** (puerto 3000)
5. **Verifica que el frontend esté corriendo** (puerto 5173)

---

## ✅ Checklist Final

Antes de la demostración:

- [ ] XAMPP corriendo (MySQL activo)
- [ ] Base de datos `pedido` creada
- [ ] Script `sql.sql` ejecutado
- [ ] Script `actualizar_passwords.sql` ejecutado
- [ ] Backend corriendo (`node server.js`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Login probado con `tienda1@email.com`
- [ ] Pedido creado exitosamente
- [ ] Restricción de 1 pedido activo validada

---

¡Todo listo para la demostración del parcial! 🎉🚀

**Password para TODOS los usuarios:** `password123`
