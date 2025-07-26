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
import { useLoading } from "./LoadingContext";

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
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const checkAuth = async () => {
      startLoading();
      try {
        if (authService.isTokenValid()) {
          const userData = authService.getUser();
          if (userData) {
            setUser(userData);
          }
        } else {
          // Token is invalid or expired, redirect to login
          setUser(null);
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        authService.logout();
        setUser(null);
        router.push("/login");
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    };

    checkAuth();
  }, [startLoading, stopLoading, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    startLoading();
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      if (response && response.token && response.user) {
        setUser(response.user);
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      showToast(error.message || "Erro ao fazer login", "error");
      return false;
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  const logout = () => {
    startLoading();
    try {
      authService.logout();
      setUser(null);
      router.push("/login");
    } finally {
      stopLoading();
    }
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
