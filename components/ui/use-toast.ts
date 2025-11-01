import * as React from 'react';
import { X } from 'lucide-react';

type ToastType = 'default' | 'destructive' | 'success';

type Toast = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
};

type ToastWithAction = Toast & {
  action?: {
    label: string;
    onClick: () => void;
  };
};

type ToastState = {
  toasts: ToastWithAction[];
  toast: (props: Omit<ToastWithAction, 'id'>) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastState | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastWithAction[]>([]);

  const toast = React.useCallback(({ duration = 5000, ...props }: Omit<ToastWithAction, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => [...prev, { ...props, id, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({
      toasts,
      toast,
      dismissToast,
    }),
    [toasts, toast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  id,
  title,
  description,
  type = 'default',
  action,
  onDismiss,
}: ToastWithAction & { onDismiss: () => void }) {
  const typeClasses = {
    default: 'bg-background border',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'bg-green-600 text-white',
  };

  return (
    <div
      className={`${typeClasses[type]} rounded-lg shadow-lg p-4 flex items-start justify-between gap-4 animate-in slide-in-from-bottom-4 fade-in-0`}
    >
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm opacity-90">{description}</p>}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onDismiss();
            }}
            className="mt-2 text-sm font-medium underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function toast(props: Omit<ToastWithAction, 'id'>) {
  // This is a no-op function that will be replaced by the actual implementation
  // when used within a ToastProvider
  console.warn('Toast not initialized. Make sure to wrap your app with <ToastProvider>');
  return '';
}
