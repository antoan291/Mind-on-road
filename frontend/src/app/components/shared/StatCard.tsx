import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon?: ReactNode;
  color?: string;
  subtitle?: string;
}

export function StatCard({ label, value, trend, icon, color = 'var(--primary-accent)', subtitle }: StatCardProps) {
  return (
    <div className="p-6 rounded-xl" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <div style={{ color }}>
              {icon}
            </div>
          </div>
        )}
      </div>
      <div className="text-3xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      {(trend || subtitle) && (
        <div className="text-sm font-medium" style={{ color }}>
          {trend || subtitle}
        </div>
      )}
    </div>
  );
}

interface CompactStatProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function CompactStat({ label, value, subtitle, color = 'var(--primary-accent)' }: CompactStatProps) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
      <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
      {subtitle && (
        <div className="text-xs font-medium" style={{ color }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
