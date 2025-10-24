import { useState, useEffect } from "react";
import Login from "./components/Login";
import DashboardPlataforma from "./components/DashboardPlataforma";
import "./App.css";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    
    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  const handleLogin = (usuarioData) => {
    setUsuario(usuarioData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  if (cargando) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  // Si no hay usuario, mostrar login
  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  // Si es plataforma, mostrar dashboard de plataforma
  if (usuario.tipo_usuario === 'plataforma') {
    return <DashboardPlataforma usuario={usuario} onLogout={handleLogout} />;
  }

  // Por ahora, otros tipos de usuario verán esto
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenido, {usuario.nombre}</h1>
      <p>Tipo de usuario: {usuario.tipo_usuario}</p>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}

export default App;