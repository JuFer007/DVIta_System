import { useState, useEffect } from "react";
import {
  CalendarCheck, BedDouble, Users, CreditCard,
  TrendingUp, Clock, CheckCircle2, XCircle,
  AlertCircle, Sun, Sunset, Moon, LogIn, LogOut,
  BriefcaseBusiness, RefreshCw,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import StatusBadge from "../components/StatusBadge";
import { dashboardService } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  reservasActivas: number;
  reservasHoy: number;
  habitacionesDisponibles: number;
  habitacionesTotal: number;
  clientesTotal: number;
  ingresosMes: number;
  pctCambioIngresos: number;
  checkInsHoy: number;
  checkOutsHoy: number;
  empleadosTotal: number;
}

interface ReservaReciente {
  id: number;
  cliente: string;
  habitacion: string | number;
  tipoHabitacion: string;
  fechaIngreso: string;
  fechaSalida: string;
  estado: string;
}

interface HabitacionEstado {
  id: number;
  numero: number;
  tipo: string;
  estado: string;
  precio: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `S/.${n.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function pctLabel(pct: number) {
  if (pct === 0) return "= igual mes anterior";
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}% vs mes anterior`;
}

function getGreeting(): { text: string; icon: React.ReactElement } {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return { text: "Buenos días",   icon: <Sun    className="w-6 h-6 text-yellow-500" /> };
  if (h >= 12 && h < 19) return { text: "Buenas tardes", icon: <Sunset className="w-6 h-6 text-orange-400" /> };
  return                         { text: "Buenas noches", icon: <Moon   className="w-6 h-6 text-indigo-400" /> };
}

const roomStateColor: Record<string, string> = {
  OCUPADA:       "bg-red-50    border-red-200    text-red-700",
  DISPONIBLE:    "bg-green-50  border-green-200  text-green-700",
  MANTENIMIENTO: "bg-yellow-50 border-yellow-200 text-yellow-700",
};

