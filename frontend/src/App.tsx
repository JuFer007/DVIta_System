import { useState } from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ChatBot from "./components/ChatBot";
import {
  ClientesPage,
  EmpleadosPage,
  HabitacionesPage,
  TiposPage,
  ReservasPage,
  PagosPage,
  UsuariosPage,
  RecepcionistasPage,
  AdministradoresPage,
} from "./pages/EntityPages";
import "./index.css";
import styles from "./App.module.css";

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <Login />;

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
    <div className={styles.layout}>
      <Sidebar
        active={page}
        onNavigate={setPage}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />
      <div className={styles.main}>
        <Topbar page={page} />
        <div className={styles.content}>
          {renderPage()}
        </div>
      </div>
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
