import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  };
  actions?: ReactNode;
  backButton?: boolean;
  backPath?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  badge, 
  actions,
  backButton,
  backPath 
}: PageHeaderProps) {
  const navigate = useNavigate();

  const getBadgeColor = (variant: string = 'primary') => {
    switch (variant) {
      case 'success': return 'var(--status-success)';
      case 'warning': return 'var(--status-warning)';
      case 'error': return 'var(--status-error)';
      case 'info': return 'var(--status-info)';
      default: return 'var(--primary-accent)';
    }
  };

  return (
    <div className="mb-6">
      {backButton && (
        <button
          onClick={() => backPath ? navigate(backPath) : navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--primary-accent)' }}
        >
          <ChevronLeft size={16} />
          Назад
        </button>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
            {badge && (
              <span
                className="px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap"
                style={{
                  background: `${getBadgeColor(badge.variant)}15`,
                  color: getBadgeColor(badge.variant),
                }}
              >
                {badge.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap md:w-auto md:justify-end md:flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
