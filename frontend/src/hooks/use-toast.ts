'use client';

import { useState, useEffect, useCallback } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

interface ToastActions {
  toast: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastState: Toast[] = [];

function emitChange() {
  toastListeners.forEach((listener) => listener(toastState));
}

export function toast(toast: Omit<Toast, 'id'>): string {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = { ...toast, id };
  toastState = [...toastState, newToast];
  emitChange();

  const duration = toast.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }

  return id;
}

export function dismiss(id: string) {
  toastState = toastState.filter((t) => t.id !== id);
  emitChange();
}

export function dismissAll() {
  toastState = [];
  emitChange();
}

export function useToast(): ToastState & ToastActions {
  const [toasts, setToasts] = useState<Toast[]>(toastState);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  return {
    toasts,
    toast: useCallback((t: Omit<Toast, 'id'>) => toast(t), []),
    dismiss: useCallback((id: string) => dismiss(id), []),
    dismissAll: useCallback(() => dismissAll(), []),
  };
}
