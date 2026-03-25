import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const config = {
    success: {
      icon: CheckCircle,
      bg: 'var(--status-success-bg)',
      border: 'var(--status-success-border)',
      color: 'var(--status-success)',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'var(--status-warning-bg)',
      border: 'var(--status-warning-border)',
      color: 'var(--status-warning)',
    },
    error: {
      icon: XCircle,
      bg: 'var(--status-error-bg)',
      border: 'var(--status-error-border)',
      color: 'var(--status-error)',
    },
    info: {
      icon: Info,
      bg: 'var(--status-info-bg)',
      border: 'var(--status-info-border)',
      color: 'var(--status-info)',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      className="rounded-lg p-4 border flex items-start gap-3"
      style={{
        background: config.bg,
        borderColor: config.border,
      }}
    >
      <Icon size={20} style={{ color: config.color, flexShrink: 0, marginTop: 2 }} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {title}
          </p>
        )}
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/10"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
