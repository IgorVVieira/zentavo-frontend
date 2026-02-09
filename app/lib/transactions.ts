import api from './api';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string | null;
  externalId: string | null;
  amount: number;
  date: string;
  description: string;
  type: 'CASH_IN' | 'CASH_OUT';
  method: 'PIX' | 'DEBIT' | 'TRANSFER' | 'CARD_PAYMENT' | 'CASH_BACK';
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface UpdateTransactionRequest {
  categoryId?: string | null;
  amount?: number;
  date?: string;
  description?: string;
  type?: 'CASH_IN' | 'CASH_OUT';
  method?: 'PIX' | 'DEBIT' | 'TRANSFER' | 'CARD_PAYMENT' | 'CASH_BACK';
}

export async function getTransactionsByMonth(
  month: number,
  year: number,
): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>(
    `/api/transactions/${month}/${year}`,
  );
  return response.data;
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionRequest,
): Promise<Transaction> {
  const response = await api.put<Transaction>(
    `/api/transactions/${id}`,
    data,
  );
  return response.data;
}

export async function importOFX(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('statement', file);
  await api.post('/api/transactions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
