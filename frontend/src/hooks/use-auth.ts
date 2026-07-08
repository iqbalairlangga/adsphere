'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth-service';
import { toast } from '@/hooks/use-toast';
import type { LoginRequest, RegisterRequest } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { user, tokens, isAuthenticated, isLoading, setLoading, login: storeLogin, logout: storeLogout } = useAuthStore();

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      storeLogin(response.user, response.tokens);
      toast({ title: 'Welcome back!', variant: 'success' });
      router.push('/dashboard');
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Login failed. Please try again.';
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, storeLogin, setLoading]);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      storeLogin(response.user, response.tokens);
      toast({ title: 'Account created!', variant: 'success' });
      router.push('/dashboard');
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Registration failed. Please try again.';
      toast({ title: 'Registration failed', description: message, variant: 'destructive' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, storeLogin, setLoading]);

  const logout = useCallback(async () => {
    try {
      if (tokens?.refreshToken) {
        await authService.logout(tokens.refreshToken);
      }
    } catch {
      // Ignore logout errors
    } finally {
      storeLogout();
      router.push('/auth/login');
      toast({ title: 'Logged out successfully' });
    }
  }, [tokens, storeLogout, router]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getProfile();
      useAuthStore.getState().setUser(userData);
    } catch {
      storeLogout();
    }
  }, [storeLogout]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };
}
