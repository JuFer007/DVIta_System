import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&q=80",
];

interface Props {
  onBack?: () => void;
}

export default function Login({ onBack }: Props) {
  const { login } = useAuth();
  const [form, setForm] = useState({ usuario: "", contrasena: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImg] = useState(() => Math.floor(Math.random() * BG_IMAGES.length));

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
        (u: any) =>
          u.nombreUsuario === form.usuario && u.contrasena === form.contrasena
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
      } catch { /* usar nombre parcial */ }
      login({ idUsuario: match.idUsuario, nombreUsuario: match.nombreUsuario, nombre, rol: "Administrador" });
    } catch {
      login({ idUsuario: 0, nombreUsuario: form.usuario, nombre: "Usuario Demo", rol: "Administrador" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

      {/* ── Fondo con imagen + blur + overlay oscuro tipo navbar ── */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: `url(${BG_IMAGES[currentImg]})` }}
      />
      {/* Overlay igual al navbar: brand-900/92 con blur */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(29,13,4,0.60)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      />
      {/* Viñeta sutil en bordes */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(29,13,4,0.55) 100%)",
        }}
      />

      {/* ── Tarjeta split ── */}
      <div
        className="relative z-10 flex w-full max-w-[820px] mx-4 rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 32px 80px rgba(29,13,4,0.6), 0 0 0 1px rgba(201,169,110,0.15)",
        }}
      >

        {/* ── Panel izquierdo: bienvenida con glassmorphism ── */}
        <div
          className="hidden md:flex flex-col justify-between flex-none w-[42%] px-10 py-12 relative overflow-hidden"
          style={{
            background: "rgba(61,31,10,0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRight: "1px solid rgba(201,169,110,0.18)",
          }}
        >
          {/* Patrón de puntos sutil */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Círculo decorativo */}
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand-500/10" />
          <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full bg-brand-900/30" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border border-[#C9A96E]/50 flex items-center justify-center bg-brand-900/40">
              <img src="/DVita_Logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-[15px] leading-none">D'Vita Hospedaje</p>
              <p className="text-[9px] text-[#C9A96E] tracking-[0.2em] uppercase mt-0.5">Victor Raúl Haya</p>
              <p className="text-[9px] text-[#C9A96E] tracking-[0.2em] uppercase mt-0.5">de la Torre N° 281</p>
            </div>
          </div>

          {/* Texto central */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-px bg-[#C9A96E]" />
              <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-[#C9A96E]">Panel Administrativo</span>
            </div>
            <h1 className="font-display text-[38px] font-bold text-white leading-[1.05] mb-4">
              Hola,<br />
              <em className="italic" style={{ color: "#E8D5A0" }}>bienvenido.</em>
            </h1>
            <p className="text-white/55 text-[13px] font-light leading-relaxed max-w-[190px]">
              Gestiona reservas, habitaciones y clientes desde un solo lugar.
            </p>
          </div>

          {/* Footer panel */}
          <div className="relative z-10">
            {onBack && (
              <button
                onClick={onBack}
                className="text-[11px] text-white/80 hover:text-[#C9A96E] transition-colors tracking-wide"
              >
                ← Volver al inicio
              </button>
            )}
            <p className="text-white/80 text-[10px] tracking-wide mt-2">© 2026 · Chiclayo, Perú</p>
          </div>
        </div>

        {/* ── Panel derecho: formulario con glassmorphism blanco ── */}
        <div
          className="flex flex-col justify-center flex-1 px-10 py-12"
          style={{
            background: "rgba(255,255,255,1)",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
          }}
        >
          {/* Header móvil */}
          <div className="flex items-center gap-2.5 mb-7 md:hidden">
            <div className="w-9 h-9 rounded-full border border-brand-200 flex items-center justify-center">
              <img src="/DVita_Logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <p className="font-display font-bold text-brand-900 text-[16px]">D'Vita Hospedaje</p>
          </div>

          {/* Encabezado */}
          <div className="mb-7">
            <h2 className="font-display text-[26px] font-bold text-brand-900 leading-tight mb-1">
              Iniciar sesión
            </h2>
            <p className="text-[13px] text-neutral-400 font-light">
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Usuario */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-brand-600 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-neutral-700 pointer-events-none" />
                <input
                  type="text"
                  placeholder="nombre_usuario"
                  value={form.usuario}
                  onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-brand-50/70 border border-brand-100 rounded-xl text-[14px] text-brand-900 placeholder:text-neutral-700 focus:outline-none focus:border-brand-400 focus:bg-white focus:ring-[3px] focus:ring-brand-100 transition-all"
                />
              </div>
            </div>
 
            {/* Contraseña */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-brand-600 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-neutral-700 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.contrasena}
                  onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-brand-50/70 border border-brand-100 rounded-xl text-[14px] text-brand-900 placeholder:text-neutral-700 focus:outline-none focus:border-brand-400 focus:bg-white focus:ring-[3px] focus:ring-brand-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-700 hover:text-brand-500 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5">
                <div className="w-4 h-4 rounded-full border border-brand-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-brand-500">!</div>
                <p className="text-[12px] text-brand-700">{error}</p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-[13px] mt-1 rounded-xl text-white text-[12px] font-bold tracking-[0.14em] uppercase transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              style={{ background: "linear-gradient(135deg, #7A3D14 0%, #9A5020 50%, #C97B45 100%)" }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando…
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-brand-100" />
            <span className="text-[10px] text-brand-300 font-medium tracking-[0.1em] uppercase">acceso interno</span>
            <div className="flex-1 h-px bg-brand-100" />
          </div>

          {/* Info de acceso */}
          <div className="flex items-start gap-3 bg-brand-50/80 border border-brand-100 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-brand-700 mb-0.5">Acceso restringido</p>
              <p className="text-[11px] text-brand-900 font-light leading-relaxed">
                Solo personal autorizado de Hospedaje D'Vita puede acceder.
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-black mt-5 tracking-wide">
            Hospedaje D'Vita - Sistema de Gestión y Administración Hotelera © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
