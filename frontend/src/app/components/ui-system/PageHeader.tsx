import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="border-b" style={{ borderColor: 'var(--ghost-border)' }}>
      <div className="px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
                )}
                <span 
                  className="text-sm"
                  style={{ 
                    color: index === breadcrumbs.length - 1 
                      ? 'var(--text-secondary)' 
                      : 'var(--text-tertiary)' 
                  }}
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ color: 'var(--text-primary)' }}>{title}</h1>
            {description && (
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
