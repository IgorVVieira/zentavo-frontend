import api from './api';

interface PaymentLinkResponse {
  url: string;
}

export async function createPaymentLink(productId: string): Promise<PaymentLinkResponse> {
  const response = await api.post<PaymentLinkResponse>('/api/payments/link', { productId });
  return response.data;
}
