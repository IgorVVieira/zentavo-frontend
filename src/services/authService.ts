import { API_URL } from "@/constants/env";
import axios from "axios";
export interface User {
  email: string;
  name?: string;
  role?: string;
  id?: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  private readonly tokenKey = "zentavo_token";
  private readonly userKey = "zentavo_user";

  constructor() {
    this.setupAxiosInterceptors();
  }

  private setupAxiosInterceptors(): void {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && this.isTokenValid()) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn("Authentication failed, logging out user");
          this.logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async register(name: string, email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha no cadastro");
      }

      const data = await response.json();
      return data.user;
    } catch (error: any) {
      throw new Error(error.message || "Erro ao registrar usuário");
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const payload = {
        email,
        password,
        username: email,
        senha: password,
      };

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Erro ao parsear resposta JSON:", e);
        responseData = {};
      }

      if (!response.ok) {
        throw new Error(
          responseData.message || responseData.error || "Falha na autenticação"
        );
      }

      const token =
        responseData.token ||
        responseData.accessToken ||
        responseData?.data?.token ||
        "";

      if (!token) {
        console.error("Token não encontrado na resposta:", responseData);
        throw new Error("Token de autenticação não encontrado na resposta");
      }

      const userData = responseData.user ||
        responseData.userData ||
        responseData.data || {
          id: responseData.id || responseData.userId || "unknown",
          email: email,
          name: responseData.name || responseData.nome || email.split("@")[0],
        };

      this.setToken(token);
      this.setUser(userData);

      return {
        user: userData,
        token: token,
      };
    } catch (error: any) {
      console.error("Erro de autenticação:", error);
      throw new Error(error.message || "Erro ao fazer login");
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(this.userKey);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      this.logout();
      return false;
    }
  }

  handleAuthError(error: any): void {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("Authentication failed, logging out user");
      this.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  async fetchWithAuthAndErrorHandling(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = this.getToken();
    if (!token || !this.isTokenValid()) {
      this.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Não autenticado");
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 || response.status === 403) {
        console.warn("Authentication failed, logging out user");
        this.logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Sessão expirada. Redirecionando para login...");
      }

      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        if (!this.isTokenValid()) {
          this.logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      }
      throw error;
    }
  }

  async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    return this.fetchWithAuthAndErrorHandling(url, options);
  }

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  async updateProfile(name: string): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Não autenticado");
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao atualizar perfil");
      }

      const userData = await response.json();
      this.setUser(userData);

      return userData;
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      throw new Error(error.message || "Erro ao atualizar o perfil");
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Não autenticado");
      }

      const response = await fetch(`${API_URL}/users/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao alterar senha");
      }

      return true;
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      throw new Error(error.message || "Erro ao alterar a senha");
    }
  }

  async getUserStats(): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("Não autenticado");
      }

      const response = await fetch(`${API_URL}/users/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao obter estatísticas");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error(error.message || "Erro ao obter estatísticas do usuário");
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      if (!email.includes("@")) {
        throw new Error("Email inválido");
      }

      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Falha ao solicitar recuperação de senha"
        );
      }

      return true;
    } catch (error: any) {
      console.error("Erro ao solicitar recuperação de senha:", error);
      throw new Error(
        error.message || "Erro ao processar solicitação de recuperação de senha"
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Código para quando a API estiver pronta
      /* 
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao redefinir senha");
      }
      */

      // Simulação
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return true;
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      throw new Error(error.message || "Erro ao redefinir senha");
    }
  }

  async activateAccount(token: string, userId: string): Promise<boolean> {
    try {
      // Garantir que o token seja apenas dígitos
      const cleanToken = token.replace(/\D/g, "");

      await axios.post(
        `${API_URL}/users/activate`,
        {
          token: cleanToken,
          userId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return true;
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message || "Erro ao ativar conta");
    }
  }

  async resendActivationCode(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/users/resend-activation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao reenviar código");
      }

      return true;
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message || "Erro ao reenviar código de ativação");
    }
  }
}

const authService = new AuthService();
export default authService;
