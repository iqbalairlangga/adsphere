'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { useAuth } from '@/hooks/use-auth';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    role: z.enum(['ADVERTISER', 'PUBLISHER']),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'ADVERTISER' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Join AdSphere and start your journey</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            {...register('name')}
            error={errors.name?.message}
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="name@example.com"
            {...register('email')}
            error={errors.email?.message}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">I am a...</Label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-center justify-center rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                selectedRole === 'ADVERTISER'
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:bg-accent'
              }`}
            >
              <input type="radio" value="ADVERTISER" {...register('role')} className="sr-only" />
              <span>Advertiser</span>
            </label>
            <label
              className={`flex cursor-pointer items-center justify-center rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                selectedRole === 'PUBLISHER'
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:bg-accent'
              }`}
            >
              <input type="radio" value="PUBLISHER" {...register('role')} className="sr-only" />
              <span>Publisher</span>
            </label>
          </div>
          {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              {...register('password')}
              error={errors.password?.message}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a href="/auth/login" className="font-medium text-primary hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
