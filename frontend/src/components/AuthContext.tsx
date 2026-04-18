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
    // Mock login
    setUser({ nombre: "Cristian Huamán", rol: "Administrador", ...credentials });
    return true;
  };

  const logout = () => setUser(null);

  const value: AuthContextType = { user, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
