import { BarChart3, CalendarDays, CheckCircle2, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../components/ui-system/Button';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { DataTableLayout, MetricCard, MetricGrid, PageSection, Panel, type StatusTone } from './secondaryShared';
import { formatDashboardMoney, reportEntries, type DashboardReportEntry } from './reportingData';

type PeriodFilter = 'days' | 'months' | 'years';
type TypeFilter = 'all' | DashboardReportEntry['type'];

const todayIso = new Date().toISOString().slice(0, 10);
const currentMonth = todayIso.slice(0, 7);
const currentYear = todayIso.slice(0, 4);

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Всички' },
  { value: 'income', label: 'Приходи' },
  { value: 'expense', label: 'Разходи' },
  { value: 'friend-vat-expense', label: 'ДДС от приятели' },
];

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'days', label: 'Конкретен ден' },
  { value: 'months', label: 'Цял месец' },
  { value: 'years', label: 'Цяла година' },
];

const paymentLabels: Record<DashboardReportEntry['paymentMethod'], string> = {
  cash: 'В брой',
  bank: 'Банков превод',
  card: 'Карта',
  pos: 'POS терминал',
};

function matchesPeriod(date: string, filter: PeriodFilter, selectedDate: string, selectedMonth: string, selectedYear: string) {
  if (filter === 'days') return date === selectedDate;
  if (filter === 'months') return date.startsWith(selectedMonth);
  return date.startsWith(selectedYear);
}

function getPeriodLabel(filter: PeriodFilter, selectedDate: string, selectedMonth: string, selectedYear: string) {
  if (filter === 'days') return new Date(selectedDate).toLocaleDateString('bg-BG');
  if (filter === 'months') {
    const [year, month] = selectedMonth.split('-');
    return `${month}.${year}`;
  }
  return selectedYear;
}

export function ReportsPage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('months');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const filteredEntries = useMemo(
    () =>
      reportEntries.filter((entry) => {
        const periodMatch = matchesPeriod(entry.date, periodFilter, selectedDate, selectedMonth, selectedYear);
        const typeMatch = typeFilter === 'all' || entry.type === typeFilter;
        return periodMatch && typeMatch;
      }),
    [periodFilter, selectedDate, selectedMonth, selectedYear, typeFilter],
  );

  const income = filteredEntries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const realExpenses = filteredEntries
    .filter((entry) => entry.type === 'expense' && entry.affectsOperationalExpense !== false)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const friendVat = filteredEntries
    .filter((entry) => entry.type === 'friend-vat-expense')
    .reduce((sum, entry) => sum + (entry.vatAmount ?? 0), 0);
  const result = income - realExpenses;

  return (
    <div>
      <PageHeader
        title="Отчети"
        description="Финансов преглед с период, тип запис и отделна видимост за ДДС от приятелски документи."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Отчети' }]}
        actions={
          <Button variant="primary" icon={<Plus size={18} />}>
            Добави запис
          </Button>
        }
      />

      <PageSection>
        <MetricGrid>
          <MetricCard icon={<TrendingUp size={18} />} label="Приходи" value={formatDashboardMoney(income)} detail="Постъпления за избрания период" tone="success" />
          <MetricCard icon={<TrendingDown size={18} />} label="Реални разходи" value={formatDashboardMoney(realExpenses)} detail="Без приятелски ДДС редове" tone="warning" />
          <MetricCard icon={<BarChart3 size={18} />} label={result >= 0 ? 'Печалба' : 'Загуба'} value={formatDashboardMoney(Math.abs(result))} detail={`За ${getPeriodLabel(periodFilter, selectedDate, selectedMonth, selectedYear)}`} tone={result >= 0 ? 'success' : 'error'} />
          <MetricCard icon={<CheckCircle2 size={18} />} label="ДДС от приятели" value={formatDashboardMoney(friendVat)} detail="Само данъчна калкулация" tone="info" />
        </MetricGrid>

        <Panel title="Филтри" subtitle="Изберете период и тип записи. Резултатите отдолу се обновяват веднага.">
          <div className="grid gap-4 lg:grid-cols-3">
            <select
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}
              className="h-12 rounded-2xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {periodFilter === 'days' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="h-12 rounded-2xl px-4 text-sm outline-none"
                style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
              />
            )}

            {periodFilter === 'months' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="h-12 rounded-2xl px-4 text-sm outline-none"
                style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
              />
            )}

            {periodFilter === 'years' && (
              <input
                type="number"
                min="2020"
                max="2035"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="h-12 rounded-2xl px-4 text-sm outline-none"
                style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
              />
            )}

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
              className="h-12 rounded-2xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Panel>

        <Panel title="Финансови записи" subtitle="Таблицата показва приходи, реални разходи и ДДС редове от приятели с ясно маркиран финансов ефект.">
          <DataTableLayout
            columns={['Запис', 'Тип', 'Категория', 'Сума', 'Дата', 'Източник', 'Метод', 'Статус']}
            rows={filteredEntries.map((entry) => [
              entry.title,
              entry.type === 'income'
                ? 'Приход'
                : entry.type === 'friend-vat-expense'
                  ? 'ДДС от приятели'
                  : 'Разход',
              entry.category,
              formatDashboardMoney(entry.amount),
              new Date(entry.date).toLocaleDateString('bg-BG'),
              entry.source,
              paymentLabels[entry.paymentMethod],
              <StatusBadge key={entry.id} status={entry.status as StatusTone}>
                {entry.type === 'friend-vat-expense' ? 'Само ДДС' : entry.status === 'success' ? 'Изрядно' : entry.status === 'warning' ? 'Внимание' : 'Критично'}
              </StatusBadge>,
            ])}
          />
        </Panel>
      </PageSection>
    </div>
  );
}
