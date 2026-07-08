'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth-service';
import { toast } from '@/hooks/use-toast';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSent(true);
      toast({ title: 'Reset email sent', description: 'Check your inbox for the reset link', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send reset email. Try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot password?</CardTitle>
          <CardDescription>No worries, we&apos;ll send you reset instructions</CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
                <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                If an account with that email exists, we&apos;ve sent password reset instructions.
              </p>
              <Button variant="outline" className="mt-2" asChild>
                <a href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    error={errors.email?.message}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                {isLoading ? 'Sending...' : 'Send reset instructions'}
              </Button>
              <div className="text-center text-sm">
                <a href="/auth/login" className="text-primary hover:underline">
                  <ArrowLeft className="mr-1 inline h-4 w-4" />
                  Back to login
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
