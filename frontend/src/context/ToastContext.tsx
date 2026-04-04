import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast, ToastType } from '../types';

interface ToastContextType {
  addToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const MAX_TOASTS = 3;
let toastId = 0;

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = String(++toastId);
    setToasts(prev => {
      const next = [...prev, { id, type, message, duration }];
      return next.slice(-MAX_TOASTS);
    });
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const value: ToastContextType = {
    addToast,
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg, 6000),
    info: (msg) => addToast('info', msg),
    warning: (msg) => addToast('warning', msg, 5000),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = iconMap[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`toast toast-${toast.type}`}
              >
                <Icon size={18} className="toast-icon" />
                <span className="toast-message">{toast.message}</span>
                <button className="toast-close" onClick={() => removeToast(toast.id)}>
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
