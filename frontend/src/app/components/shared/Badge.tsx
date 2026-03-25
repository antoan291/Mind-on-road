import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'md',
  icon,
  className = '' 
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
      case 'blue':
        return {
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#6366f1',
        };
      case 'success':
      case 'green':
        return {
          background: 'rgba(34, 197, 94, 0.15)',
          color: '#22c55e',
        };
      case 'warning':
      case 'orange':
        return {
          background: 'rgba(251, 146, 60, 0.15)',
          color: '#fb923c',
        };
      case 'error':
      case 'red':
        return {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
        };
      case 'info':
        return {
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
        };
      case 'purple':
        return {
          background: 'rgba(167, 139, 250, 0.15)',
          color: '#a78bfa',
        };
      case 'neutral':
      case 'gray':
        return {
          background: 'rgba(156, 163, 175, 0.15)',
          color: '#9ca3af',
        };
      default:
        return {
          background: 'var(--bg-panel)',
          color: 'var(--text-secondary)',
        };
    }
  };

  return (
    <span
      className={`
        ${sizeClasses[size]}
        rounded-lg font-medium inline-flex items-center gap-1.5 whitespace-nowrap
        ${className}
      `}
      style={getVariantStyles()}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Status-specific badges
export function StatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' | 'completed' | 'canceled' }) {
  const statusConfig = {
    active: { label: 'Активен', variant: 'success' as const },
    inactive: { label: 'Неактивен', variant: 'neutral' as const },
    pending: { label: 'Изчаква', variant: 'warning' as const },
    completed: { label: 'Завършен', variant: 'success' as const },
    canceled: { label: 'Отменен', variant: 'error' as const },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}