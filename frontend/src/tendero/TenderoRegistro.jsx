import { useState } from "react";

export default function TenderoRegistro() {
  const [form, setForm] = useState({ nombre: "", zona: "", contacto: "" });
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/tenderos/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMensaje("✅ Tendero registrado correctamente");
        setForm({ nombre: "", zona: "", contacto: "" });
      } else {
        setMensaje("❌ Error al registrar tendero");
      }
    } catch (error) {
      console.error(error);
      setMensaje("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Registro de Tendero</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          name="zona"
          placeholder="Zona"
          value={form.zona}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          name="contacto"
          placeholder="Contacto"
          value={form.contacto}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Registrar
        </button>
      </form>
      {mensaje && <p className="mt-3 text-center">{mensaje}</p>}
    </div>
  );
}
