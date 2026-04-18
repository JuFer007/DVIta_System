// frontend/src/pages/Login.tsx
import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import styles from "../styles/Login.module.css";

interface LoginProps {
  onBack?: () => void;
}

export default function Login({ onBack }: LoginProps) {
  const { login } = useAuth();
  const [form, setForm] = useState({ usuario: "", contrasena: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.usuario || !form.contrasena) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      // Intentar autenticación contra el backend
      const res = await fetch("http://localhost:8080/api/usuarios", {
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const usuarios: any[] = await res.json();
        const match = usuarios.find(
          (u: any) =>
            u.nombreUsuario === form.usuario && u.contrasena === form.contrasena
        );

        if (match) {
          // Obtener datos del empleado asociado
          const empRes = await fetch(
            `http://localhost:8080/api/empleados/${match.empleado?.idEmpleado || match.empleado}`
          );
          const empleado = empRes.ok ? await empRes.json() : {};

          login({
            ...form,
            nombre: `${empleado.nombre || "Usuario"} ${empleado.apellidoP || ""}`.trim(),
            idUsuario: match.idUsuario,
            empleado: match.empleado,
          });
          return;
        } else {
          setError("Usuario o contraseña incorrectos.");
        }
      } else {
        // Backend no disponible → modo demo
        const ok = login({ ...form, nombre: "Cristian Huamán", rol: "Administrador" });
        if (!ok) setError("Credenciales incorrectas.");
      }
    } catch {
      // Backend no disponible → modo demo
      const ok = login({ ...form, nombre: "Cristian Huamán", rol: "Administrador" });
      if (!ok) setError("Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Left hero panel */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.logo}>
            <HotelIcon />
            <span>D'Vita</span>
          </div>
          <h1 className={styles.heroTitle}>Hospedaje<br />D'Vita</h1>
          <p className={styles.heroSubtitle}>
            Gestiona reservas, habitaciones y clientes desde un solo lugar.
          </p>
          <div className={styles.heroBadges}>
            <span className={styles.badge}>Reservas</span>
            <span className={styles.badge}>Habitaciones</span>
            <span className={styles.badge}>Clientes</span>
            <span className={styles.badge}>Pagos</span>
          </div>
        </div>
        <div className={styles.heroPattern} />
      </div>

      {/* Right form panel */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          {onBack && (
            <button className={styles.backBtn} onClick={onBack}>
              ← Volver al inicio
            </button>
          )}

          <div className={styles.formHeader}>
            <div className={styles.formLogo}>
              <HotelIcon size={28} />
            </div>
            <h2 className={styles.formTitle}>Bienvenido</h2>
            <p className={styles.formSubtitle}>Ingresa tus credenciales para continuar</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Usuario</label>
              <div className={styles.inputWrapper}>
                <UserIcon />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="nombre.usuario"
                  value={form.usuario}
                  onChange={e => setForm(f => ({ ...f, usuario: e.target.value }))}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <div className={styles.inputWrapper}>
                <LockIcon />
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={form.contrasena}
                  onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? <span className={styles.spinner} /> : "Iniciar sesión"}
            </button>
          </form>

          <p className={styles.formFooter}>
            Sistema de gestión — Hospedaje D'Vita © 2025
          </p>
        </div>
      </div>
    </div>
  );
}

function HotelIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect x="4" y="12" width="28" height="20" rx="2" fill="currentColor" opacity=".15" />
      <rect x="8" y="8" width="20" height="24" rx="2" fill="currentColor" opacity=".3" />
      <rect x="12" y="4" width="12" height="28" rx="2" fill="currentColor" />
      <rect x="15" y="20" width="6" height="12" rx="1" fill="white" opacity=".8" />
      <rect x="14" y="11" width="3" height="3" rx=".5" fill="white" opacity=".7" />
      <rect x="19" y="11" width="3" height="3" rx=".5" fill="white" opacity=".7" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}