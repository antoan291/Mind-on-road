import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative flex max-h-[90vh] w-full ${sizeClasses} flex-col rounded-xl p-6 shadow-[var(--shadow-xl)]`}
        style={{ background: 'var(--bg-modal)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 overflow-y-auto">{children}</div>

        {footer && (
          <div
            className="mt-6 flex flex-wrap justify-end gap-3 border-t pt-4"
            style={{ borderColor: 'var(--ghost-border)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
