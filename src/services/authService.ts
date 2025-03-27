// src/services/authService.ts

export interface User {
  email: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private tokenKey = "zentavo_token";
  private userKey = "zentavo_user";
  private usersKey = "zentavo_users";

  // Dados mock para autenticação
  private mockUsers = [
    {
      email: "usuario@teste.com",
      password: "senha123",
      name: "Usuário Teste",
      role: "user",
    },
    {
      email: "admin@zentavo.com",
      password: "admin123",
      name: "Administrador",
      role: "admin",
    },
  ];

  constructor() {
    // Inicializar os usuários mock no localStorage se ainda não existirem
    if (typeof window !== "undefined" && !localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify(this.mockUsers));
    }
  }

  // Obter todos os usuários registrados
  private getUsers(): any[] {
    if (typeof window !== "undefined") {
      const usersStr = localStorage.getItem(this.usersKey);
      if (usersStr) {
        try {
          return JSON.parse(usersStr);
        } catch (e) {
          return this.mockUsers;
        }
      }
    }
    return this.mockUsers;
  }

  // Salvar a lista de usuários
  private saveUsers(users: any[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }
  }

  // Registrar um novo usuário
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<boolean> {
    // Simular atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = this.getUsers();

    // Verificar se o email já está registrado
    const userExists = users.some((user) => user.email === email);
    if (userExists) {
      throw new Error("Este email já está cadastrado.");
    }

    // Criar novo usuário
    const newUser = {
      email,
      password,
      name,
      role: "user",
    };

    // Adicionar à lista de usuários
    users.push(newUser);
    this.saveUsers(users);

    return true;
  }

  // Login com dados mock
  async login(email: string, password: string): Promise<AuthResponse | null> {
    // Simular atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 800));

    const users = this.getUsers();
    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      // Criar um token mock
      const token = `mock_jwt_${btoa(user.email)}_${Date.now()}`;

      // Remover senha antes de armazenar
      const { password: _, ...userWithoutPassword } = user;

      // Salvar no localStorage
      this.setToken(token);
      this.setUser(userWithoutPassword);

      return {
        user: userWithoutPassword,
        token,
      };
    }

    return null;
  }

  // Versão preparada para API real
  async loginWithAPI(email: string, password: string): Promise<AuthResponse> {
    try {
      // Implementação futura
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });

      // if (!response.ok) {
      //   throw new Error('Falha na autenticação');
      // }

      // const data = await response.json();
      // this.setToken(data.token);
      // this.setUser(data.user);
      // return data;

      // Temporariamente usar login mock
      const mockResponse = await this.login(email, password);
      if (!mockResponse) throw new Error("Falha na autenticação");
      return mockResponse;
    } catch (error) {
      console.error("Erro de autenticação:", error);
      throw error;
    }
  }

  // Versão preparada para API real de registro
  async registerWithAPI(
    name: string,
    email: string,
    password: string
  ): Promise<User> {
    try {
      // Implementação futura
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password })
      // });

      // if (!response.ok) {
      //   throw new Error('Falha no cadastro');
      // }

      // const data = await response.json();
      // return data.user;

      // Temporariamente usar registro mock
      const success = await this.register(name, email, password);
      if (!success) throw new Error("Falha no cadastro");

      return { name, email, role: "user" };
    } catch (error) {
      console.error("Erro de registro:", error);
      throw error;
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    // Adicionar redirect aqui se necessário
    // window.location.href = '/login';
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
  // Em uma implementação real, isso poderia verificar a expiração do token JWT
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Mock: verificar se o token começa com "mock_jwt_"
    return token.startsWith("mock_jwt_");

    // Implementação futura
    // try {
    //   // Verificar JWT token
    //   const decoded = jwtDecode(token);
    //   const currentTime = Date.now() / 1000;
    //   return decoded.exp > currentTime;
    // } catch (e) {
    //   return false;
    // }
  }
}

// Exportar uma instância única
export const authService = new AuthService();
export default authService;
