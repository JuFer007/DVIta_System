import { createContext, useContext, useState, type ReactNode } from "react";

export type Acceso = "none" | "read" | "write";

const CARGO_DEFAULTS: Record<string, Record<string, Acceso>> = {
  ADMINISTRADOR: {
    DASHBOARD: "write", CLIENTES: "write", EMPLEADOS: "write",
    HABITACIONES: "write", TIPOS_HABITACION: "write", RESERVAS: "write",
    PAGOS: "write", USUARIOS: "write", INCIDENCIAS: "write",
    AREAS: "write", HORARIOS: "write", REPORTES: "write", CONSULTAS: "write",
  },
  GERENTE: {
    DASHBOARD: "write", CLIENTES: "write", EMPLEADOS: "write",
    HABITACIONES: "write", TIPOS_HABITACION: "write", RESERVAS: "write",
    PAGOS: "write", INCIDENCIAS: "write", AREAS: "write",
    HORARIOS: "write", REPORTES: "write", CONSULTAS: "write",
  },
  RECEPCIONISTA: {
    DASHBOARD: "write", CLIENTES: "write",
    HABITACIONES: "write", RESERVAS: "write", PAGOS: "write",
    CONSULTAS: "write",
  },
  MANTENIMIENTO: {
    DASHBOARD: "write",
    HABITACIONES: "read", INCIDENCIAS: "write", AREAS: "write", HORARIOS: "write",
  },
  LIMPIEZA: {
    DASHBOARD: "write",
    HABITACIONES: "read", INCIDENCIAS: "write", HORARIOS: "write",
  },
  CHATBOT: {
    INCIDENCIAS: "write",
  },
};

export interface AuthUser {
  idUsuario: number;
  nombre: string;
  nombreUsuario: string;
  idEmpleado?: number;
  token?: string;
  cargo?: string;
  permisos: Record<string, boolean>;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  tienePermiso: (modulo: string) => boolean;
  puedeEditar: (modulo: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolverAcceso(user: AuthUser | null, modulo: string): Acceso {
  if (!user) return "none";
  const entries = Object.keys(user.permisos);
  if (entries.length > 0) {
    const val = user.permisos[modulo];
    return val == null ? "none" : val ? "write" : "none";
  }
  const cargo = user.cargo || "RECEPCIONISTA";
  return CARGO_DEFAULTS[cargo]?.[modulo] || "none";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (userData: AuthUser) => setUser(userData);
  const logout = () => setUser(null);
  const tienePermiso = (modulo: string) => resolverAcceso(user, modulo) !== "none";
  const puedeEditar = (modulo: string) => resolverAcceso(user, modulo) === "write";

  return (
    <AuthContext.Provider value={{ user, login, logout, tienePermiso, puedeEditar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
