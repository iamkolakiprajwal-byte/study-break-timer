import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-status-warning flex-shrink-0" />,
          error: <XCircle className="w-5 h-5 text-status-error flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-primary flex-shrink-0" />,
        };

        const borders = {
          success: "border-status-success/30 bg-white",
          warning: "border-status-warning/30 bg-white",
          error: "border-status-error/30 bg-white",
          info: "border-primary/30 bg-white",
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-card border ${
              borders[toast.type]
            } animate-slideUp transition-all`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="mt-1 text-xs text-text-secondary leading-normal">{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-text-muted hover:text-navy p-1 rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
