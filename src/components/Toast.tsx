import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const styles = {
    success: 'border-green-500/50 bg-green-500/10 text-green-400',
    error: 'border-red-500/50 bg-red-500/10 text-red-400',
    info: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  };

  const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? AlertCircle : Info;

  return (
    <div
      className={`
        pointer-events-auto backdrop-blur-xl border ${styles[toast.type]} 
        px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 
        min-w-[300px] animate-fade-in relative overflow-hidden group
      `}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar animation could go here */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-current w-full opacity-20 animate-[shrink_4s_linear_forwards]" />
    </div>
  );
};
