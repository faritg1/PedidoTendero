import { useState, useEffect } from 'react';
import {
  obtenerMisPedidos,
  verificarPedidosActivos,
  marcarComoRecibido,
  obtenerEstadisticasTendero
} from '../services/api';
import CrearPedido from './CrearPedidoTendero';
import './DashboardTendero.css';

function DashboardTendero({ usuario, onLogout }) {
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [tienePedidosActivos, setTienePedidosActivos] = useState(false);
  const [mostrarCrearPedido, setMostrarCrearPedido] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError('');
    
    try {
      // Cargar pedidos
      const dataPedidos = await obtenerMisPedidos();
      setPedidosActivos(dataPedidos.pedidos_activos);
      setHistorial(dataPedidos.historial);

      // Verificar si tiene pedidos activos
      const dataVerificacion = await verificarPedidosActivos();
      setTienePedidosActivos(dataVerificacion.tiene_pedidos_activos);

      // Cargar estadísticas
      const dataEstadisticas = await obtenerEstadisticasTendero();
      setEstadisticas(dataEstadisticas);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleMarcarRecibido = async (pedidoId) => {
    if (!confirm('¿Confirmas que has recibido este pedido?')) return;

    try {
      setMensaje('');
      await marcarComoRecibido(pedidoId);
      setMensaje('✅ Pedido marcado como recibido');
      cargarDatos(); // Recargar datos
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePedidoCreado = () => {
    setMostrarCrearPedido(false);
    setMensaje('✅ Pedido creado exitosamente');
    cargarDatos(); // Recargar datos
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { color: '#ffc107', texto: '⏳ Pendiente' },
      'consolidacion': { color: '#17a2b8', texto: '📦 En consolidación' },
      'asignacion': { color: '#6c757d', texto: '🔄 En asignación' },
      'despacho': { color: '#007bff', texto: '🚀 En despacho' },
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

  if (cargando) {
    return (
      <div className="dashboard-tendero">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (mostrarCrearPedido) {
    return (
      <div className="dashboard-tendero">
        <CrearPedido
          usuario={usuario}
          onPedidoCreado={handlePedidoCreado}
          onCancelar={() => setMostrarCrearPedido(false)}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-tendero">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>🏪 {usuario.nombre}</h1>
          <p>📍 Zona: {usuario.zona}</p>
        </div>
        <button onClick={onLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </header>

      {/* Mensajes */}
      {error && <div className="alert alert-error">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      {/* Estadísticas */}
      {estadisticas && (
        <div className="estadisticas-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{estadisticas.total_pedidos}</h3>
              <p>Total Pedidos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>{formatearPrecio(estadisticas.total_gastado)}</h3>
              <p>Total Invertido</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{pedidosActivos.length}</h3>
              <p>Pedidos Activos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{historial.length}</h3>
              <p>Completados</p>
            </div>
          </div>
        </div>
      )}

      {/* Botón crear pedido */}
      <div className="accion-principal">
        {!tienePedidosActivos ? (
          <button 
            onClick={() => setMostrarCrearPedido(true)}
            className="btn-crear-pedido"
          >
            ➕ Crear Nuevo Pedido
          </button>
        ) : (
          <div className="alert alert-warning">
            ⚠️ Ya tienes un pedido activo. Debes esperar a que se entregue para hacer otro.
          </div>
        )}
      </div>

      {/* Pedidos Activos */}
      {pedidosActivos.length > 0 && (
        <section className="seccion-pedidos">
          <h2>📦 Pedidos Activos</h2>
          <div className="pedidos-list">
            {pedidosActivos.map(pedido => (
              <div key={pedido.id} className="pedido-card activo">
                <div className="pedido-header">
                  <h3>Pedido #{pedido.id}</h3>
                  {getEstadoBadge(pedido.estado)}
                </div>
                <div className="pedido-body">
                  <div className="pedido-info">
                    <p><strong>📦 Producto:</strong> {pedido.producto}</p>
                    <p><strong>🔢 Cantidad:</strong> {pedido.cantidad} {pedido.unidad_medida}</p>
                    <p><strong>💰 Total:</strong> {formatearPrecio(pedido.precio_total)}</p>
                    {pedido.proveedor && (
                      <p><strong>🏭 Proveedor:</strong> {pedido.proveedor}</p>
                    )}
                    {pedido.fecha_limite_entrega && (
                      <p><strong>⏰ Entrega máxima:</strong> {formatearFecha(pedido.fecha_limite_entrega)}</p>
                    )}
                  </div>
                  {pedido.estado === 'entregado' && (
                    <button
                      onClick={() => handleMarcarRecibido(pedido.id)}
                      className="btn-recibido"
                    >
                      ✅ Marcar como Recibido
                    </button>
                  )}
                </div>
                <div className="pedido-footer">
                  <small>📅 Pedido: {formatearFecha(pedido.fecha_pedido)}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <section className="seccion-pedidos">
          <h2>📋 Historial de Pedidos</h2>
          <div className="pedidos-list">
            {historial.map(pedido => (
              <div key={pedido.id} className="pedido-card historial">
                <div className="pedido-header">
                  <h3>Pedido #{pedido.id}</h3>
                  {getEstadoBadge(pedido.estado)}
                </div>
                <div className="pedido-body">
                  <div className="pedido-info">
                    <p><strong>📦 Producto:</strong> {pedido.producto}</p>
                    <p><strong>🔢 Cantidad:</strong> {pedido.cantidad} {pedido.unidad_medida}</p>
                    <p><strong>💰 Total:</strong> {formatearPrecio(pedido.precio_total)}</p>
                    {pedido.proveedor && (
                      <p><strong>🏭 Proveedor:</strong> {pedido.proveedor}</p>
                    )}
                  </div>
                </div>
                <div className="pedido-footer">
                  <small>📅 {formatearFecha(pedido.fecha_pedido)}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Productos más pedidos */}
      {estadisticas && estadisticas.productos_mas_pedidos.length > 0 && (
        <section className="seccion-pedidos">
          <h2>🏆 Tus Productos Más Pedidos</h2>
          <div className="productos-top">
            {estadisticas.productos_mas_pedidos.map((producto, index) => (
              <div key={index} className="producto-top-item">
                <span className="posicion">#{index + 1}</span>
                <div className="producto-info">
                  <strong>{producto.nombre}</strong>
                  <small>{producto.cantidad_total} unidades pedidas</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DashboardTendero;
