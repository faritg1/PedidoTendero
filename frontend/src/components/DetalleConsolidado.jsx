import { useState, useEffect } from 'react';
import { obtenerDetalleConsolidado, actualizarEstadoConsolidado } from '../services/api';
import './DetalleConsolidado.css';

function DetalleConsolidado({ consolidadoId, usuario, onVolver, onActualizado }) {
  const [consolidado, setConsolidado] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [resumenProductos, setResumenProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    cargarDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consolidadoId]);

  const cargarDetalle = async () => {
    setCargando(true);
    setError('');
    
    try {
      const data = await obtenerDetalleConsolidado(consolidadoId);
      setConsolidado(data.consolidado);
      setPedidos(data.pedidos);
      setResumenProductos(data.resumen_productos);
      setNuevoEstado(data.consolidado.estado);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleActualizarEstado = async (e) => {
    e.preventDefault();
    
    if (!nuevoEstado) {
      setError('Selecciona un estado');
      return;
    }

    setActualizando(true);
    setError('');

    try {
      await actualizarEstadoConsolidado(consolidadoId, nuevoEstado, observaciones);
      onActualizado();
    } catch (err) {
      setError(err.message);
      setActualizando(false);
    }
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
      <div className="detalle-consolidado">
        <div className="loading">Cargando detalle...</div>
      </div>
    );
  }

  if (!consolidado) {
    return (
      <div className="detalle-consolidado">
        <div className="alert alert-error">No se encontró el consolidado</div>
        <button onClick={onVolver} className="btn-volver">← Volver</button>
      </div>
    );
  }

  return (
    <div className="detalle-consolidado">
      {/* Header */}
      <div className="detalle-header">
        <button onClick={onVolver} className="btn-volver">← Volver</button>
        <div className="titulo-detalle">
          <h1>📦 Consolidado #{consolidado.id}</h1>
          {getEstadoBadge(consolidado.estado)}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Información General */}
      <div className="info-general">
        <div className="info-card">
          <h3>ℹ️ Información General</h3>
          <p><strong>📍 Zona:</strong> {consolidado.zona}</p>
          <p><strong>🏭 Proveedor:</strong> {usuario.nombre}</p>
          <p><strong>📅 Fecha Creación:</strong> {formatearFecha(consolidado.fecha_creacion)}</p>
          {consolidado.fecha_despacho && (
            <p><strong>🚀 Fecha Despacho:</strong> {formatearFecha(consolidado.fecha_despacho)}</p>
          )}
          {consolidado.fecha_entrega_estimada && (
            <p><strong>⏰ Entrega Estimada:</strong> {formatearFecha(consolidado.fecha_entrega_estimada)}</p>
          )}
          <p><strong>💰 Total:</strong> {formatearPrecio(consolidado.total_valor)}</p>
        </div>

        {/* Formulario para actualizar estado */}
        <div className="info-card">
          <h3>🔄 Actualizar Estado</h3>
          <form onSubmit={handleActualizarEstado}>
            <div className="form-group">
              <label>Estado:</label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                disabled={actualizando}
                required
              >
                <option value="en_preparacion">⏳ En Preparación</option>
                <option value="enviado">🚚 Enviado</option>
                <option value="entregado">✅ Entregado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Observaciones (opcional):</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre el envío..."
                rows="3"
                disabled={actualizando}
              />
            </div>

            <button type="submit" disabled={actualizando} className="btn-actualizar">
              {actualizando ? '⏳ Actualizando...' : '✅ Actualizar Estado'}
            </button>
          </form>
        </div>
      </div>

      {/* Resumen de Productos */}
      <section className="seccion-resumen">
        <h2>📊 Resumen de Productos</h2>
        <div className="tabla-container">
          <table className="tabla-productos">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad Total</th>
                <th>Unidad</th>
                <th>Tiendas</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {resumenProductos.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.producto}</strong></td>
                  <td className="text-center">{item.cantidad_total}</td>
                  <td className="text-center">{item.unidad_medida}</td>
                  <td className="text-center">{item.num_tiendas}</td>
                  <td className="text-right"><strong>{formatearPrecio(item.precio_total)}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4"><strong>TOTAL</strong></td>
                <td className="text-right">
                  <strong>{formatearPrecio(consolidado.total_valor)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Pedidos Individuales */}
      <section className="seccion-pedidos">
        <h2>📋 Pedidos Individuales ({pedidos.length})</h2>
        <div className="pedidos-detalle">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-item">
              <div className="pedido-item-header">
                <h4>🏪 {pedido.tendero}</h4>
                <span className="pedido-id">#{pedido.id}</span>
              </div>
              <div className="pedido-item-body">
                <p><strong>📦 Producto:</strong> {pedido.producto}</p>
                <p><strong>🔢 Cantidad:</strong> {pedido.cantidad} {pedido.unidad_medida}</p>
                <p><strong>💰 Total:</strong> {formatearPrecio(pedido.precio_total)}</p>
                <p><strong>📞 Contacto:</strong> {pedido.tendero_contacto}</p>
                <p><strong>📅 Fecha:</strong> {formatearFecha(pedido.fecha_pedido)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {consolidado.observaciones && (
        <div className="observaciones-box">
          <h3>📝 Observaciones</h3>
          <p>{consolidado.observaciones}</p>
        </div>
      )}
    </div>
  );
}

export default DetalleConsolidado;
