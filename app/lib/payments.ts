import api from './api';

interface PaymentLinkResponse {
  url: string;
}

export async function createPaymentLink(): Promise<PaymentLinkResponse> {
  const response = await api.post<PaymentLinkResponse>('/api/payments/link');
  return response.data;
}
