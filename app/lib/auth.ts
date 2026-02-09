import api from './api';

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  return response.data;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export async function createUser(data: CreateUserRequest): Promise<UserResponse> {
  const response = await api.post<UserResponse>('/api/users/create', data);
  return response.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/api/auth/forgot-password', { email });
  return response.data;
}

export async function getMe(): Promise<UserResponse> {
  const response = await api.get<UserResponse>('/api/users/me');
  return response.data;
}

export function logout(): void {
  localStorage.removeItem('zencash_token');
  window.location.href = '/login';
}
