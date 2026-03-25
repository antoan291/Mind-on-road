interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'overdue' | 'info' | 'neutral';
  children: React.ReactNode;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, children, size = 'medium' }: StatusBadgeProps) {
  const colors = {
    success: { 
      bg: 'var(--status-success-bg)', 
      border: 'var(--status-success-border)', 
      text: 'var(--status-success)' 
    },
    warning: { 
      bg: 'var(--status-warning-bg)', 
      border: 'var(--status-warning-border)', 
      text: 'var(--status-warning)' 
    },
    error: { 
      bg: 'var(--status-error-bg)', 
      border: 'var(--status-error-border)', 
      text: 'var(--status-error)' 
    },
    overdue: { 
      bg: 'var(--status-overdue-bg)', 
      border: 'var(--status-overdue-border)', 
      text: 'var(--status-overdue)' 
    },
    info: { 
      bg: 'var(--status-info-bg)', 
      border: 'var(--status-info-border)', 
      text: 'var(--status-info)' 
    },
    neutral: { 
      bg: 'var(--status-neutral-bg)', 
      border: 'var(--status-neutral-border)', 
      text: 'var(--status-neutral)' 
    },
  }[status];

  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-md font-medium border`}
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.text }} />
      {children}
    </span>
  );
}
