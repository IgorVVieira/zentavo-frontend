import { API_URL } from "@/constants/env";

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
  private tokenKey = "zentavo_token";
  private userKey = "zentavo_user";

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
      console.error("Erro de registro:", error);
      throw new Error(error.message || "Erro ao registrar usuário");
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log("Tentando login com:", { email, password });

      const payload = {
        email,
        password,
        username: email,
        senha: password,
      };

      console.log("Enviando payload:", payload);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Status da resposta:", response.status);

      let responseData;
      try {
        responseData = await response.json();
        console.log("Dados da resposta:", responseData);
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
        (responseData.data && responseData.data.token) ||
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

      console.log("Dados do usuário extraídos:", userData);
      console.log("Token extraído:", token);

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

    return true;
  }

  async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = this.getToken();
    if (!token) {
      throw new Error("Não autenticado");
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // Métodos adicionais a serem implementados em authService.ts

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

  // Obter estatísticas do usuário
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
}

const authService = new AuthService();
export default authService;
