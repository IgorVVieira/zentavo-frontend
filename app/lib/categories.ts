import api from './api';

export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'CASH_IN' | 'CASH_OUT' | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  type?: 'CASH_IN' | 'CASH_OUT' | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  type?: 'CASH_IN' | 'CASH_OUT' | null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/api/categories');
  return response.data;
}

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const response = await api.post<Category>('/api/categories', data);
  return response.data;
}

export async function updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
  const response = await api.put<Category>(`/api/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/api/categories/${id}`);
}
