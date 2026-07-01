import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { verificarAccesoHorario } from "./services/api";
import { useToast } from "./components/Toast";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportesPage from "./pages/ReportesPage";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ClientesPage       from "./pages/entities/ClientesPages";
import EmpleadosPage      from "./pages/entities/EmpleadosPage";
import HabitacionesPage   from "./pages/entities/HabitacionesPage";
import TiposPage          from "./pages/entities/TiposPage";
import ReservasPage       from "./pages/entities/ReservaPage";
import PagosPage          from "./pages/entities/PagosPages";
import UsuariosPage       from "./pages/entities/UsuariosPages";
import IncidenciasPage    from "./pages/entities/IncidenciasPage";
import ConsultasPage      from "./pages/entities/ConsultasPage";
import AreasPage          from "./pages/entities/AreasPage";
import HorariosPage       from "./pages/entities/HorariosPage";
import { ToastProvider } from "./components/Toast";
import { ConfirmProvider } from "./hooks/useConfirm";
import PdfLoadingOverlay from "./components/PdfLoading";

type View = "landing" | "login";

const NAV_PERMISOS: Record<string, string | null> = {
  dashboard:    "EMPLEADOS",
  clientes:     "CLIENTES",
  empleados:    "EMPLEADOS",
  habitaciones: "HABITACIONES",
  tipos:        "TIPOS_HABITACION",
  reservas:     "RESERVAS",
  pagos:        "PAGOS",
  usuarios:     "USUARIOS",
  incidencias:  "INCIDENCIAS",
  consultas:    "CONSULTAS",
  areas:        "EMPLEADOS",
  horarios:     "EMPLEADOS",
  reportes:     "EMPLEADOS",
};

function AppContent() {
  const { user, logout, tienePermiso } = useAuth();
  const [view, setView]       = useState<View>("landing");
  const [page, setPage]       = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    setView("landing");
  };

  const toast = useToast();

  useEffect(() => {
    if (!user?.idEmpleado) return;
    const check = async () => {
      try {
        const res = await verificarAccesoHorario(user.idEmpleado!);
        if (!res.acceso) {
          toast.showToast("warning", "Fin de turno", "Tu horario ha finalizado. Seras redirigido.");
          setTimeout(() => handleLogout(), 2000);
        }
      } catch { /* ignore */ }
    };
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.idEmpleado]);

  if (user) {
    const permisoRequerido = NAV_PERMISOS[page];
    let currentPage = !permisoRequerido || tienePermiso(permisoRequerido) ? page : null;
    if (!currentPage) {
      currentPage = Object.keys(NAV_PERMISOS).find(p => {
        const perm = NAV_PERMISOS[p];
        return !perm || tienePermiso(perm);
      }) || "dashboard";
    }

    const renderPage = () => {
      switch (currentPage) {
        case "dashboard":    return <Dashboard />;
        case "clientes":     return <ClientesPage />;
        case "empleados":    return <EmpleadosPage />;
        case "habitaciones": return <HabitacionesPage />;
        case "tipos":        return <TiposPage />;
        case "reservas":     return <ReservasPage />;
        case "pagos":        return <PagosPage />;
        case "usuarios":     return <UsuariosPage />;
        case "incidencias":  return <IncidenciasPage />;
        case "consultas":    return <ConsultasPage />;
        case "areas":        return <AreasPage />;
        case "horarios":     return <HorariosPage />;
        case "reportes":     return <ReportesPage />;
        default:             return <Dashboard />;
      }
    };

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          active={currentPage}
          onNavigate={setPage}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar page={currentPage} onLogout={handleLogout} />
          <main className="flex-1 p-6 overflow-y-auto">
            {renderPage()}
          </main>
        </div>
      </div>
    );
  }

  if (view === "login") return <Login onBack={() => setView("landing")} />;
  return <LandingPage onLogin={() => setView("login")} />;
}

export default function App() {
  return <AuthProvider><ToastProvider><ConfirmProvider><AppContent /><PdfLoadingOverlay /></ConfirmProvider></ToastProvider></AuthProvider>;
}
