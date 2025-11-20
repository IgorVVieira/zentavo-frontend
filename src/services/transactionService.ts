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

export interface ICategory {
  id: string;
  name: string;
  color: string;
}

export interface ITransaction {
  id: string;
  userId: string;
  externalId?: string | null;
  amount: number;
  date: Date;
  description: string;
  type: TransactionType;
  method: TransactionMethod;
  category?: ICategory;
}

export interface IExpenseItem {
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

export interface ITransactionsByMethodDto {
  method: TransactionMethod;
  total: number;
}

export interface ITransactionsByCategoryDto {
  id: string;
  name: string;
  color: string;
  total: number;
  percentage: number;
}

export interface ILastSixMonthsData {
  month: number;
  year: number;
  totalCashIn: number;
  totalCashOut: number;
}

export interface IDashboardData {
  transactionsByMethod: ITransactionsByMethodDto[];
}

class TransactionService {
  async getTransactionsByMethod(
    month: number,
    year: number
  ): Promise<ITransactionsByMethodDto[]> {
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
      authService.handleAuthError(error);

      let errorMsg = "Falha ao buscar dados do dashboard.";
      errorMsg = error.message || errorMsg;

      throw new Error(errorMsg);
    }
  }

  async getTransactionsByCategory(
    month: number,
    year: number,
    transactionType: TransactionType
  ): Promise<ITransactionsByCategoryDto[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para visualizar os dados de categorias."
        );
      }

      const { data } = await axios.get(
        `${API_URL}/transactions/dashboard/categories/${month}/${year}/${transactionType}`,
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

      let errorMsg = "Falha ao buscar dados de categorias.";
      errorMsg = error.message || errorMsg;

      console.error("Erro ao buscar dados de categorias:", error);
      throw new Error(errorMsg);
    }
  }

  async getLastSixMonthsData(): Promise<ILastSixMonthsData[]> {
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
      authService.handleAuthError(error);

      let errorMsg = "Falha ao buscar dados dos últimos 6 meses.";
      errorMsg = error.message || errorMsg;

      console.error("Erro ao buscar dados dos últimos 6 meses:", error);
      throw new Error(errorMsg);
    }
  }

  async importOFX(file: File): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para importar arquivos."
        );
      }

      const formData = new FormData();
      formData.append("statement", file);

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
  ): Promise<IExpenseItem[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para visualizar as transações."
        );
      }

      const { data } = await axios.get<IExpenseItem[]>(
        `${API_URL}/transactions/${month}/${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const transactions = data || [];

      return transactions.map((transaction: any) => ({
        id: transaction.id as string,
        date: new Date(transaction.date).toISOString().split("T")[0],
        amount: transaction.amount,
        description: transaction.description,
        category: {
          id: transaction?.category?.id || undefined,
          name: transaction?.category?.name || "Outros",
          color: transaction?.category?.color || "#6B7280",
        },
        type:
          transaction.type === TransactionType.CASH_IN ? "income" : "expense",
        method: transaction.method,
      }));
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Falha ao buscar transações."
        );
      }
      throw error;
    }
  }

  async updateTransaction(
    id: string,
    updates: { description?: string; categoryId?: string | null }
  ): Promise<IExpenseItem> {
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

      const { data: responseData } = await axios.put(
        `${API_URL}/transactions/${id}`,
        updateDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Falha ao atualizar transação."
        );
      }
      throw error;
    }
  }
}

const transactionService = new TransactionService();
export default transactionService;
