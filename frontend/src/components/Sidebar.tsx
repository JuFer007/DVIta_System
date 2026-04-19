import {
  LayoutDashboard, Users, BriefcaseBusiness, BedDouble,
  Tag, CalendarCheck, CreditCard, ShieldCheck, Headphones, Star, ChevronLeft, ChevronRight, Hotel
} from "lucide-react";

const NAV = [
  { id: "dashboard",       label: "Dashboard",         icon: LayoutDashboard },
  { id: "clientes",        label: "Clientes",          icon: Users },
  { id: "empleados",       label: "Empleados",         icon: BriefcaseBusiness },
  { id: "habitaciones",    label: "Habitaciones",      icon: BedDouble },
  { id: "tipos",           label: "Tipos Habitación",  icon: Tag },
  { id: "reservas",        label: "Reservas",          icon: CalendarCheck },
  { id: "pagos",           label: "Pagos",             icon: CreditCard },
  { id: "usuarios",        label: "Usuarios",          icon: ShieldCheck },
  { id: "recepcionistas",  label: "Recepcionistas",    icon: Headphones },
  { id: "administradores", label: "Administradores",   icon: Star },
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
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 min-h-[64px]">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg">
          <Hotel className="w-4 h-4 text-brand-200" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white text-base leading-tight">D'Vita</p>
            <p className="text-brand-400 text-[10px] uppercase tracking-widest">Hospedaje</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-brand-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 p-3">
        {!collapsed && (
          <p className="text-brand-500 text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5">
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
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all text-left whitespace-nowrap ${
                isActive
                  ? "bg-brand-500/30 text-white border-l-2 border-brand-400"
                  : "text-brand-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`flex-shrink-0 w-4 h-4 ${isActive ? "text-brand-300" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-brand-600 text-[10px]">v1.0.0 — 2025</p>
        </div>
      )}
    </aside>
  );
}
