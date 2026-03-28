import type { ReactNode } from 'react';
import { Search, Bell, Settings2 } from 'lucide-react';
import type { AITabKey } from './aiCenterData';
import { aiTabs } from './aiCenterData';

type Props = {
  activeTab: AITabKey;
  onChange: (tab: AITabKey) => void;
};

export function AICenterTabs({ activeTab, onChange }: Props) {
  return (
    <div className="rounded-[28px] p-4 lg:p-5" style={{ background: 'rgba(8, 14, 30, 0.94)', border: '1px solid rgba(148, 163, 184, 0.14)' }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {aiTabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className="rounded-full px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.9), rgba(99, 102, 241, 0.9))' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid rgba(139, 92, 246, 0.45)' : '1px solid rgba(148, 163, 184, 0.12)',
                  boxShadow: isActive ? '0 14px 34px rgba(99, 102, 241, 0.28)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            className="flex min-w-[260px] items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(2, 6, 23, 0.88)', border: '1px solid rgba(148, 163, 184, 0.14)' }}
          >
            <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Търсене...
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ToolbarIcon icon={<Bell size={16} />} />
            <ToolbarIcon icon={<Settings2 size={16} />} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarIcon({ icon }: { icon: ReactNode }) {
  return (
    <button
      className="flex h-11 w-11 items-center justify-center rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid rgba(148, 163, 184, 0.12)' }}
    >
      {icon}
    </button>
  );
}

