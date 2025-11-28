import { useState, useEffect } from 'react';
import { obtenerProductosTendero, crearPedido } from '../services/api';
import './CrearPedido.css';

function CrearPedido({ usuario, onPedidoCreado, onCancelar }) {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [productoInfo, setProductoInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductosTendero();
      setProductos(data.productos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleProductoChange = (e) => {
    const productoId = e.target.value;
    setProductoSeleccionado(productoId);
    
    if (productoId) {
      const producto = productos.find(p => p.id === parseInt(productoId));
      setProductoInfo(producto);
    } else {
      setProductoInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productoSeleccionado || cantidad <= 0) {
      setError('Por favor selecciona un producto y una cantidad válida');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      await crearPedido(parseInt(productoSeleccionado), parseInt(cantidad));
      onPedidoCreado();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  const calcularTotal = () => {
    if (!productoInfo || !cantidad) return 0;
    return productoInfo.precio_unitario * cantidad;
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
      <div className="crear-pedido">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="crear-pedido">
      <div className="crear-pedido-card">
        <div className="card-header">
          <h2>➕ Crear Nuevo Pedido</h2>
          <p>🏪 {usuario.nombre} - 📍 Zona: {usuario.zona}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="producto">📦 Selecciona el Producto:</label>
            <select
              id="producto"
              value={productoSeleccionado}
              onChange={handleProductoChange}
              required
              disabled={enviando}
            >
              <option value="">-- Selecciona un producto --</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - {formatearPrecio(producto.precio_unitario)} / {producto.unidad_medida}
                </option>
              ))}
            </select>
          </div>

          {productoInfo && (
            <div className="producto-detalle">
              <h3>{productoInfo.nombre}</h3>
              <p className="descripcion">{productoInfo.descripcion}</p>
              <div className="precio-info">
                <span className="precio-unitario">
                  💰 Precio unitario: {formatearPrecio(productoInfo.precio_unitario)}
                </span>
                <span className="unidad">
                  📏 Unidad: {productoInfo.unidad_medida}
                </span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="cantidad">🔢 Cantidad:</label>
            <input
              type="number"
              id="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min="1"
              required
              disabled={enviando}
            />
          </div>

          {productoInfo && cantidad > 0 && (
            <div className="total-pedido">
              <h3>💰 Total del Pedido:</h3>
              <p className="precio-total">{formatearPrecio(calcularTotal())}</p>
              <small>
                {cantidad} {productoInfo.unidad_medida}(s) × {formatearPrecio(productoInfo.precio_unitario)}
              </small>
            </div>
          )}

          <div className="alert alert-info">
            ℹ️ <strong>Importante:</strong> Solo puedes tener un pedido activo a la vez. 
            Una vez creado, debes esperar a que sea entregado para hacer otro pedido.
          </div>

          <div className="alert alert-warning">
            ⏰ <strong>Tiempo de entrega:</strong> Máximo 72 horas desde que el pedido 
            sea consolidado por la plataforma.
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancelar}
              className="btn-cancelar"
              disabled={enviando}
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              className="btn-crear"
              disabled={enviando || !productoSeleccionado || cantidad <= 0}
            >
              {enviando ? '⏳ Creando pedido...' : '✅ Crear Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrearPedido;
