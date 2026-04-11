import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: {
    label: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  };
  actions?: ReactNode;
  backButton?: boolean;
  backPath?: string;
  breadcrumbs?: Array<{
    label: string;
    path?: string;
    onClick?: () => void;
  }>;
}

export function PageHeader({ 
  title, 
  subtitle, 
  description,
  badge, 
  actions,
  backButton,
  backPath,
  breadcrumbs,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const supportingText = description ?? subtitle;

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
    <div className="mb-6 px-4 sm:px-6 lg:px-8">
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

      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const content = (
              <>
                {index > 0 && <span style={{ color: 'var(--text-tertiary)' }}>/</span>}
                <span
                  style={{
                    color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {crumb.label}
                </span>
              </>
            );

            if (crumb.onClick || crumb.path) {
              return (
                <button
                  key={`${crumb.label}-${index}`}
                  type="button"
                  className="flex items-center gap-2 hover:opacity-80"
                  onClick={() => {
                    crumb.onClick?.();
                    if (!crumb.onClick && crumb.path) {
                      navigate(crumb.path);
                    }
                  }}
                >
                  {content}
                </button>
              );
            }

            return (
              <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                {content}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="truncate text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
            {badge && (
              <span
                className="whitespace-nowrap rounded-lg px-3 py-1 text-sm font-medium"
                style={{
                  background: `${getBadgeColor(badge.variant)}15`,
                  color: getBadgeColor(badge.variant),
                }}
              >
                {badge.label}
              </span>
            )}
          </div>
          {supportingText && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {supportingText}
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
