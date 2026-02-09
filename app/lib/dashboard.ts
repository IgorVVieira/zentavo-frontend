import api from './api';

export type { Transaction } from './transactions';

export interface CategorySummary {
  id: string;
  name: string;
  color: string | null;
  total: number;
  percentage: number;
}

export interface MonthSummary {
  month: number;
  year: number;
  totalCashIn: number;
  totalCashOut: number;
}

export interface PaymentMethodSummary {
  method: 'PIX' | 'DEBIT' | 'TRANSFER' | 'CARD_PAYMENT' | 'CASH_BACK';
  total: number;
}

export async function getPaymentMethodsSummary(
  month: number,
  year: number,
): Promise<PaymentMethodSummary[]> {
  const response = await api.post<PaymentMethodSummary[]>(
    `/api/transactions/dashboard/payment-methods/${month}/${year}`,
  );
  return response.data;
}

export async function getCategoriesSummary(
  month: number,
  year: number,
  transactionType: 'CASH_IN' | 'CASH_OUT',
): Promise<CategorySummary[]> {
  const response = await api.put<CategorySummary[]>(
    `/api/transactions/dashboard/categories/${month}/${year}/${transactionType}`,
  );
  return response.data;
}

export async function getLastSixMonths(): Promise<MonthSummary[]> {
  const response = await api.get<MonthSummary[]>(
    '/api/transactions/dashboard/last-six-months',
  );
  return response.data;
}
