import { CalendarCheck, BedDouble, Users, CreditCard } from "lucide-react";
import StatsCard from "../components/StatsCard";
import StatusBadge from "../components/StatusBadge";

const STATS = [
  { title: "Reservas activas",     value: "24",      sub: "+3 hoy",  icon: CalendarCheck, color: "brand"  as const },
  { title: "Habitaciones disp.",   value: "12",      sub: "de 30",   icon: BedDouble,     color: "green"  as const },
  { title: "Clientes registrados", value: "187",     sub: "+12 mes", icon: Users,         color: "blue"   as const },
  { title: "Ingresos del mes",     value: "S/.8,420",sub: "+18%",    icon: CreditCard,    color: "yellow" as const },
];

const RECENT = [
  { id: 1, cliente: "María López",  habitacion: "101 - Estándar", fecha: "2025-07-09", estado: "CONFIRMADA" },
  { id: 2, cliente: "Carlos Ruiz",  habitacion: "205 - Suite",    fecha: "2025-07-08", estado: "PENDIENTE"  },
  { id: 3, cliente: "Ana Torres",   habitacion: "312 - Familiar", fecha: "2025-07-08", estado: "CONFIRMADA" },
  { id: 4, cliente: "José Mamani",  habitacion: "108 - Estándar", fecha: "2025-07-07", estado: "COMPLETADA" },
  { id: 5, cliente: "Lucía Vargas", habitacion: "220 - Suite",    fecha: "2025-07-06", estado: "CANCELADA"  },
];

const ROOMS = [
  { n: "101", tipo: "Estándar",  estado: "OCUPADA",       precio: 60 },
  { n: "102", tipo: "Estándar",  estado: "DISPONIBLE",    precio: 60 },
  { n: "201", tipo: "Suite",     estado: "DISPONIBLE",    precio: 120 },
  { n: "202", tipo: "Suite",     estado: "MANTENIMIENTO", precio: 120 },
  { n: "301", tipo: "Familiar",  estado: "OCUPADA",       precio: 180 },
  { n: "302", tipo: "Familiar",  estado: "DISPONIBLE",    precio: 180 },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Bienvenida */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Buenos días 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen del día en Hospedaje D'Vita</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500">
          <CalendarCheck className="w-4 h-4 text-brand-500" />
          {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <StatsCard key={i} {...s} />
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Reservas recientes */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Reservas recientes</h3>
            <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {RECENT.length}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Habitación</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {RECENT.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-brand-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{r.cliente}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{r.habitacion}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={r.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estado habitaciones */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Estado de habitaciones</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {ROOMS.map((r) => (
              <div
                key={r.n}
                className="border border-gray-100 rounded-lg p-3 flex flex-col gap-1 hover:border-brand-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-sm">#{r.n}</span>
                  <StatusBadge status={r.estado} />
                </div>
                <span className="text-xs text-gray-400">{r.tipo}</span>
                <span className="text-xs font-medium text-brand-600">S/.{r.precio}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
