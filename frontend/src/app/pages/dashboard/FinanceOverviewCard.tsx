import { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader } from '../../components/shared';
import type { ExpenseRecordView } from '../../services/expensesApi';
import type { PaymentRecordView } from '../../services/paymentsApi';
import { dashboardFinanceContent } from './dashboardContent';
import {
  buildReportEntriesFromFinanceRecords,
  formatDashboardMoney,
  reportEntries,
} from '../secondary/reportingData';

type FinanceRange = 'day' | 'month' | 'year';
type FinanceTotals = { income: number; expense: number; count: number };

const latestReportDate = reportEntries.reduce((latest, entry) => (entry.date > latest ? entry.date : latest), reportEntries[0]?.date ?? '2026-03-01');

function getFinanceWindow(date: string, range: FinanceRange) {
  const current = parseFinanceDate(date);
  if (range === 'day') {
    const start = new Date(current);
    const end = new Date(current);
    return { start, end, label: current.toLocaleDateString('bg-BG') };
  }
  if (range === 'month') {
    const start = new Date(current.getFullYear(), current.getMonth(), 1);
    const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    return { start, end, label: start.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' }) };
  }
  const start = new Date(current.getFullYear(), 0, 1);
  const end = new Date(current.getFullYear(), 11, 31);
  return { start, end, label: String(current.getFullYear()) };
}

function shiftFinanceWindow(date: string, range: FinanceRange, direction: -1 | 1) {
  const current = parseFinanceDate(date);
  if (range === 'day') current.setDate(current.getDate() + direction);
  else if (range === 'month') current.setMonth(current.getMonth() + direction);
  else current.setFullYear(current.getFullYear() + direction);
  return current.toISOString().slice(0, 10);
}

function getFinanceTotals(
  range: FinanceRange,
  anchorDate: string,
  entries: Array<{ date: string; type: 'income' | 'expense'; amount: number }>,
): FinanceTotals {
  const window = getFinanceWindow(anchorDate, range);
  const visibleEntries = entries.filter((entry) => {
    const value = parseFinanceDate(entry.date);
    return value >= window.start && value <= window.end;
  });
  return {
    income: visibleEntries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0),
    expense: visibleEntries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0),
    count: visibleEntries.length,
  };
}

