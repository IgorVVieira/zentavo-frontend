import { API_URL } from "@/constants/env";
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

class TransactionService {
  /**
   * Importa um arquivo CSV de transações
   * @param file O arquivo CSV a ser importado
   * @param bankType O tipo de banco do arquivo (ex: "nubank")
   * @returns Resposta da API
   */
  async importCSV(file: File, bankType: string): Promise<any> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para importar arquivos."
        );
      }

      const formData = new FormData();
      formData.append("statement", file);
      formData.append("bankType", bankType);

      console.log("Enviando arquivo:", file.name, "tipo:", bankType);

      const response = await fetch(`${API_URL}/api/transactions/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "Falha ao importar o arquivo.";

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
      console.error("Erro na importação:", error);
      throw error;
    }
  }

  /**
   * Busca transações do usuário para um mês e ano específicos
   * @param month Mês (1-12)
   * @param year Ano (ex: 2025)
   * @returns Lista de transações
   */
  async getMonthlyTransactions(
    month: number,
    year: number
  ): Promise<ExpenseItem[]> {
    try {
      console.log(`Buscando transações para ${month}/${year}`);

      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para visualizar as transações."
        );
      }

      const response = await fetch(
        `${API_URL}/api/transactions/${month}/${year}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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

      // Mapear para o formato esperado pela aplicação
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

  /**
   * Atualiza uma transação
   * @param id ID da transação
   * @param updates Campos para atualizar (description e/ou categoryId)
   * @returns Transação atualizada
   */
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

      // Criar o DTO conforme a estrutura esperada pela API
      const updateDto = {
        id: id,
        description: updates.description,
        categoryId: updates.categoryId,
      };

      console.log("Atualizando transação:", id, "com dados:", updateDto);

      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: "PATCH",
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

      // Processar a resposta para o formato ExpenseItem
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
