import { StatusBadge } from '../../../components/ui-system/StatusBadge';
import { VehicleRow } from '../secondaryData';
import { statusLabel } from '../secondaryShared';

type Props = {
  vehicles: VehicleRow[];
};

export function VehicleCards({ vehicles }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((item) => (
        <article
          key={item.vehicle}
          className="rounded-3xl p-5 h-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid var(--ghost-border)',
            boxShadow: '0 20px 50px rgba(2, 6, 23, 0.16)',
          }}
        >
          <div className="flex h-full flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {item.vehicle}
                </h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.instructor}
                </p>
              </div>
              <StatusBadge status={item.status}>{statusLabel(item.status)}</StatusBadge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-3" style={{ background: 'var(--bg-card-elevated)' }}>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>Категория</p>
                <p className="mt-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{item.category}</p>
              </div>
              <div className="rounded-2xl p-3" style={{ background: 'var(--bg-card-elevated)' }}>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>Активни часове</p>
                <p className="mt-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{item.activeLessons}</p>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between gap-3 text-sm">
                <span style={{ color: 'var(--text-tertiary)' }}>Следващ преглед</span>
                <span style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>{item.nextInspection}</span>
              </div>
              <div className="flex items-start justify-between gap-3 text-sm">
                <span style={{ color: 'var(--text-tertiary)' }}>Инструктор</span>
                <span style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>{item.instructor}</span>
              </div>
            </div>

            <div
              className="mt-auto rounded-2xl p-3"
              style={{
                background:
                  item.status === 'warning'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : item.status === 'success'
                      ? 'rgba(34, 197, 94, 0.12)'
                      : 'rgba(59, 130, 246, 0.12)',
                border:
                  item.status === 'warning'
                    ? '1px solid rgba(245, 158, 11, 0.24)'
                    : item.status === 'success'
                      ? '1px solid rgba(34, 197, 94, 0.24)'
                      : '1px solid rgba(59, 130, 246, 0.24)',
              }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Оперативна бележка</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{item.issue}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