const activityIcon = (estado: string) => {
  if (estado === "CONFIRMADA")  return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
  if (estado === "CANCELADA")   return <XCircle      className="w-3.5 h-3.5 text-red-400"   />;
  if (estado === "COMPLETADA")  return <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />;
  return <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-100 rounded ${className}`} />;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [reservas,   setReservas]   = useState<ReservaReciente[]>([]);
  const [habitaciones, setHabitaciones] = useState<HabitacionEstado[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r, h] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getReservasRecientes(),
        dashboardService.getHabitacionesEstado(),
      ]);
      setStats(s);
      setReservas(r);
      setHabitaciones(h);
      setLastUpdate(new Date());
    } catch {
      setError("No se pudo conectar con el servidor. Mostrando datos de ejemplo.");
      // Demo fallback
      setStats({
        reservasActivas: 24, reservasHoy: 3,
        habitacionesDisponibles: 12, habitacionesTotal: 30,
        clientesTotal: 187, ingresosMes: 8420,
        pctCambioIngresos: 18, checkInsHoy: 2, checkOutsHoy: 3,
        empleadosTotal: 8,
      });
      setReservas([
        { id: 1, cliente: "María López",  habitacion: 101, tipoHabitacion: "Estándar", fechaIngreso: "2026-04-22", fechaSalida: "2026-04-25", estado: "CONFIRMADA" },
        { id: 2, cliente: "Carlos Ruiz",  habitacion: 205, tipoHabitacion: "Suite",    fechaIngreso: "2026-04-23", fechaSalida: "2026-04-27", estado: "PENDIENTE"  },
        { id: 3, cliente: "Ana Torres",   habitacion: 312, tipoHabitacion: "Familiar", fechaIngreso: "2026-04-21", fechaSalida: "2026-04-23", estado: "CONFIRMADA" },
        { id: 4, cliente: "José Mamani",  habitacion: 108, tipoHabitacion: "Estándar", fechaIngreso: "2026-04-19", fechaSalida: "2026-04-21", estado: "COMPLETADA" },
        { id: 5, cliente: "Lucía Vargas", habitacion: 220, tipoHabitacion: "Suite",    fechaIngreso: "2026-04-18", fechaSalida: "2026-04-20", estado: "CANCELADA"  },
      ]);
      setHabitaciones([
        { id: 1, numero: 101, tipo: "Estándar",  estado: "OCUPADA",       precio: 60  },
        { id: 2, numero: 102, tipo: "Estándar",  estado: "DISPONIBLE",    precio: 60  },
        { id: 3, numero: 201, tipo: "Suite",     estado: "DISPONIBLE",    precio: 120 },
        { id: 4, numero: 202, tipo: "Suite",     estado: "MANTENIMIENTO", precio: 120 },
        { id: 5, numero: 301, tipo: "Familiar",  estado: "OCUPADA",       precio: 180 },
        { id: 6, numero: 302, tipo: "Familiar",  estado: "DISPONIBLE",    precio: 180 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const capitalized = today.charAt(0).toUpperCase() + today.slice(1);
  const greeting = getGreeting();

  // Derived
  const pctOcupacion = stats
    ? stats.habitacionesTotal > 0
      ? (((stats.habitacionesTotal - stats.habitacionesDisponibles) / stats.habitacionesTotal) * 100).toFixed(0)
      : "0"
    : "—";

  const STATS_CARDS = stats ? [
    {
      title: "Reservas activas",
      value: stats.reservasActivas,
      sub: `${stats.reservasHoy > 0 ? "+" : ""}${stats.reservasHoy} hoy`,
      icon: CalendarCheck,
      color: "brand" as const,
    },
    {
      title: "Habitaciones disp.",
      value: stats.habitacionesDisponibles,
      sub: `de ${stats.habitacionesTotal} totales`,
      icon: BedDouble,
      color: "green" as const,
    },
    {
      title: "Clientes registrados",
      value: stats.clientesTotal,
      sub: `${stats.empleadosTotal} empleados`,
      icon: Users,
      color: "blue" as const,
    },
    {
      title: "Ingresos del mes",
      value: fmt(stats.ingresosMes),
      sub: pctLabel(stats.pctCambioIngresos),
      icon: CreditCard,
      color: "yellow" as const,
    },
  ] : [];

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold text-neutral-900 leading-tight flex items-center gap-2.5">
            {greeting.icon}
            {greeting.text}
          </h1>
          <p className="text-[14px] text-neutral-500 mt-1 font-light">
            Resumen del día — Hospedaje D'Vita
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="flex items-center gap-1.5 text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3 h-3" /> Datos de ejemplo
            </span>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {lastUpdate ? `Actualizado ${lastUpdate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}` : "Actualizar"}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-sm text-[13px] text-neutral-500 shadow-sm">
            <CalendarCheck className="w-4 h-4 text-brand-500" />
            {capitalized}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : STATS_CARDS.map((s, i) => <StatsCard key={i} {...s} />)
        }
      </div>

      {/* ── Check-in / Check-out strip ── */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-neutral-200 rounded-sm p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <LogIn className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-neutral-400">Check-ins hoy</p>
              <p className="font-display text-[22px] font-bold text-green-600 leading-none mt-0.5">{stats.checkInsHoy}</p>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-sm p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-neutral-400">Check-outs hoy</p>
              <p className="font-display text-[22px] font-bold text-blue-600 leading-none mt-0.5">{stats.checkOutsHoy}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Fila principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Reservas recientes — 2/3 */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-4 h-4 text-brand-500" />
              <h3 className="font-semibold text-neutral-800 text-[14px]">Reservas recientes</h3>
              {!loading && (
                <span className="bg-brand-100 text-brand-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{reservas.length}</span>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-5 flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    {["Cliente", "Habitación", "Ingreso", "Salida", "Estado"].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservas.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-neutral-400 text-[13px]">Sin reservas recientes</td></tr>
                  ) : reservas.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-50 hover:bg-brand-50/50 transition-colors cursor-pointer">
                      <td className="px-5 py-3 font-medium text-neutral-800">{r.cliente}</td>
                      <td className="px-5 py-3 text-neutral-500 text-[12px]">
                        Hab. {r.habitacion}
                        {r.tipoHabitacion && <span className="ml-1 text-neutral-300">— {r.tipoHabitacion}</span>}
                      </td>
                      <td className="px-5 py-3 text-neutral-500 text-[12px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-neutral-300" />
                          {r.fechaIngreso}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-500 text-[12px]">{r.fechaSalida}</td>
                      <td className="px-5 py-3"><StatusBadge status={r.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Actividad reciente — 1/3 */}
        <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-100">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <h3 className="font-semibold text-neutral-800 text-[14px]">Últimas reservas</h3>
          </div>
          <div className="p-4 flex flex-col gap-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded" />)
            ) : reservas.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-sm hover:bg-neutral-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {activityIcon(r.estado)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-neutral-700 font-medium leading-snug truncate">{r.cliente} — Hab. {r.habitacion}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{r.fechaIngreso} → {r.fechaSalida}</p>
                </div>
              </div>
            ))}
            {!loading && reservas.length === 0 && (
              <p className="text-[12px] text-neutral-400 text-center py-6">Sin actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Estado habitaciones ── */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <BedDouble className="w-4 h-4 text-brand-500" />
            <h3 className="font-semibold text-neutral-800 text-[14px]">Estado de habitaciones</h3>
            {!loading && <span className="bg-neutral-100 text-neutral-600 text-[11px] font-bold px-2 py-0.5 rounded-full">{habitaciones.length}</span>}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            {[
              { label: "Disponible",    color: "bg-green-500" },
              { label: "Ocupada",       color: "bg-red-500" },
              { label: "Mantenimiento", color: "bg-yellow-500" },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5 text-neutral-500 font-medium">
                <div className={`w-2 h-2 rounded-full ${color}`} /> {label}
              </span>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="p-5 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-sm" />)}
          </div>
        ) : (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {habitaciones.length === 0 ? (
              <div className="col-span-6 py-8 text-center text-neutral-400 text-[13px]">Sin habitaciones registradas</div>
            ) : habitaciones.map((h) => (
              <div
                key={h.id}
                className={`border rounded-sm p-4 flex flex-col gap-1.5 hover:shadow-sm transition-all cursor-pointer ${roomStateColor[h.estado] || "bg-gray-50 border-gray-200 text-gray-600"}`}
              >
                <span className="font-display font-bold text-[18px]">#{h.numero}</span>
                <span className="text-[11px] font-medium opacity-70">{h.tipo}</span>
                <span className="text-[13px] font-bold">S/.{h.precio}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-60">{h.estado}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Resumen ocupación ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Ocupación actual",
              value: `${pctOcupacion}%`,
              color: "bg-brand-500",
              sub: `${stats.habitacionesTotal - stats.habitacionesDisponibles} de ${stats.habitacionesTotal} habitaciones`,
            },
            {
              label: "Ingresos del mes",
              value: fmt(stats.ingresosMes),
              color: "bg-green-500",
              sub: pctLabel(stats.pctCambioIngresos),
            },
            {
              label: "Empleados activos",
              value: stats.empleadosTotal,
              color: "bg-blue-500",
              sub: `${stats.reservasActivas} reservas activas`,
            },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-sm p-5 shadow-sm flex items-center gap-4">
              <div className={`w-2 self-stretch rounded-full ${item.color}`} />
              <div>
                <p className="text-[12px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="font-display text-[28px] font-bold text-neutral-900 leading-none mb-1">{item.value}</p>
                <p className="text-[12px] text-neutral-400">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
