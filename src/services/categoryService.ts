import { API_URL } from "@/constants/env";
import authService from "./authService";
import axios from "axios";

export interface ICategory {
  id: string;
  name: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCategoryDto {
  userId: string;
  name: string;
  color: string;
}

export interface CategoryDto extends CreateCategoryDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

class CategoryService {
  async getCategories(): Promise<ICategory[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para acessar suas categorias."
        );
      }

      const { data } = await axios.get<ICategory[]>(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return data || [];
    } catch (error: any) {
      authService.handleAuthError(error);

      console.error("Erro ao buscar categorias:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Falha ao buscar categorias."
        );
      }
      throw error;
    }
  }

  async createCategory(name: string, color: string): Promise<ICategory> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para criar categorias."
        );
      }

      const user = authService.getUser();
      if (!user?.id) {
        throw new Error("Informações do usuário não encontradas.");
      }

      const categoryData: CreateCategoryDto = {
        userId: user.id,
        name,
        color,
      };

      const { data } = await axios.post<ICategory>(
        `${API_URL}/categories`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return data;
    } catch (error: any) {
      authService.handleAuthError(error);

      console.error("Erro ao criar categoria:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Falha ao criar categoria."
        );
      }
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para remover categorias."
        );
      }

      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      authService.handleAuthError(error);

      const errorMsg = "Falha ao excluir categoria.";
      console.error("Erro ao excluir categoria:", error);
      throw new Error(errorMsg);
    }
  }

  async updateCategory(
    id: string,
    data: { name: string; color: string }
  ): Promise<ICategory> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para atualizar categorias."
        );
      }

      const { data: responseData } = await axios.put<ICategory>(
        `${API_URL}/categories/${id}`,
        { ...data, id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return responseData;
    } catch (error: any) {
      authService.handleAuthError(error);

      console.error("Erro ao atualizar categoria:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Falha ao atualizar categoria."
        );
      }
      throw error;
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
