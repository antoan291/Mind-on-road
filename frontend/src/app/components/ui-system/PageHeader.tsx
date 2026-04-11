import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  path?: string;
  onClick?: () => void;
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
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex min-w-0 items-center gap-2">
                {index > 0 && (
                  <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
                )}
                {crumb.onClick || crumb.path ? (
                  <button
                    type="button"
                    className="max-w-full truncate text-sm hover:opacity-80"
                    style={{
                      color: index === breadcrumbs.length - 1
                        ? 'var(--text-secondary)'
                        : 'var(--text-tertiary)'
                    }}
                    onClick={() => crumb.onClick?.()}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span
                    className="max-w-full truncate text-sm"
                    style={{
                      color: index === breadcrumbs.length - 1
                        ? 'var(--text-secondary)'
                        : 'var(--text-tertiary)'
                    }}
                  >
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 style={{ color: 'var(--text-primary)' }}>{title}</h1>
            {description && (
              <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
