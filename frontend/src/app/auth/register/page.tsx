import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create Account',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <RegisterForm />
      </div>
    </div>
  );
}
