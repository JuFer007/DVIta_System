// src/pages/Login.tsx
import { useState } from "react";
import { Hotel, User, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

interface Props {
  onBack: () => void;
}

export default function Login({ onBack }: Props) {
  const { login } = useAuth();
  const [form, setForm] = useState({ usuario: "", contrasena: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.usuario || !form.contrasena) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);

    try {
      const usuarios = await authService.getUsuarios();
      const match = usuarios.find(
        (u: any) => u.nombreUsuario === form.usuario && u.contrasena === form.contrasena
      );
      if (!match) {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      let nombre = match.empleado?.nombre ?? "Usuario";
      try {
        const empId = match.empleado?.idEmpleado ?? match.empleado;
        if (empId) {
          const emp = await authService.getEmpleado(empId);
          nombre = `${emp.nombre ?? ""} ${emp.apellidoP ?? ""}`.trim();
        }
      } catch {
        // si falla, usamos el nombre parcial
      }

      login({
        idUsuario: match.idUsuario,
        nombreUsuario: match.nombreUsuario,
        nombre,
        rol: "Administrador",
      });
    } catch {
      // Modo demo si el backend no responde
      login({
        idUsuario: 0,
        nombreUsuario: form.usuario,
        nombre: "Usuario Demo",
        rol: "Administrador",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-center flex-1 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative z-10 max-w-sm animate-fade-up">
          <div className="flex items-center gap-2 text-brand-200 mb-12">
            <Hotel className="w-6 h-6" />
            <span className="font-display font-bold text-xl">D'Vita</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Gestiona tu hospedaje desde un solo lugar
          </h1>
          <p className="text-brand-200 text-base leading-relaxed mb-8">
            Reservas, habitaciones, clientes y pagos en un sistema limpio y eficiente.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Reservas", "Habitaciones", "Clientes", "Pagos", "Empleados"].map((b) => (
              <span key={b} className="bg-white/10 border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center flex-1 bg-white p-8">
        <div className="w-full max-w-sm animate-fade-up">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
              <Hotel className="w-6 h-6 text-white" />
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-1">Bienvenido</h2>
          <p className="text-gray-500 text-sm text-center mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 bg-gray-50"
                  type="text"
                  placeholder="nombre.usuario"
                  value={form.usuario}
                  onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 bg-gray-50"
                  type="password"
                  placeholder="••••••••"
                  value={form.contrasena}
                  onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-800 text-white font-semibold rounded-lg hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Sistema de gestión — Hospedaje D'Vita © 2025
          </p>
        </div>
      </div>
    </div>
  );
}
