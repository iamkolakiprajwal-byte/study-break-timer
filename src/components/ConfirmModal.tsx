import React, { useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-float p-6 border border-border/80 transform transition-all">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDestructive ? "bg-status-error-light text-status-error" : "bg-primary-light text-primary"
            }`}
          >
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 id="confirm-modal-title" className="text-lg font-semibold text-navy leading-snug">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:text-navy hover:bg-surface-soft transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 ${
              isDestructive
                ? "bg-status-error hover:bg-red-600 focus:ring-status-error/30"
                : "bg-primary hover:bg-primary-hover focus:ring-primary/30"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
