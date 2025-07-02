export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default' | 'destructive';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
} 