import api from '@/lib/api';
import type { Notification, ApiResponse, PaginatedResponse } from '@/types';

export const notificationService = {
  async getAll(filters?: { page?: number; limit?: number; read?: boolean }): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params: filters });
    return response.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data.count;
  },
};