function parseFinanceDate(value: string) {
  const normalizedValue =
    /^\d{2}\.\d{2}\.\d{4}$/.test(value)
      ? value.split('.').reverse().join('-')
      : value;
  const parsed = new Date(`${normalizedValue}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return new Date('2026-04-04T12:00:00');
  }

  return parsed;
}

function FinanceFilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className='rounded-full px-4 py-2.5 text-sm font-medium transition-all' style={{ background: active ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.92), rgba(99, 102, 241, 0.92))' : 'rgba(255,255,255,0.03)', color: active ? '#ffffff' : 'var(--text-secondary)', border: active ? '1px solid rgba(139, 92, 246, 0.42)' : '1px solid var(--ghost-border)', boxShadow: active ? '0 12px 26px rgba(99, 102, 241, 0.22)' : 'none' }}>
      {label}
    </button>
  );
}

function FinanceMiniStat({ label, value, tone }: { label: string; value: string; tone: 'success' | 'warning' | 'info' }) {
  const color = tone === 'success' ? 'var(--status-success)' : tone === 'warning' ? 'var(--status-warning)' : 'var(--ai-accent)';
  return (
    <div className='rounded-2xl p-4' style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ghost-border)' }}>
      <p className='text-xs uppercase tracking-[0.16em]' style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className='mt-2 text-lg font-semibold' style={{ color }}>{value}</p>
    </div>
  );
}

export function FinanceOverviewCard({
  payments,
  expenses,
}: {
  payments?: PaymentRecordView[];
  expenses?: ExpenseRecordView[];
}) {
  const [financeRange, setFinanceRange] = useState<FinanceRange>('month');
  const financeEntries = useMemo(() => {
    const sourceEntries =
      payments || expenses
        ? buildReportEntriesFromFinanceRecords(payments ?? [], expenses ?? [])
        : reportEntries;

    return sourceEntries.flatMap((entry) => {
      if (entry.type === 'friend-vat-expense') {
        return [];
      }

      return [{
        date: entry.date,
        type: entry.type,
        amount: entry.amount,
      }];
    });
  }, [expenses, payments]);
  const financeAnchorDate = useMemo(
    () =>
      financeEntries.reduce(
        (latest, entry) => (entry.date > latest ? entry.date : latest),
        latestReportDate,
      ),
    [financeEntries],
  );
  const financeWindow = useMemo(
    () => getFinanceWindow(financeAnchorDate, financeRange),
    [financeAnchorDate, financeRange],
  );
  const financeTotals = useMemo(
    () => getFinanceTotals(financeRange, financeAnchorDate, financeEntries),
    [financeAnchorDate, financeEntries, financeRange],
  );
  const previousFinanceTotals = useMemo(
    () =>
      getFinanceTotals(
        financeRange,
        shiftFinanceWindow(financeAnchorDate, financeRange, -1),
        financeEntries,
      ),
    [financeAnchorDate, financeEntries, financeRange],
  );
  const financeNet = financeTotals.income - financeTotals.expense;
  const financePreviousNet = previousFinanceTotals.income - previousFinanceTotals.expense;
  const financeDelta = financeNet - financePreviousNet;
  const financeToneColor = financeNet >= 0 ? 'var(--status-success)' : 'var(--status-error)';
  const financeToneLabel = financeNet >= 0 ? 'Печалба' : 'Загуба';
  const trendBars = useMemo(() => {
    const maxValue = Math.max(financeTotals.income, financeTotals.expense, Math.max(financePreviousNet, 0), 1);
    return [
      { label: 'Приходи', value: financeTotals.income, color: '#8b5cf6' },
      { label: 'Разходи', value: financeTotals.expense, color: '#f97316' },
      { label: 'Преди', value: Math.max(financePreviousNet, 0), color: '#6366f1' },
    ].map((item) => ({ ...item, height: Math.max(20, Math.round((item.value / maxValue) * 92)) }));
  }, [financePreviousNet, financeTotals.expense, financeTotals.income]);

  return (
    <Card>
      <CardHeader title={dashboardFinanceContent.title} subtitle={dashboardFinanceContent.subtitle} />
      <div className='space-y-5'>
        <div className='flex flex-wrap items-center gap-3'>
          <FinanceFilterButton label={dashboardFinanceContent.filters.day} active={financeRange === 'day'} onClick={() => setFinanceRange('day')} />
          <FinanceFilterButton label={dashboardFinanceContent.filters.month} active={financeRange === 'month'} onClick={() => setFinanceRange('month')} />
          <FinanceFilterButton label={dashboardFinanceContent.filters.year} active={financeRange === 'year'} onClick={() => setFinanceRange('year')} />
        </div>

        <div className='grid gap-5 xl:grid-cols-[1.15fr_0.85fr]'>
          <div className='rounded-3xl p-5' style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(31, 41, 55, 0.92))', border: '1px solid var(--ghost-border)' }}>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.18em]' style={{ color: 'var(--text-tertiary)' }}>{dashboardFinanceContent.summaryLabel}</p>
                <h3 className='mt-3 text-3xl font-semibold' style={{ color: financeToneColor }}>{financeToneLabel} {formatDashboardMoney(Math.abs(financeNet))}</h3>
                <p className='mt-2 text-sm' style={{ color: 'var(--text-secondary)' }}>{financeWindow.label}</p>
              </div>
              <div className='rounded-2xl px-4 py-3' style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ghost-border)' }}>
                <p className='text-xs uppercase tracking-[0.14em]' style={{ color: 'var(--text-tertiary)' }}>{dashboardFinanceContent.comparisonLabel}</p>
                <p className='mt-2 text-lg font-semibold' style={{ color: financeDelta >= 0 ? 'var(--status-success)' : 'var(--status-error)' }}>{(financeDelta > 0 ? '+' : '') + formatDashboardMoney(financeDelta)}</p>
              </div>
            </div>
            <div className='mt-5 grid gap-3 sm:grid-cols-3'>
              <FinanceMiniStat label={dashboardFinanceContent.incomeLabel} value={formatDashboardMoney(financeTotals.income)} tone='success' />
              <FinanceMiniStat label={dashboardFinanceContent.expenseLabel} value={formatDashboardMoney(financeTotals.expense)} tone='warning' />
              <FinanceMiniStat label={dashboardFinanceContent.recordsLabel} value={String(financeTotals.count)} tone='info' />
            </div>
          </div>

          <div className='rounded-3xl p-5' style={{ background: 'var(--bg-panel)', border: '1px solid var(--ghost-border)' }}>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>{dashboardFinanceContent.trendTitle}</p>
                <p className='mt-1 text-xs' style={{ color: 'var(--text-tertiary)' }}>{dashboardFinanceContent.trendSubtitle}</p>
              </div>
              <div className='flex h-10 w-10 items-center justify-center rounded-2xl' style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--ai-accent)' }}>
                <BarChart3 size={18} />
              </div>
            </div>

            <div className='mt-6 flex items-end gap-4'>
              {trendBars.map((bar) => (
                <div key={bar.label} className='flex-1 text-center'>
                  <div className='mx-auto flex h-28 w-full max-w-[72px] items-end rounded-2xl px-2 py-2' style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className='w-full rounded-xl' style={{ height: `${bar.height}px`, background: bar.color }} />
                  </div>
                  <p className='mt-3 text-xs uppercase tracking-[0.14em]' style={{ color: 'var(--text-tertiary)' }}>{bar.label}</p>
                  <p className='mt-1 text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>{formatDashboardMoney(bar.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
