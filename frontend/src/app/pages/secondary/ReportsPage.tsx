import { BarChart3, CalendarDays, CheckCircle2, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui-system/Button';
import { Modal } from '../../components/ui-system/Modal';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import {
  createExpenseRecord,
} from '../../services/expensesApi';
import { useAuthSession } from '../../services/authSession';
import { fetchFinanceLedgerReport } from '../../services/reportsApi';
import { DataTableLayout, MetricCard, MetricGrid, PageSection, Panel, type StatusTone } from './secondaryShared';
import {
  formatDashboardMoney,
  reportEntries,
  type DashboardReportEntry,
} from './reportingData';

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
  const { session } = useAuthSession();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('months');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [entries, setEntries] = useState<DashboardReportEntry[]>(reportEntries);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sourceStatus, setSourceStatus] = useState<'loading' | 'backend' | 'fallback'>('loading');
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftEntry, setDraftEntry] = useState({
    title: 'Нов отчетен запис',
    type: 'expense' as DashboardReportEntry['type'],
    category: 'Оперативни разходи',
    amount: '0',
    date: todayIso,
    source: 'Ръчно въведен запис',
    paymentMethod: 'bank' as DashboardReportEntry['paymentMethod'],
    counterparty: 'Антоан Тест',
    documentReference: '',
    note: '',
    vatAmount: '0',
  });

  useEffect(() => {
    let isMounted = true;

    fetchFinanceLedgerReport()
      .then((report) => {
        if (!isMounted) {
          return;
        }

        setEntries(report.items);
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setEntries(reportEntries);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const periodMatch = matchesPeriod(entry.date, periodFilter, selectedDate, selectedMonth, selectedYear);
        const typeMatch = typeFilter === 'all' || entry.type === typeFilter;
        return periodMatch && typeMatch;
      }),
    [entries, periodFilter, selectedDate, selectedMonth, selectedYear, typeFilter],
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

  const reloadReportEntries = async () => {
    const report = await fetchFinanceLedgerReport();

    setEntries(report.items);
    setSourceStatus('backend');
  };

  const handleCreateEntry = async () => {
    if (isSavingEntry) {
      return;
    }

    const normalizedAmount = Number(draftEntry.amount);
    const normalizedVat = Number(draftEntry.vatAmount);

    setIsSavingEntry(true);
    setSaveError(null);

    try {
      if (draftEntry.type === 'income') {
        throw new Error('Приходите се добавят от страница "Плащания", за да няма дублиран финансов източник.');
      }

      await createExpenseRecord(
        {
          type: draftEntry.type,
          title: draftEntry.title.trim() || 'Нов отчетен запис',
          category: draftEntry.category.trim() || 'Общо',
          amount: Number.isFinite(normalizedAmount) ? normalizedAmount : 0,
          vatAmount:
            draftEntry.type === 'friend-vat-expense' &&
            Number.isFinite(normalizedVat)
              ? normalizedVat
              : 0,
          paymentMethod: draftEntry.paymentMethod,
          source: draftEntry.source.trim() || 'Ръчно въведен запис',
          counterparty: draftEntry.counterparty.trim() || 'Антоан Тест',
          note: draftEntry.note.trim(),
          status: 'success',
          affectsOperationalExpense: draftEntry.type !== 'friend-vat-expense',
          date: draftEntry.date,
        },
        session?.csrfToken ?? '',
      );

      await reloadReportEntries();
      setIsCreateModalOpen(false);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Записът не беше запазен в базата.',
      );
    } finally {
      setIsSavingEntry(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Отчети"
        description={`Финансов преглед от ${sourceStatus === 'backend' ? 'PostgreSQL' : sourceStatus === 'loading' ? 'зареждане...' : 'fallback данни'} с отделна видимост за ДДС от приятелски документи.`}
        breadcrumbs={[{ label: 'Начало' }, { label: 'Отчети' }]}
        actions={
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
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

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Добави отчетен запис"
        size="medium"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={draftEntry.title}
            onChange={(event) =>
              setDraftEntry((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            className="w-full h-12 rounded-2xl px-4 text-sm outline-none"
            style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={draftEntry.type}
              onChange={(event) =>
                setDraftEntry((current) => ({
                  ...current,
                  type: event.target.value as DashboardReportEntry['type'],
                }))
              }
              className="h-12 rounded-2xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
            >
              {typeOptions
                .filter((option) => option.value !== 'all' && option.value !== 'income')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>

            <input
              type="date"
              value={draftEntry.date}
              onChange={(event) =>
                setDraftEntry((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
              className="h-12 rounded-2xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={draftEntry.category}
              onChange={(event) =>
                setDraftEntry((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              className="h-12 rounded-2xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
              placeholder="Категория"
            />
            <input
              type="number"
              value={draftEntry.amount}
              onChange={(event) =>
                setDraftEntry((current) => ({
                  ...current,
                  amount: event.target.value,
                }))
              }
              className="h-12 rounded-2xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
              placeholder="Сума"
            />
          </div>

          {draftEntry.type === 'friend-vat-expense' && (
            <input
              type="number"
              value={draftEntry.vatAmount}
              onChange={(event) =>
                setDraftEntry((current) => ({
                  ...current,
                  vatAmount: event.target.value,
                }))
              }
              className="w-full h-12 rounded-2xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
              placeholder="ДДС сума"
            />
          )}

          <textarea
            value={draftEntry.note}
            onChange={(event) =>
              setDraftEntry((current) => ({
                ...current,
                note: event.target.value,
              }))
            }
            className="w-full min-h-[120px] rounded-2xl px-4 py-3 text-sm outline-none"
            style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}
            placeholder="Бележка"
          />

          {saveError ? (
            <p className="text-sm" style={{ color: 'var(--status-error)' }}>
              {saveError}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Отказ
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleCreateEntry()}
              disabled={isSavingEntry}
            >
              {isSavingEntry ? 'Записвам...' : 'Запази запис'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
