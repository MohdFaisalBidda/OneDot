import * as React from 'react';
import { X } from 'lucide-react';

type ToastType = 'default' | 'destructive' | 'success';

type Toast = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
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

  const toast = React.useCallback((props: Omit<ToastWithAction, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
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
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 flex items-start justify-between gap-4 ${
              toast.type === 'destructive' ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex-1">
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && <p className="text-sm text-gray-500 dark:text-gray-400">{toast.description}</p>}
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                  className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
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
  console.warn('Toast not initialized. Make sure to wrap your app with <ToastProvider>');
  return '';
}
