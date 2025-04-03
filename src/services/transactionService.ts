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

export interface Transaction {
  id: string;
  userId: string;
  categoryId?: string;
  externalId?: string | null;
  amount: number;
  date: Date;
  description: string;
  type: TransactionType;
  method: TransactionMethod;
}

// Tipo para mapeamento entre dados da API e o formato usado pelo frontend
export interface ExpenseItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense";
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
      // Verificar se há token de autenticação
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para importar arquivos."
        );
      }

      // Preparar o FormData para envio
      const formData = new FormData();
      // Usando 'statement' como nome do campo - é o que o backend espera conforme a configuração do Multer
      formData.append("statement", file);
      formData.append("bankType", bankType);

      console.log("Enviando arquivo:", file.name, "tipo:", bankType);

      // Fazer a chamada à API
      const response = await fetch(`${API_URL}/api/transactions/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // Verificar se a resposta foi bem-sucedida
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

      // Verificar se há token de autenticação
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "Você precisa estar autenticado para visualizar as transações."
        );
      }

      // Fazer a chamada à API
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

      // Verificar se a resposta foi bem-sucedida
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

      // Processar e mapear os dados recebidos
      const data = await response.json();
      console.log(data);
      const transactions = data || [];

      // Converter do formato da API para o formato usado pelo frontend
      return transactions.map((transaction: Transaction) => ({
        id: transaction.id,
        date: new Date(transaction.date).toISOString().split("T")[0],
        amount: transaction.amount,
        description: transaction.description,
        category:
          transaction.categoryId ||
          this.getCategoryFromDescription(transaction.description),
        type:
          transaction.type === TransactionType.CASH_IN ? "income" : "expense",
      }));
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);

      // Em caso de falha, retornar dados mock
      return this.getMockTransactions(month, year);
    }
  }

  /**
   * Função auxiliar para inferir categoria a partir da descrição
   * quando o categoryId não está disponível
   */
  private getCategoryFromDescription(description: string): string {
    description = description.toLowerCase();

    if (
      description.includes("mercado") ||
      description.includes("supermercado")
    ) {
      return "Alimentação";
    } else if (
      description.includes("netflix") ||
      description.includes("spotify") ||
      description.includes("apple")
    ) {
      return "Assinaturas";
    } else if (
      description.includes("uber") ||
      description.includes("99") ||
      description.includes("taxi")
    ) {
      return "Transporte";
    } else if (
      description.includes("farmacia") ||
      description.includes("hospital") ||
      description.includes("medic")
    ) {
      return "Saúde";
    } else if (
      description.includes("aluguel") ||
      description.includes("condominio") ||
      description.includes("iptu")
    ) {
      return "Moradia";
    } else if (
      description.includes("energia") ||
      description.includes("luz") ||
      description.includes("agua") ||
      description.includes("internet")
    ) {
      return "Utilidades";
    } else if (
      description.includes("salario") ||
      description.includes("pagamento")
    ) {
      return "Receita";
    } else {
      return "Outros";
    }
  }

  /**
   * Dados mock para o caso da API falhar
   */
  private getMockTransactions(month: number, year: number): ExpenseItem[] {
    const formattedMonth = month.toString().padStart(2, "0");

    return [
      {
        id: "1",
        date: `${year}-${formattedMonth}-05`,
        amount: 1200.0,
        description: "Aluguel",
        category: "Moradia",
        type: "expense",
      },
      {
        id: "2",
        date: `${year}-${formattedMonth}-24`,
        amount: 256.78,
        description: "Supermercado Extra",
        category: "Alimentação",
        type: "expense",
      },
      {
        id: "3",
        date: `${year}-${formattedMonth}-19`,
        amount: 39.9,
        description: "Netflix",
        category: "Assinaturas",
        type: "expense",
      },
      {
        id: "4",
        date: `${year}-${formattedMonth}-18`,
        amount: 87.5,
        description: "Farmácia",
        category: "Saúde",
        type: "expense",
      },
      {
        id: "5",
        date: `${year}-${formattedMonth}-15`,
        amount: 45.6,
        description: "Uber",
        category: "Transporte",
        type: "expense",
      },
      {
        id: "14",
        date: `${year}-${formattedMonth}-02`,
        amount: 10000,
        description: "Salario",
        category: "Receita",
        type: "income",
      },
    ];
  }
}

const transactionService = new TransactionService();
export default transactionService;
