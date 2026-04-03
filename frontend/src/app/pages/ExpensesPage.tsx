import {
  Banknote,
  CalendarDays,
  Download,
  Receipt,
  TrendingDown,
  UserRound,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../components/ui-system/Button';
import { FilterBar } from '../components/ui-system/FilterBar';
import { PageHeader } from '../components/ui-system/PageHeader';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import {
  InfoLine,
  MetricCard,
  MetricGrid,
  PageSection,
  Panel,
  statusLabel,
  type StatusTone,
} from './secondary/secondaryShared';
import {
  formatDashboardMoney,
  reportEntries,
  type DashboardReportEntry,
} from './secondary/reportingData';

type PeriodFilter = 'month' | 'quarter' | 'year';
type ExpenseFilter = 'all' | 'real' | 'friend-vat';

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'month', label: 'Текущ месец' },
  { value: 'quarter', label: 'Тримесечие' },
  { value: 'year', label: 'Година' },
];

const expenseTypeOptions: { value: ExpenseFilter; label: string }[] = [
  { value: 'all', label: 'Всички записи' },
  { value: 'real', label: 'Само реални разходи' },
  { value: 'friend-vat', label: 'Само ДДС от приятели' },
];

function matchesPeriod(date: string, period: PeriodFilter) {
  if (period === 'month') return date.startsWith('2026-03');
  if (period === 'quarter') {
    return date.startsWith('2026-03') || date.startsWith('2026-02') || date.startsWith('2026-01');
  }
  return date.startsWith('2026');
}

function paymentMethodLabel(method: string) {
  if (method === 'bank') return 'Банков превод';
  if (method === 'card') return 'Карта';
  if (method === 'pos') return 'POS';
  return 'В брой';
}

function isVisibleByType(entry: DashboardReportEntry, filter: ExpenseFilter) {
  if (filter === 'all') return true;
  if (filter === 'real') return entry.type === 'expense' && entry.affectsOperationalExpense !== false;
  return entry.type === 'friend-vat-expense';
}

