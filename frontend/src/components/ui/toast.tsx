'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useToast, dismiss } from '@/hooks/use-toast';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-emerald-500/50 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const iconMap = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
};

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  toastId: string;
  title: string;
  description?: string;
}

function Toast({ className, variant, toastId, title, description, ...props }: ToastProps) {
  const Icon = iconMap[variant || 'default'];

  return (
    <div className={cn(toastVariants({ variant }), className)} {...props}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-70" />
        <div className="grid gap-1">
          <p className="text-sm font-semibold">{title}</p>
          {description && <p className="text-sm opacity-70">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => dismiss(toastId)}
        className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]">
      {toasts.map((t) => (
        <Toast key={t.id} toastId={t.id} title={t.title} description={t.description} variant={t.variant} />
      ))}
    </div>
  );
}

export { Toast, Toaster, toastVariants };
