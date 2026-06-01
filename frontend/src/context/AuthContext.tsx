import { createContext, useContext, useState, type ReactNode } from "react";

export interface AuthUser {
  idUsuario: number;
  nombre: string;
  nombreUsuario: string;
  idEmpleado?: number;
  permisos: Record<string, boolean>;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  tienePermiso: (modulo: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (userData: AuthUser) => setUser(userData);
  const logout = () => setUser(null);
  const tienePermiso = (modulo: string) => {
    if (!user) return false;
    if (!user.permisos) return true;
    return user.permisos[modulo] !== false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, tienePermiso }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
