import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Alert({ variant, title, message, onDismiss, action }: AlertProps) {
  const getVariantConfig = () => {
    switch (variant) {
      case 'success':
        return {
          icon: <CheckCircle size={20} />,
          bg: 'var(--status-success-bg)',
          border: 'var(--status-success-border)',
          color: 'var(--status-success)',
        };
      case 'warning':
        return {
          icon: <AlertCircle size={20} />,
          bg: 'var(--status-warning-bg)',
          border: 'var(--status-warning-border)',
          color: 'var(--status-warning)',
        };
      case 'error':
        return {
          icon: <XCircle size={20} />,
          bg: 'var(--status-error-bg)',
          border: 'var(--status-error-border)',
          color: 'var(--status-error)',
        };
      case 'info':
        return {
          icon: <Info size={20} />,
          bg: 'var(--status-info-bg)',
          border: 'var(--status-info-border)',
          color: 'var(--status-info)',
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div
      className="p-4 rounded-xl flex items-start gap-3"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <div className="flex-shrink-0 mt-0.5" style={{ color: config.color }}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-medium mb-1" style={{ color: config.color }}>
            {title}
          </div>
        )}
        <div className="text-sm" style={{ color: config.color }}>
          {message}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 text-sm font-medium underline hover:opacity-80"
            style={{ color: config.color }}
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all hover:opacity-70"
          style={{ color: config.color }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
