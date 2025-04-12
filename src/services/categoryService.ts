import { API_URL } from "@/constants/env";
import authService from "./authService";

export interface Category {
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
  /**
   * Busca todas as categorias do usuário
   * @returns Lista de categorias
   */
  async getCategories(): Promise<Category[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para acessar suas categorias."
        );
      }

      const response = await fetch(`${API_URL}/api/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMsg = "Falha ao buscar categorias.";

        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          console.error("Erro ao processar resposta de erro:", e);
        }

        throw new Error(errorMsg);
      }

      const data = await response.json();
      return data || [];
    } catch (error: any) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
  }

  /**
   * Cria uma nova categoria
   * @param name Nome da categoria
   * @param color Cor da categoria (em formato hex)
   * @returns Categoria criada
   */
  async createCategory(name: string, color: string): Promise<Category> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para criar categorias."
        );
      }

      const user = authService.getUser();
      if (!user || !user.id) {
        throw new Error("Informações do usuário não encontradas.");
      }

      const categoryData: CreateCategoryDto = {
        userId: user.id,
        name,
        color,
      };

      const response = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        let errorMsg = "Falha ao criar categoria.";

        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          console.error("Erro ao processar resposta de erro:", e);
        }

        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error: any) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
  }

  /**
   * Remove uma categoria
   * @param id ID da categoria a ser removida
   * @returns Resposta da API
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para remover categorias."
        );
      }

      const response = await fetch(
        `${API_URL}/api/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMsg = "Falha ao excluir categoria.";

        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          console.error("Erro ao processar resposta de erro:", e);
        }

        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error);
      throw error;
    }
  }

  /**
   * Atualiza uma categoria existente
   * @param id ID da categoria a ser atualizada
   * @param data Dados a serem atualizados (nome e/ou cor)
   * @returns Categoria atualizada
   */
  async updateCategory(
    id: string,
    data: { name?: string; color?: string }
  ): Promise<Category> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para atualizar categorias."
        );
      }

      const response = await fetch(
        `${API_URL}/api/categories/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        let errorMsg = "Falha ao atualizar categoria.";

        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          console.error("Erro ao processar resposta de erro:", e);
        }

        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error: any) {
      console.error("Erro ao atualizar categoria:", error);
      throw error;
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
