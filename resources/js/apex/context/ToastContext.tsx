import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toast = {
    success: (title: string, message?: string) => showToast('success', title, message),
    error: (title: string, message?: string) => showToast('error', title, message),
    info: (title: string, message?: string) => showToast('info', title, message),
    warning: (title: string, message?: string) => showToast('warning', title, message),
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, toast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          };

          const borders = {
            success: 'border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900',
            error: 'border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900',
            info: 'border-blue-200 dark:border-blue-900/50 bg-white dark:bg-slate-900',
            warning: 'border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900',
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${borders[t.type]}`}
            >
              {icons[t.type]}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.title}</h4>
                {t.message && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
