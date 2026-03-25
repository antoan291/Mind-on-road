import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'var(--bg-card)' }}
      >
        <div style={{ color: 'var(--text-tertiary)' }}>
          {icon}
        </div>
      </div>
      <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="h-11 px-6 rounded-xl font-medium transition-all hover:opacity-90"
          style={{
            background: 'var(--primary-accent)',
            color: '#ffffff',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
