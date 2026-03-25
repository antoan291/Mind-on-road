import { Search, Filter, X, Download } from 'lucide-react';
import { Button } from './Button';

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  activeFiltersCount?: number;
}

export function FilterBar({
  searchPlaceholder = 'Търсене...',
  searchValue = '',
  onSearchChange,
  filters,
  actions,
  showFilterButton = true,
  onFilterClick,
  activeFiltersCount = 0,
}: FilterBarProps) {
  return (
    <div className="px-6 lg:px-8 py-4" style={{ background: 'var(--bg-panel)' }}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 -translate-y-1/2" 
              style={{ color: 'var(--text-tertiary)' }} 
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full h-11 rounded-lg pl-12 pr-4 border transition-all focus:outline-none focus:shadow-[var(--glow-indigo)]"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--ghost-border-medium)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Filters */}
        {filters && (
          <div className="flex gap-3 items-center flex-wrap">
            {filters}
          </div>
        )}

        {/* Filter Button */}
        {showFilterButton && (
          <div className="flex gap-3 items-center">
            <button
              onClick={onFilterClick}
              className="relative h-11 px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all hover:shadow-[var(--glow-indigo)]"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--ghost-border-medium)',
              }}
            >
              <Filter size={18} />
              <span>Филтри</span>
              {activeFiltersCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-semibold flex items-center justify-center"
                  style={{
                    background: 'var(--primary-accent)',
                    color: '#ffffff',
                  }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 items-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
