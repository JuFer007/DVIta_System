import { CalendarCheck, BedDouble, Users, CreditCard, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import StatsCard from "../components/StatsCard";
import StatusBadge from "../components/StatusBadge";

const STATS = [
  { title: "Reservas activas",     value: "24",       sub: "+3 hoy",  icon: CalendarCheck, color: "brand"  as const },
  { title: "Habitaciones disp.",   value: "12",       sub: "de 30",   icon: BedDouble,     color: "green"  as const },
  { title: "Clientes registrados", value: "187",      sub: "+12 mes", icon: Users,         color: "blue"   as const },
  { title: "Ingresos del mes",     value: "S/.8,420", sub: "+18%",    icon: CreditCard,    color: "yellow" as const },
];

const RECENT: {
  id: number;
  cliente: string;
  habitacion: string;
  ingreso: string;
  salida: string;
  estado: "CONFIRMADA" | "PENDIENTE" | "COMPLETADA" | "CANCELADA";
}[] = [
  { id: 1, cliente: "María López",  habitacion: "101 — Estándar", ingreso: "2025-07-09", salida: "2025-07-12", estado: "CONFIRMADA" },
  { id: 2, cliente: "Carlos Ruiz",  habitacion: "205 — Suite",    ingreso: "2025-07-10", salida: "2025-07-14", estado: "PENDIENTE"  },
  { id: 3, cliente: "Ana Torres",   habitacion: "312 — Familiar", ingreso: "2025-07-08", salida: "2025-07-10", estado: "CONFIRMADA" },
  { id: 4, cliente: "José Mamani",  habitacion: "108 — Estándar", ingreso: "2025-07-06", salida: "2025-07-08", estado: "COMPLETADA" },
  { id: 5, cliente: "Lucía Vargas", habitacion: "220 — Suite",    ingreso: "2025-07-05", salida: "2025-07-07", estado: "CANCELADA"  },
];

const ROOMS: {
  n: string;
  tipo: string;
  estado: "OCUPADA" | "DISPONIBLE" | "MANTENIMIENTO";
  precio: number;
}[] = [
  { n: "101", tipo: "Estándar",  estado: "OCUPADA",       precio: 60  },
  { n: "102", tipo: "Estándar",  estado: "DISPONIBLE",    precio: 60  },
  { n: "201", tipo: "Suite",     estado: "DISPONIBLE",    precio: 120 },
  { n: "202", tipo: "Suite",     estado: "MANTENIMIENTO", precio: 120 },
  { n: "301", tipo: "Familiar",  estado: "OCUPADA",       precio: 180 },
  { n: "302", tipo: "Familiar",  estado: "DISPONIBLE",    precio: 180 },
];

const ACTIVITY = [
  { text: "Nueva reserva de María López — Hab. 101",     time: "Hace 5 min",  type: "new" },
  { text: "Check-out completado — Carlos Ruiz, Hab. 205", time: "Hace 22 min", type: "done" },
  { text: "Pago recibido — S/. 360 — Transferencia",     time: "Hace 1h",     type: "payment" },
  { text: "Reserva cancelada — Lucía Vargas, Hab. 220",  time: "Hace 2h",     type: "cancel" },
];

const activityIcon = (type: string) => {
  if (type === "new")     return <CalendarCheck className="w-3.5 h-3.5 text-brand-500" />;
  if (type === "done")    return <CheckCircle2  className="w-3.5 h-3.5 text-green-500" />;
  if (type === "payment") return <CreditCard    className="w-3.5 h-3.5 text-blue-500"  />;
  if (type === "cancel")  return <XCircle       className="w-3.5 h-3.5 text-red-400"   />;
  return <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />;
};

const roomStateColor = {
  OCUPADA:       "bg-red-50   border-red-200   text-red-700",
  DISPONIBLE:    "bg-green-50 border-green-200 text-green-700",
  MANTENIMIENTO: "bg-yellow-50 border-yellow-200 text-yellow-700",
};

export default function Dashboard() {
  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const capitalized = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="flex flex-col gap-6 max-w-[1200px]">

      {/* ── Bienvenida ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold text-neutral-900 leading-tight">
            Buenos días 👋
          </h1>
          <p className="text-[14px] text-neutral-500 mt-1 font-light">
            Resumen del día — Hospedaje D'Vita
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-sm text-[13px] text-neutral-500 shadow-sm">
          <CalendarCheck className="w-4 h-4 text-brand-500" />
          {capitalized}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <StatsCard key={i} {...s} />
        ))}
      </div>

      {/* ── Fila principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Reservas recientes — ocupa 2/3 */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-4 h-4 text-brand-500" />
              <h3 className="font-semibold text-neutral-800 text-[14px]">Reservas recientes</h3>
              <span className="bg-brand-100 text-brand-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {RECENT.length}
              </span>
            </div>
            <button className="text-[12px] text-brand-500 hover:text-brand-700 font-medium transition-colors">
              Ver todas →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="px-5 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Habitación</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ingreso</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Estado</th>
                </tr>
              </thead>
              <tbody>
                {RECENT.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-neutral-50 hover:bg-brand-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-medium text-neutral-800">{r.cliente}</td>
                    <td className="px-5 py-3 text-neutral-500 text-[12px]">{r.habitacion}</td>
                    <td className="px-5 py-3 text-neutral-500 text-[12px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-300" />
                        {r.ingreso}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actividad reciente — 1/3 */}
        <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-100">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <h3 className="font-semibold text-neutral-800 text-[14px]">Actividad reciente</h3>
          </div>
          <div className="p-4 flex flex-col gap-1">
            {ACTIVITY.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-sm hover:bg-neutral-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {activityIcon(a.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-neutral-700 font-medium leading-snug">{a.text}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Estado habitaciones ── */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <BedDouble className="w-4 h-4 text-brand-500" />
            <h3 className="font-semibold text-neutral-800 text-[14px]">Estado de habitaciones</h3>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-green-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Disponible
            </span>
            <span className="flex items-center gap-1.5 text-red-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Ocupada
            </span>
            <span className="flex items-center gap-1.5 text-yellow-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-yellow-500" /> Mantenimiento
            </span>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ROOMS.map((r) => (
            <div
              key={r.n}
              className={`border rounded-sm p-3.5 flex flex-col gap-1.5 hover:shadow-sm transition-all cursor-pointer ${roomStateColor[r.estado]}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-[16px]">#{r.n}</span>
              </div>
              <span className="text-[11px] font-medium opacity-70">{r.tipo}</span>
              <span className="text-[12px] font-bold">S/.{r.precio}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-60">{r.estado}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Resumen ocupación ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Ocupación actual", value: "67%",     color: "bg-brand-500",  sub: "4 de 6 habitaciones" },
          { label: "Ingresos hoy",     value: "S/.480",  color: "bg-green-500",  sub: "4 noches facturadas" },
          { label: "Check-outs hoy",   value: "2",       color: "bg-blue-500",   sub: "Hab. 108 y 220" },
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

    </div>
  );
}
