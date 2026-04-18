import styles from "../styles/Sidebar.module.css";

const icon = (d: string) => () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const UsersIcon = icon("M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75");
const BriefcaseIcon = icon("M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2");
const BedIcon = icon("M3 9v11M21 9v11M3 14h18M3 9a2 2 0 012-2h14a2 2 0 012 2");
const TagIcon = icon("M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01");
const CalendarIcon = icon("M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z");
const CreditCardIcon = icon("M1 4h22v16H1zM1 10h22");
const ShieldIcon = icon("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z");
const HeadsetIcon = icon("M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z");
const StarIcon = icon("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z");

function HotelIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="12" width="28" height="20" rx="2" fill="currentColor" opacity=".2"/>
      <rect x="8" y="8" width="20" height="24" rx="2" fill="currentColor" opacity=".4"/>
      <rect x="12" y="4" width="12" height="28" rx="2" fill="currentColor"/>
      <rect x="15" y="20" width="6" height="12" rx="1" fill="white" opacity=".8"/>
      <rect x="14" y="11" width="3" height="3" rx=".5" fill="white" opacity=".7"/>
      <rect x="19" y="11" width="3" height="3" rx=".5" fill="white" opacity=".7"/>
    </svg>
  );
}

function ChevronIcon({ flipped }: { flipped: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ transform: flipped ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  );
}

const NAV = [
  { id: "dashboard",   label: "Dashboard",      icon: GridIcon },
  { id: "clientes",    label: "Clientes",        icon: UsersIcon },
  { id: "empleados",   label: "Empleados",       icon: BriefcaseIcon },
  { id: "habitaciones",label: "Habitaciones",    icon: BedIcon },
  { id: "tipos",       label: "Tipos Habitación",icon: TagIcon },
  { id: "reservas",    label: "Reservas",        icon: CalendarIcon },
  { id: "pagos",       label: "Pagos",           icon: CreditCardIcon },
  { id: "usuarios",    label: "Usuarios",        icon: ShieldIcon },
  { id: "recepcionistas", label: "Recepcionistas", icon: HeadsetIcon },
  { id: "administradores", label: "Administradores", icon: StarIcon },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ active, onNavigate, collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <HotelIcon />
        </div>
        {!collapsed && (
          <div className={styles.brandText}>
            <span className={styles.brandName}>D'Vita</span>
            <span className={styles.brandSub}>Hospedaje</span>
          </div>
        )}
        <button className={styles.collapseBtn} onClick={onToggle} title="Colapsar menú">
          <ChevronIcon flipped={collapsed} />
        </button>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {!collapsed && <span className={styles.navSection}>Gestión</span>}
        {NAV.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${active === item.id ? styles.navItemActive : ""}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className={styles.navIcon}><Icon /></span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {active === item.id && !collapsed && <span className={styles.navDot} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.version}>{!collapsed && "v1.0.0 — 2025"}</div>
      </div>
    </aside>
  );
}
