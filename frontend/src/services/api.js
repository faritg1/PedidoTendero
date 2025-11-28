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

// ===============================
// TENDERO
// ===============================
export const obtenerProductosTendero = async () => {
  const response = await fetch(`${API_URL}/tendero/productos`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const verificarPedidosActivos = async () => {
  const response = await fetch(`${API_URL}/tendero/verificar-pedidos-activos`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const crearPedido = async (producto_id, cantidad) => {
  const response = await fetch(`${API_URL}/tendero/pedidos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ producto_id, cantidad })
  });
  return handleResponse(response);
};

export const obtenerMisPedidos = async () => {
  const response = await fetch(`${API_URL}/tendero/pedidos`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const marcarComoRecibido = async (pedido_id) => {
  const response = await fetch(`${API_URL}/tendero/pedidos/${pedido_id}/recibido`, {
    method: 'PUT',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const obtenerEstadisticasTendero = async () => {
  const response = await fetch(`${API_URL}/tendero/estadisticas`, {
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

// ===============================
// PROVEEDOR
// ===============================
export const obtenerPedidosConsolidados = async () => {
  const response = await fetch(`${API_URL}/proveedor/consolidados`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const obtenerDetalleConsolidado = async (consolidado_id) => {
  const response = await fetch(`${API_URL}/proveedor/consolidados/${consolidado_id}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const actualizarEstadoConsolidado = async (consolidado_id, nuevo_estado, observaciones) => {
  const response = await fetch(`${API_URL}/proveedor/consolidados/${consolidado_id}/estado`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ nuevo_estado, observaciones })
  });
  return handleResponse(response);
};

export const obtenerPedidosProveedor = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.zona) params.append('zona', filtros.zona);
  if (filtros.tendero_id) params.append('tendero_id', filtros.tendero_id);
  
  const response = await fetch(`${API_URL}/proveedor/pedidos?${params}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const obtenerEstadisticasProveedor = async () => {
  const response = await fetch(`${API_URL}/proveedor/estadisticas`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const obtenerZonasAsignadas = async () => {
  const response = await fetch(`${API_URL}/proveedor/zonas`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const obtenerTiendasPorZona = async (zona = null) => {
  const params = zona ? `?zona=${zona}` : '';
  const response = await fetch(`${API_URL}/proveedor/tiendas${params}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
};
