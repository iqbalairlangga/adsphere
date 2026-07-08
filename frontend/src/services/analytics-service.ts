import api from '@/lib/api';
import type { AnalyticsMetric, AnalyticsSummary, ApiResponse, DateRange } from '@/types';

export const analyticsService = {
  async getSummary(dateRange?: DateRange, campaignId?: string): Promise<AnalyticsSummary> {
    const response = await api.get<ApiResponse<AnalyticsSummary>>('/analytics/summary', {
      params: { ...dateRange, campaignId },
    });
    return response.data.data;
  },

  async getMetrics(dateRange?: DateRange, campaignId?: string): Promise<AnalyticsMetric[]> {
    const response = await api.get<ApiResponse<AnalyticsMetric[]>>('/analytics/metrics', {
      params: { ...dateRange, campaignId },
    });
    return response.data.data;
  },

  async getRealtime(): Promise<{ activeUsers: number; currentImpressions: number; currentClicks: number }> {
    const response = await api.get<ApiResponse<{ activeUsers: number; currentImpressions: number; currentClicks: number }>>('/analytics/realtime');
    return response.data.data;
  },

  async exportCSV(dateRange?: DateRange): Promise<Blob> {
    const response = await api.get('/analytics/export/csv', {
      params: dateRange,
      responseType: 'blob',
    });
    return response.data;
  },

  async exportPDF(dateRange?: DateRange): Promise<Blob> {
    const response = await api.get('/analytics/export/pdf', {
      params: dateRange,
      responseType: 'blob',
    });
    return response.data;
  },
};
