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

// Definição da interface do contexto
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Criação do contexto com valor inicial
export const AuthContext = createContext<AuthContextType | null>(null);

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

// Componente Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação quando o componente é montado
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

  // Função de login
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

  // Função de logout
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  // Valor do contexto
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  // Retorna o Provider com o valor
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
