import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-terminal-blue';
        let textClass = 'text-terminal-blue';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-terminal-green';
          textClass = 'text-terminal-green';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-terminal-gold';
          textClass = 'text-terminal-gold';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-terminal-red';
          textClass = 'text-terminal-red';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 bg-terminal-card border ${borderClass} px-3 py-2.5 rounded shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 shrink-0 ${textClass}`} />
              <span className="text-xs text-terminal-text">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-terminal-muted hover:text-terminal-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
