import { CircleDollarSign, ReceiptText, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { DataTableLayout, MetricCard, MetricGrid, PageSection, Panel } from './secondaryShared';
import { formatDashboardMoney, reportEntries } from './reportingData';

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

export function ReportsPage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const scopedEntries = useMemo(() => reportEntries.filter((entry) => matchesPeriod(entry.date, periodFilter)), [periodFilter]);
  const incomeEntries = scopedEntries.filter((entry) => entry.type === 'income');
  const expenseEntries = scopedEntries.filter((entry) => entry.type === 'expense');
  const income = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const result = income - expenses;

  const categoryBreakdown = Array.from(
    scopedEntries.reduce((map, entry) => {
      const current = map.get(entry.category) ?? 0;
      map.set(entry.category, current + entry.amount);
      return map;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  const monthlySummary = [
    { label: 'Януари 2026', income: reportEntries.filter((entry) => entry.type === 'income' && entry.date.startsWith('2026-01')).reduce((sum, entry) => sum + entry.amount, 0), expenses: reportEntries.filter((entry) => entry.type === 'expense' && entry.date.startsWith('2026-01')).reduce((sum, entry) => sum + entry.amount, 0) },
    { label: 'Февруари 2026', income: reportEntries.filter((entry) => entry.type === 'income' && entry.date.startsWith('2026-02')).reduce((sum, entry) => sum + entry.amount, 0), expenses: reportEntries.filter((entry) => entry.type === 'expense' && entry.date.startsWith('2026-02')).reduce((sum, entry) => sum + entry.amount, 0) },
    { label: 'Март 2026', income: reportEntries.filter((entry) => entry.type === 'income' && entry.date.startsWith('2026-03')).reduce((sum, entry) => sum + entry.amount, 0), expenses: reportEntries.filter((entry) => entry.type === 'expense' && entry.date.startsWith('2026-03')).reduce((sum, entry) => sum + entry.amount, 0) },
  ];

  const periodLabel = periodFilter === 'month' ? 'текущия месец' : periodFilter === 'quarter' ? 'текущото тримесечие' : 'текущата година';
  const resultLabel = result >= 0 ? 'Печалба' : 'Загуба';
  const resultColor = result >= 0 ? 'var(--status-success)' : 'var(--status-error)';

  return (
    <div>
      <PageHeader
        title="Отчети"
        description="Аналитичен финансов изглед за собственика и администрацията. Тук само се следи какво се е случило, без оперативно добавяне на записи."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Отчети' }]}
      />
      <PageSection>
        <Panel title="Период за анализ" subtitle="Изберете период и вижте каква е общата картина. Оперативното въвеждане на плащания и разходи вече е в отделните страници Плащания и Разходи.">
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

        <div className="rounded-3xl px-6 py-5" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(25, 37, 64, 0.92))', border: '1px solid var(--ghost-border)' }}>
          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--text-tertiary)' }}>Финансов резултат</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: resultColor }}>{resultLabel} {formatDashboardMoney(Math.abs(result))}</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>За {periodLabel}</p>
        </div>

        <MetricGrid>
          <MetricCard icon={<TrendingUp size={18} />} label="Приходи" value={formatDashboardMoney(income)} detail="Постъпления за периода" tone="success" />
          <MetricCard icon={<TrendingDown size={18} />} label="Разходи" value={formatDashboardMoney(expenses)} detail="Всички фирмени разходи" tone="warning" />
          <MetricCard icon={<CircleDollarSign size={18} />} label="Нетен резултат" value={formatDashboardMoney(result)} detail="Разлика между приходи и разходи" tone={result >= 0 ? 'success' : 'error'} />
          <MetricCard icon={<ReceiptText size={18} />} label="Финансови движения" value={String(scopedEntries.length)} detail="Записи за избрания период" tone="info" />
        </MetricGrid>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Разбивка по категории" subtitle="Показва кои категории движат най-много пари в избрания период.">
            <DataTableLayout
              columns={['Категория', 'Обща сума']}
              rows={categoryBreakdown.map(([category, amount]) => [category, formatDashboardMoney(amount)])}
            />
          </Panel>

          <Panel title="Месечен обзор" subtitle="Бързо сравнение на последните месеци, за да се вижда как се движи бизнесът във времето.">
            <DataTableLayout
              columns={['Месец', 'Приходи', 'Разходи', 'Резултат']}
              rows={monthlySummary.map((item) => [item.label, formatDashboardMoney(item.income), formatDashboardMoney(item.expenses), formatDashboardMoney(item.income - item.expenses)])}
            />
          </Panel>
        </div>
        <Panel title="Последни финансови движения" subtitle="Read-only поглед върху последните записи, които участват в отчетите. Ако трябва корекция, тя се прави в Плащания или Разходи.">
          <DataTableLayout
            columns={['Дата', 'Запис', 'Тип', 'Източник', 'Сума']}
            rows={scopedEntries.slice(0, 10).map((entry) => [new Date(entry.date).toLocaleDateString('bg-BG'), entry.title, entry.type === 'income' ? 'Приход' : 'Разход', entry.source, formatDashboardMoney(entry.amount)])}
          />
        </Panel>
      </PageSection>
    </div>
  );
}

