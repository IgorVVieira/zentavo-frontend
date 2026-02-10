import api from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export async function listProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/api/products');
  return response.data;
}
