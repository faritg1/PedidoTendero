import { useState, useEffect } from 'react';
import {
  obtenerTodosPedidos,
  obtenerProveedores,
  consolidarPedidos,
  asignarProveedor,
  despacharPedidoConsolidado,
  obtenerResumenPedidos
} from '../services/api';
import CrearProducto from './CrearProducto';
import './DashboardPlataforma.css';

function DashboardPlataforma({ usuario, onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroZona, setFiltroZona] = useState('todos');
  const [vistaActual, setVistaActual] = useState('pedidos');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [dataPedidos, dataProveedores, dataResumen] = await Promise.all([
        obtenerTodosPedidos(),
        obtenerProveedores(),
        obtenerResumenPedidos()
      ]);
      
      setPedidos(dataPedidos.pedidos);
      setProveedores(dataProveedores.proveedores);
      setResumen(dataResumen.resumen);
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const handleSeleccionarPedido = (id) => {
    setPedidosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleConsolidar = async () => {
    if (pedidosSeleccionados.length === 0) {
      mostrarMensaje('Seleccione al menos un pedido', 'error');
      return;
    }

    setCargando(true);
    try {
      await consolidarPedidos(pedidosSeleccionados);
      mostrarMensaje('Pedidos consolidados exitosamente', 'success');
      setPedidosSeleccionados([]);
      await cargarDatos();
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleAsignarProveedor = async () => {
    if (pedidosSeleccionados.length === 0) {
      mostrarMensaje('Seleccione al menos un pedido', 'error');
      return;
    }
    if (!proveedorSeleccionado) {
      mostrarMensaje('Seleccione un proveedor', 'error');
      return;
    }

    setCargando(true);
    try {
      await asignarProveedor(pedidosSeleccionados, parseInt(proveedorSeleccionado));
      mostrarMensaje('Proveedor asignado exitosamente', 'success');
      setPedidosSeleccionados([]);
      setProveedorSeleccionado('');
      await cargarDatos();
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleDespachar = async () => {
    if (pedidosSeleccionados.length === 0) {
      mostrarMensaje('Seleccione al menos un pedido', 'error');
      return;
    }

    const pedidosADespachar = pedidos.filter(p => pedidosSeleccionados.includes(p.id));
    const zona = pedidosADespachar[0]?.zona;
    const proveedor_id = pedidosADespachar[0]?.proveedor_id;

    if (!zona || !proveedor_id) {
      mostrarMensaje('Los pedidos deben tener zona y proveedor asignado', 'error');
      return;
    }

    setCargando(true);
    try {
      await despacharPedidoConsolidado(pedidosSeleccionados, zona, proveedor_id);
      mostrarMensaje('Pedido consolidado despachado exitosamente', 'success');
      setPedidosSeleccionados([]);
      await cargarDatos();
    } catch (error) {
      mostrarMensaje(error.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    const cumpleFiltroZona = filtroZona === 'todos' || p.zona === filtroZona;
    return cumpleFiltroEstado && cumpleFiltroZona;
  });

  const zonas = [...new Set(pedidos.map(p => p.zona))];

  const getEstadoBadgeClass = (estado) => {
    const clases = {
      pendiente: 'badge-pendiente',
      consolidacion: 'badge-consolidacion',
      asignacion: 'badge-asignacion',
      despacho: 'badge-despacho',
      enviado: 'badge-enviado',
      entregado: 'badge-entregado',
      recibido: 'badge-recibido'
    };
    return clases[estado] || 'badge-default';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>🏪 Plataforma Central</h1>
          <p>Bienvenido, {usuario.nombre}</p>
        </div>
        <button onClick={onLogout} className="btn-logout">Cerrar Sesión</button>
      </header>

      {mensaje.texto && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <nav className="dashboard-nav">
        <button
          className={vistaActual === 'pedidos' ? 'active' : ''}
          onClick={() => setVistaActual('pedidos')}
        >
          📦 Pedidos
        </button>
        <button
          className={vistaActual === 'resumen' ? 'active' : ''}
          onClick={() => setVistaActual('resumen')}
        >
          📊 Resumen
        </button>
        <button
          className={vistaActual === 'productos' ? 'active' : ''}
          onClick={() => setVistaActual('productos')}
        >
          ➕ Crear Producto
        </button>
      </nav>

      {vistaActual === 'pedidos' && (
        <div className="vista-pedidos">
          <div className="controles">
            <div className="filtros">
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="consolidacion">Consolidación</option>
                <option value="asignacion">Asignación</option>
                <option value="despacho">Despacho</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="recibido">Recibido</option>
              </select>

              <select value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)}>
                <option value="todos">Todas las zonas</option>
                {zonas.map(zona => (
                  <option key={zona} value={zona}>{zona}</option>
                ))}
              </select>
            </div>

            <div className="acciones">
              <button
                onClick={handleConsolidar}
                disabled={cargando || pedidosSeleccionados.length === 0}
                className="btn-consolidar"
              >
                🔄 Consolidar
              </button>

              <select
                value={proveedorSeleccionado}
                onChange={(e) => setProveedorSeleccionado(e.target.value)}
                disabled={pedidosSeleccionados.length === 0}
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map(prov => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre} ({prov.zona})
                  </option>
                ))}
              </select>

              <button
                onClick={handleAsignarProveedor}
                disabled={cargando || pedidosSeleccionados.length === 0 || !proveedorSeleccionado}
                className="btn-asignar"
              >
                👤 Asignar
              </button>

              <button
                onClick={handleDespachar}
                disabled={cargando || pedidosSeleccionados.length === 0}
                className="btn-despachar"
              >
                🚚 Despachar
              </button>
            </div>
          </div>

          <div className="tabla-container">
            <table className="tabla-pedidos">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPedidosSeleccionados(pedidosFiltrados.map(p => p.id));
                        } else {
                          setPedidosSeleccionados([]);
                        }
                      }}
                    />
                  </th>
                  <th>ID</th>
                  <th>Tendero</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Zona</th>
                  <th>Estado</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center' }}>
                      No hay pedidos para mostrar
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map(pedido => (
                    <tr key={pedido.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={pedidosSeleccionados.includes(pedido.id)}
                          onChange={() => handleSeleccionarPedido(pedido.id)}
                        />
                      </td>
                      <td>{pedido.id}</td>
                      <td>{pedido.tendero}</td>
                      <td>{pedido.producto}</td>
                      <td>{pedido.cantidad}</td>
                      <td>${pedido.precio_total.toLocaleString()}</td>
                      <td><span className="badge-zona">{pedido.zona}</span></td>
                      <td>
                        <span className={`badge ${getEstadoBadgeClass(pedido.estado)}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td>{pedido.proveedor || '-'}</td>
                      <td>{new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vistaActual === 'resumen' && (
        <div className="vista-resumen">
          <h2>📊 Resumen de Pedidos por Zona y Estado</h2>
          <div className="resumen-grid">
            {resumen.map((item, index) => (
              <div key={index} className="resumen-card">
                <h3>{item.zona}</h3>
                <p className="estado">{item.estado}</p>
                <div className="stats">
                  <div className="stat">
                    <span className="label">Pedidos:</span>
                    <span className="value">{item.total_pedidos}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Productos:</span>
                    <span className="value">{item.total_productos}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Valor:</span>
                    <span className="value">${item.valor_total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vistaActual === 'productos' && (
        <CrearProducto onProductoCreado={() => mostrarMensaje('Producto creado exitosamente', 'success')} />
      )}
    </div>
  );
}

export default DashboardPlataforma;
