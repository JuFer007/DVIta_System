import { useAuth } from "./AuthContext";
import styles from "../styles/Topbar.module.css";

const PAGE_NAMES = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  empleados: "Empleados",
  habitaciones: "Habitaciones",
  tipos: "Tipos de Habitación",
  reservas: "Reservas",
  pagos: "Pagos",
  usuarios: "Usuarios",
  recepcionistas: "Recepcionistas",
  administradores: "Administradores",
};

interface TopbarProps {
  page: keyof typeof PAGE_NAMES | string;
}

export default function Topbar({ page }: TopbarProps) {
  const { user, logout } = useAuth();
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.crumb}>Inicio</span>
        <ChevronRight />
        <span className={styles.page}>{(PAGE_NAMES as Record<string, string>)[page] || page}</span>
      </div>

      <div className={styles.right}>
        <div className={styles.userBadge}>
          <div className={styles.avatar}>{user?.nombre?.charAt(0) ?? "U"}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.nombre}</span>
            <span className={styles.userRole}>Administrador</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Cerrar sesión">
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);
