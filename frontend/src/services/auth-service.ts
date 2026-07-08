import api from '@/lib/api';
import type { User, LoginRequest, RegisterRequest, AuthTokens, ApiResponse } from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', data);
    const result = response.data.data;
    localStorage.setItem('accessToken', result.tokens.accessToken);
    localStorage.setItem('refreshToken', result.tokens.refreshToken);
    return result;
  },

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', data);
    const result = response.data.data;
    localStorage.setItem('accessToken', result.tokens.accessToken);
    localStorage.setItem('refreshToken', result.tokens.refreshToken);
    return result;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
    const tokens = response.data.data;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    return tokens;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  async setup2FA(): Promise<{ qrCode: string; secret: string }> {
    const response = await api.post<ApiResponse<{ qrCode: string; secret: string }>>('/auth/2fa/setup');
    return response.data.data;
  },

  async verify2FA(code: string): Promise<void> {
    await api.post('/auth/2fa/verify', { code });
  },

  async disable2FA(code: string): Promise<void> {
    await api.post('/auth/2fa/disable', { code });
  },

  async loginWithOAuth(provider: string, code: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(`/auth/oauth/${provider}`, { code });
    const result = response.data.data;
    localStorage.setItem('accessToken', result.tokens.accessToken);
    localStorage.setItem('refreshToken', result.tokens.refreshToken);
    return result;
  },
};
