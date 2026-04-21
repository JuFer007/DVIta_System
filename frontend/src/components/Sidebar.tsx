import {
  LayoutDashboard, Users, BriefcaseBusiness, BedDouble, Bed,
  Tag, CalendarCheck, CreditCard, ChevronLeft, ChevronRight,
  User, Hotel, Clock, BarChart2
} from "lucide-react";

const NAV = [
  { id: "dashboard",    label: "Dashboard",        icon: LayoutDashboard },
  { id: "clientes",     label: "Clientes",         icon: Users },
  { id: "empleados",    label: "Empleados",        icon: BriefcaseBusiness },
  { id: "habitaciones", label: "Habitaciones",     icon: BedDouble },
  { id: "tipos",        label: "Tipos Habitación", icon: Bed },
  { id: "reservas",     label: "Reservas",         icon: CalendarCheck },
  { id: "pagos",        label: "Pagos",            icon: CreditCard },
  { id: "usuarios",     label: "Usuarios",         icon: User },
  { id: "horarios",     label: "Horarios",         icon: Clock },
  { id: "reportes",     label: "Reportes",         icon: BarChart2 },
];

interface Props {
  active: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ active, onNavigate, collapsed, onToggle }: Props) {
  return (
    <aside
      className={`flex flex-col min-h-screen bg-brand-900 transition-all duration-300 flex-shrink-0 sticky top-0 h-screen overflow-y-auto overflow-x-hidden ${
        collapsed ? "w-20" : "w-70"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 min-h-[72px]">
        <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-white/10 rounded-lg">
          <img src="/DVita_Logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white text-[17px] leading-tight">D'Vita</p>
            <p className="text-brand-400 text-[11px] uppercase tracking-widest">Hospedaje</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-brand-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-4">
        {!collapsed && (
          <p className="text-brand-500 text-[10px] font-semibold uppercase tracking-widest px-3 py-2">
            Gestión
          </p>
        )}
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all text-left whitespace-nowrap w-full ${
                isActive
                  ? "bg-brand-500/30 text-white border-l-2 border-brand-400"
                  : "text-brand-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`flex-shrink-0 w-[18px] h-[18px] ${isActive ? "text-brand-300" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-brand-200 text-[11px]">© 2026 · Chiclayo, Perú</p>
          <p className="text-brand-200 text-[11px] mt-0.5">Victor Raúl Haya de la Torre</p>
        </div>
      )}
    </aside>
  );
}
