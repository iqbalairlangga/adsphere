import api from '@/lib/api';
import type { Campaign, ApiResponse, PaginatedResponse, CampaignStats } from '@/types';

export interface CampaignFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const campaignService = {
  async getAll(filters?: CampaignFilters): Promise<PaginatedResponse<Campaign>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Campaign>>>('/campaigns', { params: filters });
    return response.data.data;
  },

  async getById(id: string): Promise<Campaign> {
    const response = await api.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Campaign>): Promise<Campaign> {
    const response = await api.post<ApiResponse<Campaign>>('/campaigns', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const response = await api.patch<ApiResponse<Campaign>>(`/campaigns/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  },

  async updateStatus(id: string, status: Campaign['status']): Promise<Campaign> {
    const response = await api.patch<ApiResponse<Campaign>>(`/campaigns/${id}/status`, { status });
    return response.data.data;
  },

  async getStats(id: string): Promise<CampaignStats> {
    const response = await api.get<ApiResponse<CampaignStats>>(`/campaigns/${id}/stats`);
    return response.data.data;
  },
};
