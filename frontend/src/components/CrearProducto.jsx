import { useState } from 'react';
import { crearProducto } from '../services/api';
import './CrearProducto.css';

function CrearProducto({ onProductoCreado }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_unitario: '',
    unidad_medida: 'unidad'
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre || !formData.precio_unitario) {
      setError('Nombre y precio son obligatorios');
      return;
    }

    setCargando(true);
    try {
      await crearProducto({
        ...formData,
        precio_unitario: parseFloat(formData.precio_unitario)
      });
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        descripcion: '',
        precio_unitario: '',
        unidad_medida: 'unidad'
      });

      onProductoCreado();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="crear-producto-container">
      <div className="crear-producto-card">
        <h2>➕ Crear Nuevo Producto</h2>
        <p className="subtitulo">Agrega productos al catálogo disponible para los tenderos</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Producto: *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Arroz Diana x 500g"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción opcional del producto"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio Unitario: *</label>
              <input
                type="number"
                name="precio_unitario"
                value={formData.precio_unitario}
                onChange={handleChange}
                placeholder="2500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Unidad de Medida:</label>
              <select
                name="unidad_medida"
                value={formData.unidad_medida}
                onChange={handleChange}
              >
                <option value="unidad">Unidad</option>
                <option value="bolsa">Bolsa</option>
                <option value="paquete">Paquete</option>
                <option value="caja">Caja</option>
                <option value="botella">Botella</option>
                <option value="lata">Lata</option>
                <option value="kg">Kilogramo</option>
                <option value="litro">Litro</option>
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={cargando} className="btn-crear">
            {cargando ? 'Creando...' : '✓ Crear Producto'}
          </button>
        </form>

        <div className="info-box">
          <p>💡 <strong>Tip:</strong> Los productos creados aquí estarán disponibles inmediatamente para que los tenderos realicen sus pedidos.</p>
        </div>
      </div>
    </div>
  );
}

export default CrearProducto;
