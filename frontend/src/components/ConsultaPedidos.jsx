import { useState, useEffect } from 'react';
import {
  obtenerPedidosProveedor,
  obtenerZonasAsignadas,
  obtenerTiendasPorZona
} from '../services/api';
import './ConsultaPedidos.css';

function ConsultaPedidos({ usuario, zonas: zonasIniciales, onVolver, onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [zonas, setZonas] = useState(zonasIniciales || []);
  const [tiendas, setTiendas] = useState([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!zonasIniciales || zonasIniciales.length === 0) {
      cargarZonas();
    }
  }, [zonasIniciales]);

  useEffect(() => {
    if (zonaSeleccionada) {
      cargarTiendas(zonaSeleccionada);
    } else {
      setTiendas([]);
      setTiendaSeleccionada('');
    }
  }, [zonaSeleccionada]);

  const cargarZonas = async () => {
    try {
      const data = await obtenerZonasAsignadas();
      setZonas(data.zonas);
    } catch (err) {
      setError(err.message);
    }
  };

  const cargarTiendas = async (zona) => {
    try {
      const data = await obtenerTiendasPorZona(zona);
      setTiendas(data.tiendas);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBuscar = async () => {
    setCargando(true);
    setError('');

    try {
      const filtros = {};
      if (zonaSeleccionada) filtros.zona = zonaSeleccionada;
      if (tiendaSeleccionada) filtros.tendero_id = tiendaSeleccionada;

      const data = await obtenerPedidosProveedor(filtros);
      setPedidos(data.pedidos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleLimpiar = () => {
    setZonaSeleccionada('');
    setTiendaSeleccionada('');
    setEstadoFiltro('todos');
    setPedidos([]);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { color: '#ffc107', texto: '⏳ Pendiente' },
      'consolidacion': { color: '#17a2b8', texto: '📦 Consolidación' },
      'asignacion': { color: '#6c757d', texto: '🔄 Asignación' },
      'despacho': { color: '#007bff', texto: '🚀 Despacho' },
      'enviado': { color: '#28a745', texto: '🚚 Enviado' },
      'entregado': { color: '#28a745', texto: '✅ Entregado' },
      'recibido': { color: '#6c757d', texto: '✔️ Recibido' }
    };
    
    const badge = badges[estado] || { color: '#6c757d', texto: estado };
    return <span className="badge" style={{ backgroundColor: badge.color }}>{badge.texto}</span>;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  // Filtrar pedidos por estado
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (estadoFiltro === 'todos') return true;
    return pedido.estado === estadoFiltro;
  });

  return (
    <div className="consulta-pedidos">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>🔍 Consulta de Pedidos</h1>
          <p>🏭 {usuario.nombre}</p>
        </div>
        <div className="header-buttons">
          <button onClick={onVolver} className="btn-volver">
            ← Volver
          </button>
          <button onClick={onLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filtros */}
      <div className="filtros-panel">
        <h2>🔎 Filtros de Búsqueda</h2>
        <div className="filtros-grid">
          <div className="form-group">
            <label>📍 Zona:</label>
            <select
              value={zonaSeleccionada}
              onChange={(e) => setZonaSeleccionada(e.target.value)}
            >
              <option value="">Todas las zonas</option>
              {zonas.map((zona, index) => (
                <option key={index} value={zona}>{zona}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>🏪 Tienda:</label>
            <select
              value={tiendaSeleccionada}
              onChange={(e) => setTiendaSeleccionada(e.target.value)}
              disabled={!zonaSeleccionada}
            >
              <option value="">Todas las tiendas</option>
              {tiendas.map((tienda) => (
                <option key={tienda.id} value={tienda.id}>
                  {tienda.nombre} ({tienda.total_pedidos} pedidos)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>🏷️ Estado:</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="despacho">Despacho</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="recibido">Recibido</option>
            </select>
          </div>
        </div>

        <div className="filtros-acciones">
          <button
            onClick={handleBuscar}
            className="btn-buscar"
            disabled={cargando}
          >
            {cargando ? '⏳ Buscando...' : '🔍 Buscar'}
          </button>
          <button
            onClick={handleLimpiar}
            className="btn-limpiar"
            disabled={cargando}
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Resultados */}
      {pedidos.length > 0 && (
        <div className="resultados-panel">
          <h2>
            📋 Resultados ({pedidosFiltrados.length} de {pedidos.length})
          </h2>

          {pedidosFiltrados.length === 0 ? (
            <div className="empty-state">
              <p>No hay pedidos con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="pedidos-list">
              {pedidosFiltrados.map((pedido) => (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-header">
                    <h3>Pedido #{pedido.id}</h3>
                    {getEstadoBadge(pedido.estado)}
                  </div>
                  <div className="pedido-body">
                    <div className="pedido-col">
                      <p><strong>🏪 Tienda:</strong> {pedido.tendero}</p>
                      <p><strong>📍 Zona:</strong> {pedido.zona}</p>
                      <p><strong>📞 Contacto:</strong> {pedido.tendero_contacto}</p>
                    </div>
                    <div className="pedido-col">
                      <p><strong>📦 Producto:</strong> {pedido.producto}</p>
                      <p><strong>🔢 Cantidad:</strong> {pedido.cantidad} {pedido.unidad_medida}</p>
                      <p><strong>💰 Total:</strong> {formatearPrecio(pedido.precio_total)}</p>
                    </div>
                    <div className="pedido-col">
                      <p><strong>📅 Pedido:</strong> {formatearFecha(pedido.fecha_pedido)}</p>
                      {pedido.fecha_limite_entrega && (
                        <p><strong>⏰ Límite:</strong> {formatearFecha(pedido.fecha_limite_entrega)}</p>
                      )}
                      {pedido.pedido_consolidado_id && (
                        <p><strong>📦 Consolidado:</strong> #{pedido.pedido_consolidado_id}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resumen */}
          {pedidosFiltrados.length > 0 && (
            <div className="resumen-totales">
              <h3>📊 Resumen</h3>
              <p>
                <strong>Total Pedidos:</strong> {pedidosFiltrados.length}
              </p>
              <p>
                <strong>Total Valor:</strong> {formatearPrecio(
                  pedidosFiltrados.reduce((sum, p) => sum + parseFloat(p.precio_total), 0)
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {pedidos.length === 0 && !cargando && (
        <div className="empty-state">
          <p>🔍 Selecciona los filtros y haz clic en "Buscar" para consultar pedidos</p>
        </div>
      )}
    </div>
  );
}

export default ConsultaPedidos;
