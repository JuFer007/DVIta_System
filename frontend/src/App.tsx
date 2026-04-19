import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import {
  ClientesPage, EmpleadosPage, HabitacionesPage, TiposPage,
  ReservasPage, PagosPage, UsuariosPage, RecepcionistasPage, AdministradoresPage,
} from "./pages/EntityPages";

type View = "landing" | "login";

function AppContent() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("landing");
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  if (user) {
    const renderPage = () => {
      switch (page) {
        case "dashboard":       return <Dashboard />;
        case "clientes":        return <ClientesPage />;
        case "empleados":       return <EmpleadosPage />;
        case "habitaciones":    return <HabitacionesPage />;
        case "tipos":           return <TiposPage />;
        case "reservas":        return <ReservasPage />;
        case "pagos":           return <PagosPage />;
        case "usuarios":        return <UsuariosPage />;
        case "recepcionistas":  return <RecepcionistasPage />;
        case "administradores": return <AdministradoresPage />;
        default:                return <Dashboard />;
      }
    };
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar active={page} onNavigate={setPage} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar page={page} />
          <main className="flex-1 p-6 overflow-y-auto">{renderPage()}</main>
        </div>
      </div>
    );
  }

  if (view === "login") return <Login onBack={() => setView("landing")} />;
  return <LandingPage onLogin={() => setView("login")} />;
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
