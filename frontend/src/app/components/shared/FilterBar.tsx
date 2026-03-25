import { ReactNode } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Търсене...',
  filters,
  actions,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-11 pl-10 pr-10 rounded-xl text-sm transition-all focus:outline-none"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center transition-all hover:opacity-70"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      {filters && <div className="flex gap-2">{filters}</div>}

      {/* Actions */}
      {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

interface FilterPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  count?: number;
}

export function FilterPill({ label, active, onClick, count }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className="h-11 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-90 whitespace-nowrap"
      style={{
        background: active ? 'var(--primary-accent)' : 'var(--bg-card)',
        color: active ? '#ffffff' : 'var(--text-secondary)',
      }}
    >
      {label}
      {count !== undefined && (
        <span className="ml-2 opacity-70">({count})</span>
      )}
    </button>
  );
}
