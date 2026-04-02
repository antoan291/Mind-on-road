import { CalendarDays, Download, Receipt, TrendingDown, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../components/ui-system/Button';
import { PageHeader } from '../components/ui-system/PageHeader';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import { DataTableLayout, MetricCard, MetricGrid, PageSection, Panel, statusLabel, type StatusTone } from './secondary/secondaryShared';
import { formatDashboardMoney, reportEntries } from './secondary/reportingData';

type PeriodFilter = 'month' | 'quarter' | 'year';

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'month', label: 'Текущ месец' },
  { value: 'quarter', label: 'Тримесечие' },
  { value: 'year', label: 'Година' },
];

function matchesPeriod(date: string, period: PeriodFilter) {
  if (period === 'month') return date.startsWith('2026-03');
  if (period === 'quarter') return date.startsWith('2026-03') || date.startsWith('2026-02') || date.startsWith('2026-01');
  return date.startsWith('2026');
}
function paymentMethodLabel(method: string) {
  if (method === 'bank') return 'Банков превод';
  if (method === 'card') return 'Карта';
  if (method === 'pos') return 'POS';
  return 'В брой';
}

export function ExpensesPage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');

  const expenses = useMemo(
    () => reportEntries.filter((entry) => entry.type === 'expense' && matchesPeriod(entry.date, periodFilter)),
    [periodFilter],
  );

  const totalExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);
  const maintenanceExpenses = expenses.filter((entry) => entry.category === 'Поддръжка').reduce((sum, entry) => sum + entry.amount, 0);
  const pendingExpenses = expenses.filter((entry) => entry.status === 'warning').length;
  const supplierCount = new Set(expenses.map((entry) => entry.source)).size;

  const groupedByCategory = Array.from(
    expenses.reduce((map, entry) => {
      const current = map.get(entry.category) ?? 0;
      map.set(entry.category, current + entry.amount);
      return map;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <PageHeader
        title="Разходи"
        description="Оперативен регистър за всички фирмени разходи, по който администрацията следи доставчици, категории и суми."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Разходи' }]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>Експорт</Button>
            <Button variant="primary" icon={<Receipt size={18} />}>Добави разход</Button>
          </>
        }
      />
      <PageSection>
        <Panel title="Период за преглед" subtitle="Разходи е работна страница за реалните разходни записи. Отчетите остават отделно като аналитичен слой.">
          <div className="flex flex-wrap gap-3">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriodFilter(option.value)}
                className="inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition-all"
                style={{
                  background: periodFilter === option.value ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                  border: periodFilter === option.value ? '1px solid rgba(99, 102, 241, 0.28)' : '1px solid var(--ghost-border)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Panel>

        <MetricGrid>
          <MetricCard icon={<TrendingDown size={18} />} label="Общо разходи" value={formatDashboardMoney(totalExpenses)} detail="За избрания период" tone="warning" />
          <MetricCard icon={<Wallet size={18} />} label="Поддръжка и гориво" value={formatDashboardMoney(maintenanceExpenses)} detail="Най-честа разходна група" tone="info" />
          <MetricCard icon={<CalendarDays size={18} />} label="Чакащи разходи" value={String(pendingExpenses)} detail="Записи с нужда от потвърждение" tone={pendingExpenses > 0 ? 'warning' : 'success'} />
          <MetricCard icon={<Receipt size={18} />} label="Доставчици" value={String(supplierCount)} detail="Уникални източници на разход" tone="neutral" />
        </MetricGrid>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Регистър на разходите" subtitle="Всеки ред е реален разходен запис с категория, сума, дата, доставчик и статус.">
            <DataTableLayout
              columns={['Разход', 'Категория', 'Сума', 'Дата', 'Доставчик', 'Метод', 'Статус']}
              rows={expenses.map((entry) => [
                entry.title,
                entry.category,
                formatDashboardMoney(entry.amount),
                new Date(entry.date).toLocaleDateString('bg-BG'),
                entry.source,
                paymentMethodLabel(entry.paymentMethod),
                <StatusBadge key={entry.id} status={entry.status as StatusTone}>{statusLabel(entry.status as StatusTone)}</StatusBadge>,
              ])}
            />
          </Panel>
          <Panel title="Разходи по категории" subtitle="Тази разбивка помага да се вижда къде отиват най-много пари и кои категории тежат най-много на бизнеса.">
            <div className="space-y-3">
              {groupedByCategory.map(([category, amount]) => (
                <div key={category} className="rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{category}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>Категория разход</p>
                    </div>
                    <p className="text-lg font-semibold" style={{ color: 'var(--status-warning)' }}>{formatDashboardMoney(amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </PageSection>
    </div>
  );
}

