const API_URL = 'http://localhost:3000/api';

// Función auxiliar para manejar errores
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  return response.json();
};

// Obtener el token del localStorage
const getToken = () => localStorage.getItem('token');

// Configurar headers con token
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// ===============================
// AUTENTICACIÓN
// ===============================
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(response);
};

export const registro = async (datos) => {
  const response = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
};

// ===============================
// PLATAFORMA
// ===============================
export const obtenerTodosPedidos = async () => {
  const response = await fetch(`${API_URL}/plataforma/pedidos`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const consolidarPedidos = async (pedidos_ids) => {
  const response = await fetch(`${API_URL}/plataforma/pedidos/consolidar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ pedidos_ids })
  });
  return handleResponse(response);
};

export const asignarProveedor = async (pedidos_ids, proveedor_id) => {
  const response = await fetch(`${API_URL}/plataforma/pedidos/asignar-proveedor`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ pedidos_ids, proveedor_id })
  });
  return handleResponse(response);
};

export const despacharPedidoConsolidado = async (pedidos_ids, zona, proveedor_id) => {
  const response = await fetch(`${API_URL}/plataforma/pedidos/despachar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ pedidos_ids, zona, proveedor_id })
  });
  return handleResponse(response);
};

export const obtenerResumenPedidos = async () => {
  const response = await fetch(`${API_URL}/plataforma/pedidos/resumen`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const crearProducto = async (producto) => {
  const response = await fetch(`${API_URL}/plataforma/productos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(producto)
  });
  return handleResponse(response);
};

export const obtenerProductos = async () => {
  const response = await fetch(`${API_URL}/plataforma/productos`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const obtenerProveedores = async () => {
  const response = await fetch(`${API_URL}/plataforma/proveedores`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};
