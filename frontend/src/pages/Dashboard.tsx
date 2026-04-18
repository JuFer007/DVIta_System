import StatsCard from "../components/StatsCard";
import styles from "../styles/Dashboard.module.css";

function CalIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
}
function BedIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9v11M21 9v11M3 14h18M3 9a2 2 0 012-2h14a2 2 0 012 2"/></svg>;
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
}
function MoneyIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>;
}

const STATS = [
  { title: "Reservas activas",   value: "24",  sub: "+3 hoy",   color: "brand",   icon: CalIcon },
  { title: "Habitaciones disp.", value: "12",  sub: "de 30",    color: "success", icon: BedIcon },
  { title: "Clientes registr.",  value: "187", sub: "+12 mes",  color: "info",    icon: UsersIcon },
  { title: "Ingresos del mes",   value: "S/.8,420", sub: "+18%", color: "accent", icon: MoneyIcon },
];

const RECENT = [
  { id: 1, cliente: "María López",     habitacion: "101 - Estándar",  fecha: "2025-07-09", estado: "CONFIRMADA" },
  { id: 2, cliente: "Carlos Ruiz",     habitacion: "205 - Suite",     fecha: "2025-07-08", estado: "PENDIENTE"  },
  { id: 3, cliente: "Ana Torres",      habitacion: "312 - Familiar",  fecha: "2025-07-08", estado: "CONFIRMADA" },
  { id: 4, cliente: "José Mamani",     habitacion: "108 - Estándar",  fecha: "2025-07-07", estado: "COMPLETADA" },
  { id: 5, cliente: "Lucía Vargas",    habitacion: "220 - Suite",     fecha: "2025-07-06", estado: "CANCELADA"  },
];

const ROOMS = [
  { n: "101", tipo: "Estándar",  estado: "OCUPADA",       precio: 60  },
  { n: "102", tipo: "Estándar",  estado: "DISPONIBLE",    precio: 60  },
  { n: "201", tipo: "Suite",     estado: "DISPONIBLE",    precio: 120 },
  { n: "202", tipo: "Suite",     estado: "MANTENIMIENTO", precio: 120 },
  { n: "301", tipo: "Familiar",  estado: "OCUPADA",       precio: 180 },
  { n: "302", tipo: "Familiar",  estado: "DISPONIBLE",    precio: 180 },
];

const STATUS_COLORS = {
  CONFIRMADA:  { bg: "#edf7f2", color: "#2D7A4F" },
  PENDIENTE:   { bg: "#fff8e1", color: "#B08620" },
  COMPLETADA:  { bg: "#eaf1f8", color: "#2A5F8B" },
  CANCELADA:   { bg: "#fdf0f0", color: "#A33030" },
  DISPONIBLE:  { bg: "#edf7f2", color: "#2D7A4F" },
  OCUPADA:     { bg: "#fdf0f0", color: "#A33030" },
  MANTENIMIENTO: { bg: "#fff8e1", color: "#B08620" },
};

export default function Dashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.welcomeTitle}>Buenos días 👋</h1>
          <p className={styles.welcomeSub}>Aquí tienes el resumen de hoy en Hospedaje D'Vita</p>
        </div>
        <div className={styles.dateChip}>
          <CalIcon />
          {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {STATS.map((s, i) => (
          <StatsCard key={i} {...s} delay={i * 60} />
        ))}
      </div>

      {/* Two columns */}
      <div className={styles.cols}>
        {/* Recent reservas */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Reservas recientes</h3>
            <span className={styles.cardBadge}>{RECENT.length}</span>
          </div>
          <table className={styles.miniTable}>
            <thead>
              <tr>
                <th>Cliente</th><th>Habitación</th><th>Fecha</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {RECENT.map(r => {
              const s = STATUS_COLORS[r.estado as keyof typeof STATUS_COLORS] || {};
                return (
                  <tr key={r.id}>
                    <td className={styles.clientName}>{r.cliente}</td>
                    <td>{r.habitacion}</td>
                    <td className={styles.dateCell}>{r.fecha}</td>
                    <td>
                      <span className={styles.pill} style={{ background: s.bg, color: s.color }}>
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Room overview */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Estado de habitaciones</h3>
          </div>
          <div className={styles.roomsGrid}>
            {ROOMS.map(r => {
            const s = STATUS_COLORS[r.estado as keyof typeof STATUS_COLORS] || {};
              return (
                <div key={r.n} className={styles.roomChip} style={{ borderColor: s.color + "40", background: s.bg }}>
                  <span className={styles.roomNum} style={{ color: s.color }}>#{r.n}</span>
                  <span className={styles.roomTipo}>{r.tipo}</span>
                  <span className={styles.roomEstado} style={{ color: s.color }}>{r.estado}</span>
                  <span className={styles.roomPrecio}>S/.{r.precio}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
