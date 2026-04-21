import { LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PAGE_NAMES: Record<string, string> = {
  dashboard:    "Dashboard",
  clientes:     "Clientes",
  empleados:    "Empleados",
  habitaciones: "Habitaciones",
  tipos:        "Tipos de Habitación",
  reservas:     "Reservas",
  pagos:        "Pagos",
  usuarios:     "Usuarios",
  horarios:     "Horarios",
  reportes:     "Reportes",
};

interface Props {
  page: string;
  onLogout: () => void;
}

export default function Topbar({ page, onLogout }: Props) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-gray-100 sticky top-0 z-10 gap-4">
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <span>Inicio</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 font-medium">{PAGE_NAMES[page] ?? page}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.nombre?.charAt(0) ?? "U"}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-800">{user?.nombre}</span>
            <span className="text-xs text-gray-400">Administrador</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          className="w-8 h-8 flex items-center justify-center text-gray-400 border border-gray-200 rounded-lg hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