export function ExpensesPage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [expenseFilter, setExpenseFilter] = useState<ExpenseFilter>('all');
  const [searchValue, setSearchValue] = useState('');

  const expenses = useMemo(
    () =>
      reportEntries.filter(
        (entry) =>
          (entry.type === 'expense' || entry.type === 'friend-vat-expense') &&
          matchesPeriod(entry.date, periodFilter) &&
          isVisibleByType(entry, expenseFilter) &&
          [entry.title, entry.category, entry.source, entry.counterparty, entry.note]
            .join(' ')
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()),
      ),
    [expenseFilter, periodFilter, searchValue],
  );

  const realExpenses = expenses.filter(
    (entry) => entry.type === 'expense' && entry.affectsOperationalExpense !== false,
  );
  const friendVatExpenses = expenses.filter((entry) => entry.type === 'friend-vat-expense');

  const totalExpenses = realExpenses.reduce((sum, entry) => sum + entry.amount, 0);
  const maintenanceExpenses = realExpenses
    .filter((entry) => entry.category === 'Поддръжка')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const pendingExpenses = expenses.filter((entry) => entry.status === 'warning').length;
  const friendVatBase = friendVatExpenses.reduce((sum, entry) => sum + entry.amount, 0);
  const friendVatAmount = friendVatExpenses.reduce((sum, entry) => sum + (entry.vatAmount ?? 0), 0);

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
        description="Удобен работен екран без хоризонтално избиване: разходите са cards, а ДДС редовете от приятели са ясно отделени."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Разходи' }]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Receipt size={18} />}>
              Добави разход
            </Button>
          </>
        }
      />

      <FilterBar
        searchPlaceholder="Търсене по разход, категория, доставчик или бележка..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={false}
      />

      <PageSection>
        <MetricGrid>
          <MetricCard
            icon={<TrendingDown size={18} />}
            label="Реални разходи"
            value={formatDashboardMoney(totalExpenses)}
            detail="Без приятелски ДДС редове"
            tone="warning"
          />
          <MetricCard
            icon={<Wallet size={18} />}
            label="Поддръжка и гориво"
            value={formatDashboardMoney(maintenanceExpenses)}
            detail="Само реални оперативни разходи"
            tone="info"
          />
          <MetricCard
            icon={<CalendarDays size={18} />}
            label="Чакащи записи"
            value={String(pendingExpenses)}
            detail="Нужда от преглед/потвърждение"
            tone={pendingExpenses > 0 ? 'warning' : 'success'}
          />
          <MetricCard
            icon={<Receipt size={18} />}
            label="ДДС от приятели"
            value={formatDashboardMoney(friendVatAmount)}
            detail={`Основа ${formatDashboardMoney(friendVatBase)}`}
            tone={friendVatAmount > 0 ? 'info' : 'neutral'}
          />
        </MetricGrid>

        <Panel
          title="Филтри"
          subtitle="Смени периода и типа записи без странична навигация и без да товариш таблица извън екрана."
        >
          <div className="flex flex-wrap gap-3">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriodFilter(option.value)}
                className="inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition-all"
                style={{
                  background:
                    periodFilter === option.value
                      ? 'rgba(99, 102, 241, 0.16)'
                      : 'rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                  border:
                    periodFilter === option.value
                      ? '1px solid rgba(99, 102, 241, 0.28)'
                      : '1px solid var(--ghost-border)',
                }}
              >
                {option.label}
              </button>
            ))}

            {expenseTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setExpenseFilter(option.value)}
                className="inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition-all"
                style={{
                  background:
                    expenseFilter === option.value
                      ? 'rgba(59, 130, 246, 0.16)'
                      : 'rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                  border:
                    expenseFilter === option.value
                      ? '1px solid rgba(59, 130, 246, 0.28)'
                      : '1px solid var(--ghost-border)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Panel>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <Panel
            title="Регистър на разходите"
            subtitle="Всеки ред е компактна карта с ясен финансов ефект, така че екранът да не избива настрани."
          >
            <div className="space-y-4">
              {expenses.map((entry) => (
                <ExpenseCard key={entry.id} entry={entry} />
              ))}

              {!expenses.length && (
                <div
                  className="rounded-3xl p-8 text-center text-sm"
                  style={{
                    background: 'var(--bg-card-elevated)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  Няма разходи по текущите филтри.
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title="Разбивка"
            subtitle="Категории + ДДС обобщение в фиксирана дясна колона, без раздуване на основния регистър."
          >
            <div className="space-y-4">
              <div
                className="rounded-3xl p-5"
                style={{
                  background: 'linear-gradient(180deg, rgba(18, 27, 50, 0.96), rgba(14, 22, 42, 0.98))',
                  border: '1px solid var(--ghost-border)',
                }}
              >
                <InfoLine label="ДДС основа от приятели" value={formatDashboardMoney(friendVatBase)} />
                <div className="mt-4">
                  <InfoLine label="ДДС сума" value={formatDashboardMoney(friendVatAmount)} />
                </div>
                <p className="mt-4 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  Тези записи не увеличават реалния разход, а само участват в данъчната калкулация.
                </p>
              </div>

              {groupedByCategory.map(([category, amount]) => (
                <div
                  key={category}
                  className="rounded-3xl p-4"
                  style={{
                    background: 'var(--bg-card-elevated)',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {category}
                      </p>
                      <p
                        className="mt-1 text-xs uppercase tracking-[0.16em]"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Категория
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-base font-semibold"
                      style={{ color: 'var(--status-warning)' }}
                    >
                      {formatDashboardMoney(amount)}
                    </p>
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

function ExpenseCard({ entry }: { entry: DashboardReportEntry }) {
  const isFriendVat = entry.type === 'friend-vat-expense';

  return (
    <article
      className="rounded-[28px] p-5"
      style={{
        background: 'linear-gradient(180deg, rgba(18, 27, 50, 0.96), rgba(14, 22, 42, 0.98))',
        border: '1px solid var(--ghost-border)',
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: isFriendVat ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: isFriendVat ? 'var(--primary-accent)' : 'var(--status-warning)',
            }}
          >
            {isFriendVat ? <Banknote size={24} /> : <Receipt size={24} />}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {entry.title}
              </h3>
              <StatusBadge status={entry.status as StatusTone}>
                {statusLabel(entry.status as StatusTone)}
              </StatusBadge>
            </div>

            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              {entry.note}
            </p>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {formatDashboardMoney(entry.amount)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>
            {isFriendVat ? `Само ДДС ${formatDashboardMoney(entry.vatAmount ?? 0)}` : 'Реален разход'}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-3xl p-4 md:grid-cols-2 xl:grid-cols-4" style={{ background: 'rgba(255,255,255,0.025)' }}>
        <InfoChip icon={<CalendarDays size={14} />} label="Дата" value={new Date(entry.date).toLocaleDateString('bg-BG')} />
        <InfoChip icon={<Wallet size={14} />} label="Метод" value={paymentMethodLabel(entry.paymentMethod)} />
        <InfoChip icon={<UserRound size={14} />} label="Доставчик" value={entry.source} />
        <InfoChip icon={<Receipt size={14} />} label="Категория" value={entry.category} />
      </div>
    </article>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p
        className="flex items-center gap-2 text-xs uppercase tracking-[0.16em]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {icon}
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}
