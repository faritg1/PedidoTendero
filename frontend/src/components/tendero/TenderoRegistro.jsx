import React, { useState } from "react";
import { registrarTendero } from "../../services/tenderoService";

const TenderoRegistro = () => {
  const [formData, setFormData] = useState({ nombre: "", zona: "", contacto: "" });
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await registrarTendero(formData);
    if (res?.ok) {
      setMensaje("✅ Tendero registrado correctamente");
      setFormData({ nombre: "", zona: "", contacto: "" });
    } else {
      setMensaje("❌ Error al registrar el tendero");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-4">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-400 mb-6">
          🏪 Registro de Tendero
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {["nombre", "zona", "contacto"].map((campo) => (
            <div key={campo}>
              <label className="block text-sm font-medium text-slate-300 mb-1 capitalize">
                {campo}
              </label>
              <input
                type="text"
                name={campo}
                value={formData[campo]}
                onChange={handleChange}
                className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg shadow-lg hover:bg-indigo-500 transition-all duration-300 hover:scale-[1.02]"
          >
            Registrar Tendero
          </button>
        </form>

        {mensaje && (
          <p
            className={`mt-5 text-center text-sm font-medium ${
              mensaje.includes("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
};

export default TenderoRegistro;
