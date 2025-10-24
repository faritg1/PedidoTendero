# Backend - Sistema de Pedidos para Tenderos

## 🚀 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Crea la base de datos en MySQL/XAMPP ejecutando el script `sql.sql`
2. Configura las variables de entorno en el archivo `.env`

## 📡 Endpoints de la Plataforma

### Autenticación

**POST** `/api/auth/login`
```json
{
  "email": "admin@plataforma.com",
  "password": "password123"
}
```

**POST** `/api/auth/registro`
```json
{
  "nombre": "Nombre Usuario",
  "email": "email@example.com",
  "password": "password123",
  "tipo_usuario": "plataforma",
  "zona": "Central",
  "contacto": "3001234567"
}
```

### Plataforma (Requiere token)

**Todas las rutas requieren el header:**
```
Authorization: Bearer {token}
```

**GET** `/api/plataforma/pedidos`
- Obtiene todos los pedidos del sistema

**GET** `/api/plataforma/pedidos/resumen`
- Obtiene resumen de pedidos por zona y estado

**POST** `/api/plataforma/pedidos/consolidar`
```json
{
  "pedidos_ids": [1, 2, 3]
}
```

**POST** `/api/plataforma/pedidos/asignar-proveedor`
```json
{
  "pedidos_ids": [1, 2, 3],
  "proveedor_id": 2
}
```

**POST** `/api/plataforma/pedidos/despachar`
```json
{
  "pedidos_ids": [1, 2, 3],
  "zona": "Norte",
  "proveedor_id": 2
}
```

**POST** `/api/plataforma/productos`
```json
{
  "nombre": "Arroz x 500g",
  "descripcion": "Arroz de primera calidad",
  "precio_unitario": 2500,
  "unidad_medida": "bolsa"
}
```

**GET** `/api/plataforma/productos`
- Lista todos los productos activos

**GET** `/api/plataforma/proveedores`
- Lista todos los proveedores activos

## 🏃 Ejecutar

```bash
npm start
```

## 📝 Notas

- El puerto por defecto es 3000
- La contraseña de prueba para todos los usuarios es: `password123`
- Recuerda hashear las contraseñas con bcrypt antes de insertar en producción
