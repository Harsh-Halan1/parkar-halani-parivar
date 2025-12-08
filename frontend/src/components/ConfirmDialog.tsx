'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * ConfirmDialog Component
 * A reusable dialog for confirming destructive actions like delete operations
 *
 * Usage:
 * const [showConfirm, setShowConfirm] = useState(false);
 * const handleDelete = async () => {
 *   await api.delete(...);
 *   setShowConfirm(false);
 * };
 *
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   title="Delete Item?"
 *   description="This action cannot be undone."
 *   isDangerous
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirm dialog action failed:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-w-sm w-full animate-in">
          {/* Header */}
          <div className="border-b border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>

          {/* Content */}
          <div className="p-6">
            {description && (
              <p className="text-slate-300 text-sm">{description}</p>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700 p-6 flex gap-3 justify-end">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
