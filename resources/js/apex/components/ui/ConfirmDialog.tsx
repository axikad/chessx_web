import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          variant === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{message}</p>

        <div className="flex items-center justify-center gap-3 w-full mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
