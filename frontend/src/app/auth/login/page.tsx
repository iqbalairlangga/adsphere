import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <LoginForm />
      </div>
    </div>
  );
}
