import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/common/Icon';
import clsx from 'clsx';

interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (message: string, variant?: Toast['variant']) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<Toast['variant'], string> = { success: 'CheckCircle2', error: 'AlertCircle', info: 'Info' };
const COLORS: Record<Toast['variant'], string> = {
  success: 'bg-navy-950 text-white',
  error: 'bg-ruby-600 text-white',
  info: 'bg-navy-950 text-white',
};
const ICON_COLORS: Record<Toast['variant'], string> = {
  success: 'text-emerald-400',
  error: 'text-white',
  info: 'text-gold-400',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: Toast['variant'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:top-6">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={clsx(
                'pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl px-4 py-3.5 shadow-lifted animate-in',
                COLORS[t.variant],
              )}
            >
              <Icon name={ICONS[t.variant]} className={clsx('h-5 w-5 shrink-0', ICON_COLORS[t.variant])} />
              <p className="text-sm font-medium leading-snug">{t.message}</p>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
