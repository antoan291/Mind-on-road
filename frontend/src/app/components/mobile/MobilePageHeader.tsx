import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function MobilePageHeader({ title, subtitle, showBack = false, actions }: MobilePageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="px-4 py-4 border-b"
      style={{ 
        background: 'var(--bg-panel)',
        borderColor: 'var(--ghost-border)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg truncate" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
