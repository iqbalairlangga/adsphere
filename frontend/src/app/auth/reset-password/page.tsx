'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth-service';
import { toast } from '@/hooks/use-toast';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ResetData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetData>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (data: ResetData) => {
    if (!token) {
      toast({ title: 'Invalid reset link', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      toast({ title: 'Password reset successful', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to reset password. The link may be expired.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Invalid or missing reset token.</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/auth/forgot-password">Request new reset link</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold">Password reset successful</h2>
            <p className="text-sm text-muted-foreground">Your password has been updated.</p>
            <Button asChild>
              <a href="/auth/login">Sign in with new password</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set new password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  {...register('password')}
                  error={errors.password?.message}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
