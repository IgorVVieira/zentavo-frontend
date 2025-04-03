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

  // Registrar um novo usuário usando a API
  async register(name: string, email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
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

  // Login com API real
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log("Tentando login com:", { email, password });

      // Testar diferentes formatos de payload
      const payload = {
        email,
        password,
        // Alguns backends esperam essas variantes
        username: email,
        senha: password,
      };

      console.log("Enviando payload:", payload);

      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Status da resposta:", response.status);

      // Sempre capturar o corpo da resposta, mesmo em caso de erro
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

      // Verificar os possíveis locais onde o token pode estar na resposta
      const token =
        responseData.token ||
        responseData.accessToken ||
        (responseData.data && responseData.data.token) ||
        "";

      if (!token) {
        console.error("Token não encontrado na resposta:", responseData);
        throw new Error("Token de autenticação não encontrado na resposta");
      }

      // Lidar com diferentes formatos de resposta possíveis
      const userData = responseData.user ||
        responseData.userData ||
        responseData.data || {
          id: responseData.id || responseData.userId || "unknown",
          email: email,
          name: responseData.name || responseData.nome || email.split("@")[0],
        };

      console.log("Dados do usuário extraídos:", userData);
      console.log("Token extraído:", token);

      // Salvar token e informações do usuário
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

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    // Não redirecionamos aqui, deixamos o componente fazer isso
  }

  // Pegar token armazenado
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  // Salvar token
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Pegar usuário armazenado
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

  // Salvar usuário
  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Verificar se o token é válido
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Sem verificação da expiração do token por enquanto
    // Em uma implementação mais robusta, usaríamos jwt-decode para verificar a expiração
    return true;
  }

  // Auxiliar para realizar requisições autenticadas
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

  // Obter cabeçalhos de autenticação para requisições autenticadas
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }
}

// Exportar uma instância única
const authService = new AuthService();
export default authService;
