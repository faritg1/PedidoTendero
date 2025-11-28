import { useState, useEffect } from 'react';
import {
  obtenerPedidosConsolidados,
  obtenerEstadisticasProveedor,
  obtenerZonasAsignadas
} from '../services/api';
import DetalleConsolidado from './DetalleConsolidado';
import ConsultaPedidos from './ConsultaPedidos';
import './DashboardProveedor.css';

function DashboardProveedor({ usuario, onLogout }) {
  const [consolidados, setConsolidados] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [consolidadoSeleccionado, setConsolidadoSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('consolidados'); // consolidados, consulta
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
      // Cargar consolidados
      const dataConsolidados = await obtenerPedidosConsolidados();
      setConsolidados(dataConsolidados.consolidados);

      // Cargar estadísticas
      const dataEstadisticas = await obtenerEstadisticasProveedor();
      setEstadisticas(dataEstadisticas);

      // Cargar zonas
      const dataZonas = await obtenerZonasAsignadas();
      setZonas(dataZonas.zonas);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleConsolidadoActualizado = () => {
    setConsolidadoSeleccionado(null);
    setMensaje('✅ Estado actualizado exitosamente');
    cargarDatos();
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'en_preparacion': { color: '#ffc107', texto: '⏳ En Preparación' },
      'enviado': { color: '#28a745', texto: '🚚 Enviado' },
      'entregado': { color: '#6c757d', texto: '✅ Entregado' }
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
      <div className="dashboard-proveedor">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  // Vista de detalle de consolidado
  if (consolidadoSeleccionado) {
    return (
      <DetalleConsolidado
        consolidadoId={consolidadoSeleccionado}
        usuario={usuario}
        onVolver={() => setConsolidadoSeleccionado(null)}
        onActualizado={handleConsolidadoActualizado}
      />
    );
  }

  // Vista de consulta de pedidos
  if (vistaActual === 'consulta') {
    return (
      <ConsultaPedidos
        usuario={usuario}
        zonas={zonas}
        onVolver={() => setVistaActual('consolidados')}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="dashboard-proveedor">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>🏭 {usuario.nombre}</h1>
          <p>📍 Zona: {usuario.zona}</p>
        </div>
        <button onClick={onLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </header>

      {/* Mensajes */}
      {error && <div className="alert alert-error">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      {/* Navegación */}
      <div className="nav-tabs">
        <button 
          className={vistaActual === 'consolidados' ? 'active' : ''}
          onClick={() => setVistaActual('consolidados')}
        >
          📦 Pedidos Consolidados
        </button>
        <button 
          className={vistaActual === 'consulta' ? 'active' : ''}
          onClick={() => setVistaActual('consulta')}
        >
          🔍 Consultar Pedidos
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="estadisticas-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{estadisticas.total_consolidados}</h3>
              <p>Consolidados Totales</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{estadisticas.total_pedidos}</h3>
              <p>Pedidos Totales</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>{formatearPrecio(estadisticas.total_vendido)}</h3>
              <p>Total Vendido</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-info">
              <h3>{zonas.length}</h3>
              <p>Zonas Asignadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Estados de Consolidados */}
      {estadisticas && estadisticas.consolidados_por_estado.length > 0 && (
        <div className="estados-resumen">
          <h3>📊 Consolidados por Estado</h3>
          <div className="estados-grid">
            {estadisticas.consolidados_por_estado.map(estado => (
              <div key={estado.estado} className="estado-item">
                {getEstadoBadge(estado.estado)}
                <span className="cantidad">{estado.cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Consolidados */}
      <section className="seccion-consolidados">
        <h2>📦 Pedidos Consolidados</h2>
        {consolidados.length === 0 ? (
          <div className="empty-state">
            <p>📭 No tienes pedidos consolidados asignados</p>
          </div>
        ) : (
          <div className="consolidados-list">
            {consolidados.map(consolidado => (
              <div key={consolidado.id} className="consolidado-card">
                <div className="consolidado-header">
                  <h3>Consolidado #{consolidado.id}</h3>
                  {getEstadoBadge(consolidado.estado)}
                </div>
                <div className="consolidado-body">
                  <div className="consolidado-info">
                    <p><strong>📍 Zona:</strong> {consolidado.zona}</p>
                    <p><strong>🏪 Tiendas:</strong> {consolidado.num_tiendas}</p>
                    <p><strong>📦 Pedidos:</strong> {consolidado.num_pedidos}</p>
                    <p><strong>💰 Total:</strong> {formatearPrecio(consolidado.total_valor)}</p>
                    {consolidado.fecha_entrega_estimada && (
                      <p><strong>⏰ Entrega estimada:</strong> {formatearFecha(consolidado.fecha_entrega_estimada)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setConsolidadoSeleccionado(consolidado.id)}
                    className="btn-ver-detalle"
                  >
                    👁️ Ver Detalle
                  </button>
                </div>
                <div className="consolidado-footer">
                  <small>📅 Creado: {formatearFecha(consolidado.fecha_creacion)}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Productos Más Despachados */}
      {estadisticas && estadisticas.productos_mas_despachados.length > 0 && (
        <section className="seccion-productos">
          <h2>🏆 Productos Más Despachados</h2>
          <div className="productos-top">
            {estadisticas.productos_mas_despachados.map((producto, index) => (
              <div key={index} className="producto-top-item">
                <span className="posicion">#{index + 1}</span>
                <div className="producto-info">
                  <strong>{producto.nombre}</strong>
                  <small>{producto.cantidad_total} unidades ({producto.veces_despachado} pedidos)</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tiendas Atendidas */}
      {estadisticas && estadisticas.tiendas_atendidas.length > 0 && (
        <section className="seccion-tiendas">
          <h2>🏪 Tiendas Atendidas</h2>
          <div className="tiendas-grid">
            {estadisticas.tiendas_atendidas.map((tienda, index) => (
              <div key={index} className="tienda-card">
                <h4>{tienda.nombre}</h4>
                <p><strong>📍</strong> {tienda.zona}</p>
                <p><strong>📦</strong> {tienda.total_pedidos} pedidos</p>
                <p><strong>💰</strong> {formatearPrecio(tienda.total_comprado)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DashboardProveedor;
