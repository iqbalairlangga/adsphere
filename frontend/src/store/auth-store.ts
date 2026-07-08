import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (tokens) => set({ tokens }),
      setLoading: (isLoading) => set({ isLoading }),
      login: (user, tokens) => set({ user, tokens, isAuthenticated: true, isLoading: false }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        set({ user: null, tokens: null, isAuthenticated: false });
      },
    }),
    {
      name: 'adsphere-auth',
      partialize: (state) => ({ user: state.user, tokens: state.tokens, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
