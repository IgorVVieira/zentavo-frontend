"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import authService, { User } from "@/services/authService";
import { showToast } from "@/components/ToastNotificatons";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isTokenValid()) {
          const userData = authService.getUser();
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      console.log("Resposta da API de login:", response);

      if (response && response.token && response.user) {
        setUser(response.user);
        console.log("Login bem-sucedido, usuário definido:", response.user);
        return true;
      } else {
        console.log("Login falhou, resposta inválida:", response);
        return false;
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      showToast(error.message || "Erro ao fazer login", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
