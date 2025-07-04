import { API_URL } from "@/constants/env";
import axios from "axios";
import authService from "./authService";

export enum TransactionType {
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
}

export enum TransactionMethod {
  PIX = "PIX",
  DEBIT = "DEBIT",
  TRANSFER = "TRANSFER",
  CARD_PAYMENT = "CARD_PAYMENT",
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  userId: string;
  externalId?: string | null;
  amount: number;
  date: Date;
  description: string;
  type: TransactionType;
  method: TransactionMethod;
  category?: Category;
}

export interface ExpenseItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: {
    id?: string;
    name: string;
    color: string;
  };
  type: "income" | "expense";
  method?: string;
}

export interface TransactionsByMethodDto {
  method: TransactionMethod;
  total: number;
}

export interface TransactionsByCategoryDto {
  id: string;
  name: string;
  color: string;
  total: number;
  percentage: number;
}

// Nova interface para os dados dos últimos 6 meses
export interface LastSixMonthsData {
  month: number;
  year: number;
  totalCashIn: number;
  totalCashOut: number;
}

export interface DashboardData {
  transactionsByMethod: TransactionsByMethodDto[];
}

class TransactionService {
  async getTransactionsByMethod(
    month: number,
    year: number
  ): Promise<TransactionsByMethodDto[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para visualizar os dados do dashboard."
        );
      }

      const { data } = await axios.get(
        `${API_URL}/transactions/dashboard/payment-methods/${month}/${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return data;
    } catch (error: any) {
      let errorMsg = "Falha ao buscar dados do dashboard.";
      errorMsg = error.message || errorMsg;

      console.error("Erro ao buscar dados do dashboard:", error);
      throw new Error(errorMsg);
    }
  }

  async getTransactionsByCategory(
    month: number,
    year: number
  ): Promise<TransactionsByCategoryDto[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para visualizar os dados de categorias."
        );
      }

      const { data } = await axios.get(
        `${API_URL}/transactions/dashboard/categories/${month}/${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return data;
    } catch (error: any) {
      let errorMsg = "Falha ao buscar dados de categorias.";
      errorMsg = error.message || errorMsg;

      console.error("Erro ao buscar dados de categorias:", error);
      throw new Error(errorMsg);
    }
  }

  // Nova função para buscar dados dos últimos 6 meses
  async getLastSixMonthsData(): Promise<LastSixMonthsData[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para visualizar os dados dos últimos 6 meses."
        );
      }

      const { data } = await axios.get(
        `${API_URL}/transactions/dashboard/last-six-months`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return data;
    } catch (error: any) {
      let errorMsg = "Falha ao buscar dados dos últimos 6 meses.";
      errorMsg = error.message || errorMsg;

      console.error("Erro ao buscar dados dos últimos 6 meses:", error);
      throw new Error(errorMsg);
    }
  }

  async importCSV(file: File): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para importar arquivos."
        );
      }

      const formData = new FormData();
      formData.append("statement", file); // mesmo nome do backend

      const response = await axios.post(
        `${API_URL}/transactions/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Erro na importação:", error);

      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Erro na importação");
      }

      throw error;
    }
  }

  async getMonthlyTransactions(
    month: number,
    year: number
  ): Promise<ExpenseItem[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para visualizar as transações."
        );
      }

      const response = await fetch(`${API_URL}/transactions/${month}/${year}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMsg = "Falha ao buscar transações.";

        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          console.error("Erro ao processar resposta de erro:", e);
        }

        throw new Error(errorMsg);
      }

      const data = await response.json();
      const transactions = data || [];

      return transactions.map((transaction: any) => ({
        id: transaction.id as string,
        date: new Date(transaction.date).toISOString().split("T")[0],
        amount: transaction.amount,
        description: transaction.description,
        category: {
          id: transaction?.category?.id || undefined,
          name: transaction?.category?.name || "Outros",
          color: transaction?.category?.color || "#6B7280", // Cor padrão cinza
        },
        type:
          transaction.type === TransactionType.CASH_IN ? "income" : "expense",
        method: transaction.method,
      }));
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);
      throw error;
    }
  }

  async updateTransaction(
    id: string,
    updates: { description?: string; categoryId?: string | null }
  ): Promise<ExpenseItem> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para atualizar transações."
        );
      }

      const updateDto = {
        id: id,
        description: updates.description,
        categoryId: updates.categoryId,
      };

      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateDto),
      });

      if (!response.ok) {
        let errorMsg = "Falha ao atualizar transação.";

        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          console.error("Erro ao processar resposta de erro:", e);
        }

        throw new Error(errorMsg);
      }

      const responseData = await response.json();

      return {
        id: responseData.id,
        date: new Date(responseData.date).toISOString().split("T")[0],
        amount: responseData.amount,
        description: responseData.description,
        category: {
          id: responseData?.category?.id,
          name: responseData?.category?.name || "Outros",
          color: responseData?.category?.color || "#6B7280",
        },
        type:
          responseData.type === TransactionType.CASH_IN ? "income" : "expense",
        method: responseData.method,
      };
    } catch (error: any) {
      console.error("Erro ao atualizar transação:", error);
      throw error;
    }
  }
}

const transactionService = new TransactionService();
export default transactionService;
