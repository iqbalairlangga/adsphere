import api from '@/lib/api';
import type { Payment, Wallet, ApiResponse, PaginatedResponse } from '@/types';

export const paymentService = {
  async getWallet(): Promise<Wallet> {
    const response = await api.get<ApiResponse<Wallet>>('/wallet');
    return response.data.data;
  },

  async deposit(amount: number, method: string): Promise<{ url: string }> {
    const response = await api.post<ApiResponse<{ url: string }>>('/wallet/deposit', { amount, method });
    return response.data.data;
  },

  async withdraw(amount: number, method: string): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>('/wallet/withdraw', { amount, method });
    return response.data.data;
  },

  async getTransactions(filters?: { page?: number; limit?: number; type?: string }): Promise<PaginatedResponse<Payment>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Payment>>>('/wallet/transactions', { params: filters });
    return response.data.data;
  },

  async getBillingHistory(filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<Payment>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Payment>>>('/billing/history', { params: filters });
    return response.data.data;
  },

  async getCurrentUsage(): Promise<{ impressionsUsed: number; impressionsLimit: number; spendUsed: number; spendLimit: number }> {
    const response = await api.get<ApiResponse<{ impressionsUsed: number; impressionsLimit: number; spendUsed: number; spendLimit: number }>>('/billing/usage');
    return response.data.data;
  },

  async addPaymentMethod(data: { type: string; details: Record<string, string> }): Promise<void> {
    await api.post('/billing/payment-methods', data);
  },

  async getPaymentMethods(): Promise<Array<{ id: string; type: string; last4: string; isDefault: boolean }>> {
    const response = await api.get<ApiResponse<Array<{ id: string; type: string; last4: string; isDefault: boolean }>>>('/billing/payment-methods');
    return response.data.data;
  },
};
