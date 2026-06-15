'use client';

import { useModal } from './Modal.viewmodel';
import type { ModalProps } from './types';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
} as const;

export function Modal({
  isOpen,
  title,
  description,
  onClose,
  children,
  size = 'md',
}: ModalProps) {
  const { handleBackdropClick } = useModal({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="modal-backdrop"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        data-testid="modal-content"
        className={`bg-white rounded-lg shadow-lg ${sizeClasses[size]} p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
