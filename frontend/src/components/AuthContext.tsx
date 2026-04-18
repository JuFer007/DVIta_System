// frontend/src/components/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
  nombre: string;
  rol: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (credentials: any): boolean => {
    setUser({
      nombre: credentials.nombre || "Usuario",
      rol: credentials.rol || "Administrador",
      ...credentials,
    });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};