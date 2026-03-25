import { X } from 'lucide-react';
import { useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoint?: 'full' | 'half' | 'auto';
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children,
  snapPoint = 'auto'
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const heightClass = {
    full: 'h-[100vh]',
    half: 'h-[50vh]',
    auto: 'max-h-[85vh]',
  }[snapPoint];

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`relative w-full ${heightClass} rounded-t-2xl overflow-hidden animate-slide-up`}
        style={{ background: 'var(--bg-modal)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div 
            className="w-12 h-1 rounded-full"
            style={{ background: 'var(--ghost-border-strong)' }}
          />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--ghost-border)' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: snapPoint === 'auto' ? 'calc(85vh - 60px)' : '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Action Sheet variant for quick actions
interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'destructive';
  }[];
}

export function ActionSheet({ isOpen, onClose, title, actions }: ActionSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-4 space-y-2">
        {actions.map((action, index) => {
          const variantStyles = {
            default: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            },
            primary: {
              background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            },
            destructive: {
              background: 'var(--status-error)',
              color: '#ffffff',
            },
          }[action.variant || 'default'];

          return (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="w-full h-14 px-4 rounded-xl flex items-center gap-3 transition-all font-medium"
              style={{
                background: variantStyles.background,
                color: variantStyles.color,
              }}
            >
              {action.icon && <span>{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
