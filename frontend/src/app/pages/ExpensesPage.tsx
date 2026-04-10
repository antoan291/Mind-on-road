import {
  Banknote,
  CalendarDays,
  Download,
  Receipt,
  TrendingDown,
  UserRound,
  Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DatePickerInput } from '../components/date/DatePickerInput';
import { Button } from '../components/ui-system/Button';
import { FilterBar } from '../components/ui-system/FilterBar';
import { Modal } from '../components/ui-system/Modal';
import { PageHeader } from '../components/ui-system/PageHeader';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import {
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
import { useAuthSession } from '../services/authSession';
import { hasFullAccessRole } from '../services/roleUtils';
import {
  createExpenseRecord,
  deleteExpenseRecord,
  fetchExpenseRecords,
  type ExpenseCreatePayload,
  type ExpenseRecordView,
} from '../services/expensesApi';

type PeriodFilter = 'all' | 'today' | 'day' | 'month' | 'year';
type ExpenseFilter = 'all' | 'real' | 'friend-vat';

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'all', label: 'Всички' },
  { value: 'today', label: 'Днес' },
  { value: 'day', label: 'Ден' },
  { value: 'month', label: 'Месец' },
  { value: 'year', label: 'Година' },
];

const expenseTypeOptions: { value: ExpenseFilter; label: string }[] = [
  { value: 'all', label: 'Всички записи' },
  { value: 'real', label: 'Само реални разходи' },
  { value: 'friend-vat', label: 'Само ДДС от приятели' },
];

function matchesPeriod(
  date: string,
  period: PeriodFilter,
  selectedDate: string,
  selectedMonth: string,
  selectedYear: string,
) {
  const todayIso = new Date().toISOString().slice(0, 10);

  if (period === 'all') {
    return true;
  }

  if (period === 'today') {
    return date === todayIso;
  }

  if (period === 'day') {
    return date === selectedDate;
  }

  if (period === 'month') {
    return date.startsWith(selectedMonth);
  }

  return date.startsWith(selectedYear);
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

function buildYearOptions(entries: DashboardReportEntry[]) {
  const years = Array.from(
    new Set(entries.map((entry) => entry.date.slice(0, 4))),
  ).sort((left, right) => Number(right) - Number(left));

  return years.length > 0
    ? years
    : [new Date().toISOString().slice(0, 4)];
}

function calculateBulgarianVatFromGrossAmount(amountValue: string) {
  const amount = Number.parseFloat(amountValue);

  if (Number.isNaN(amount) || amount <= 0) {
    return 0;
  }

  return Math.round((amount * 20) / 120);
}

export function ExpensesPage() {
  const { session } = useAuthSession();
  const todayIso = new Date().toISOString().slice(0, 10);
  const currentMonthIso = todayIso.slice(0, 7);
  const currentYearIso = todayIso.slice(0, 4);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIso);
  const [selectedYear, setSelectedYear] = useState(currentYearIso);
  const [expenseFilter, setExpenseFilter] = useState<ExpenseFilter>('all');
  const [searchValue, setSearchValue] = useState('');
  const [entries, setEntries] = useState<DashboardReportEntry[]>(
    reportEntries,
  );
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [draftExpense, setDraftExpense] = useState({
    title: 'Нов разход',
    category: 'Поддръжка',
    source: 'Mind On Road',
    counterparty: 'Доставчик',
    paymentMethod: 'bank',
    amount: '120',
    vatAmount: '24',
    type: 'expense' as DashboardReportEntry['type'],
    note: 'Тестово въведен разход.',
  });
  const [sourceStatus, setSourceStatus] = useState<
    'loading' | 'backend' | 'fallback'
  >('loading');
  const canDeleteExpenses = Boolean(
    hasFullAccessRole(session?.user.roleKeys ?? []) ||
      session?.user.roleKeys.includes('administration'),
  );

  useEffect(() => {
    let isMounted = true;

    fetchExpenseRecords()
      .then((records) => {
        if (!isMounted) {
          return;
        }

        setEntries(records.map((record) => mapExpenseRecord(record)));
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

  const expenses = useMemo(
    () =>
      entries.filter(
        (entry) =>
          (entry.type === 'expense' || entry.type === 'friend-vat-expense') &&
          matchesPeriod(
            entry.date,
            periodFilter,
            selectedDate,
            selectedMonth,
            selectedYear,
          ) &&
          isVisibleByType(entry, expenseFilter) &&
          [entry.title, entry.category, entry.source, entry.counterparty, entry.note]
            .join(' ')
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()),
      ),
    [
      entries,
      expenseFilter,
      periodFilter,
      searchValue,
      selectedDate,
      selectedMonth,
      selectedYear,
    ],
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
  const savedVatTotal = expenses.reduce((sum, entry) => sum + (entry.vatAmount ?? 0), 0);

  const handleCreateExpense = async () => {
    const payload: ExpenseCreatePayload = {
      title: draftExpense.title,
      type: draftExpense.type,
      category: draftExpense.category,
      amount: Number(draftExpense.amount) || 0,
      vatAmount:
        draftExpense.type === 'friend-vat-expense'
          ? calculateBulgarianVatFromGrossAmount(draftExpense.amount)
          : 0,
      paymentMethod: draftExpense.paymentMethod,
      source: draftExpense.source,
      counterparty: draftExpense.counterparty,
      note: draftExpense.note,
      status: 'warning',
      affectsOperationalExpense: draftExpense.type !== 'friend-vat-expense',
      date: new Date().toISOString().slice(0, 10),
    };

    const nextEntry: DashboardReportEntry = {
      id: `EXP-${Date.now()}`,
      date: payload.date,
      title: payload.title,
      type: payload.type,
      category: payload.category,
      amount: payload.amount,
      vatAmount: payload.vatAmount,
      paymentMethod: payload.paymentMethod as DashboardReportEntry['paymentMethod'],
      source: payload.source,
      counterparty: payload.counterparty,
      note: payload.note,
      status: payload.status,
      documentReference: `EXP-${Date.now()}`,
      currency: 'EUR',
      affectsOperationalExpense: payload.affectsOperationalExpense,
    };

    if (session?.csrfToken) {
      try {
        const created = await createExpenseRecord(payload, session.csrfToken);

        setEntries((current) => [mapExpenseRecord(created), ...current]);
        setSourceStatus('backend');
        setIsCreateExpenseOpen(false);
        return;
      } catch {
        setSourceStatus('fallback');
      }
    };

    setEntries((current) => [nextEntry, ...current]);
    setIsCreateExpenseOpen(false);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!canDeleteExpenses) {
      return;
    }

    const expense = entries.find((entry) => entry.id === expenseId);

    if (!expense) {
      return;
    }

    const shouldDelete = globalThis.confirm(
      `Сигурен ли си, че искаш да изтриеш разхода ${expense.title}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteExpenseRecord(expenseId, session?.csrfToken ?? '');
      setEntries((currentEntries) =>
        currentEntries.filter((entry) => entry.id !== expenseId),
      );
      setSourceStatus('backend');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Разходът не можа да бъде изтрит.';
      globalThis.alert(message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Разходи"
        description={`Удобен работен екран без хоризонтално избиване: разходите са cards, а ДДС редовете от приятели са ясно отделени. ${
          sourceStatus === 'backend'
            ? 'Данни от PostgreSQL + Redis.'
            : sourceStatus === 'fallback'
              ? 'Fallback към локални записи.'
              : 'Зареждане...'
        }`}
        breadcrumbs={[{ label: 'Начало' }, { label: 'Разходи' }]}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download size={18} />}
              onClick={() => exportExpensesCsv(expenses)}
            >
              Експорт
            </Button>
            <Button
              variant="primary"
              icon={<Receipt size={18} />}
              onClick={() => setIsCreateExpenseOpen(true)}
            >
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
          <MetricCard
            icon={<Banknote size={18} />}
            label="Спестено ДДС"
            value={formatDashboardMoney(savedVatTotal)}
            detail="Общо по текущите филтри"
            tone={savedVatTotal > 0 ? 'success' : 'neutral'}
          />
        </MetricGrid>

        <Panel
          title="Филтри"
          subtitle="Избери точен период по ден, месец или година и отдели реалните разходи от ДДС редовете."
        >
          <div className="space-y-5">
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
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Ден
                </span>
                <DatePickerInput
                  value={selectedDate}
                  onChange={(value) => {
                    setSelectedDate(value);
                    setPeriodFilter('day');
                  }}
                  className="h-11 w-full rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
                  style={{
                    background: 'rgba(15, 23, 42, 0.22)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(148, 163, 184, 0.32)',
                  }}
                />
              </label>

              <label className="block">
                <span
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Месец
                </span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => {
                    setSelectedMonth(event.target.value);
                    setPeriodFilter('month');
                  }}
                  className="h-11 w-full rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
                  style={{
                    background: 'rgba(15, 23, 42, 0.22)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(148, 163, 184, 0.32)',
                  }}
                />
              </label>

              <label className="block">
                <span
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Година
                </span>
                <select
                  value={selectedYear}
                  onChange={(event) => {
                    setSelectedYear(event.target.value);
                    setPeriodFilter('year');
                  }}
                  className="h-11 w-full rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.22)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(148, 163, 184, 0.32)',
                  }}
                >
                  {buildYearOptions(entries).map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
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
          </div>
        </Panel>

        <Panel
          title="Регистър на разходите"
          subtitle="Всеки ред е компактна карта с ясен финансов ефект, така че екранът да не избива настрани."
        >
          <div className="space-y-4">
            {expenses.map((entry) => (
              <ExpenseCard
                key={entry.id}
                entry={entry}
                canDelete={canDeleteExpenses}
                onDelete={() => void handleDeleteExpense(entry.id)}
              />
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
      </PageSection>

      <Modal
        isOpen={isCreateExpenseOpen}
        onClose={() => setIsCreateExpenseOpen(false)}
        title="Нов разход"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCreateExpenseOpen(false)}
            >
              Отказ
            </Button>
            <Button variant="primary" onClick={handleCreateExpense}>
              Запази разхода
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ExpenseDraftField label="Име на разхода">
            <input
              value={draftExpense.title}
              onChange={(event) =>
                setDraftExpense((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Например: Гориво, ремонт, офис консумативи"
              className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
              style={{
                background: 'rgba(15, 23, 42, 0.22)',
                borderColor: 'rgba(148, 163, 184, 0.32)',
                color: 'var(--text-primary)',
              }}
            />
          </ExpenseDraftField>

          <ExpenseDraftField label="Категория">
            <input
              value={draftExpense.category}
              onChange={(event) =>
                setDraftExpense((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              placeholder="Например: Поддръжка, гориво, офис"
              className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
              style={{
                background: 'rgba(15, 23, 42, 0.22)',
                borderColor: 'rgba(148, 163, 184, 0.32)',
                color: 'var(--text-primary)',
              }}
            />
          </ExpenseDraftField>

          <ExpenseDraftField label="Тип разход">
            <select
              value={draftExpense.type}
              onChange={(event) =>
                setDraftExpense((current) => ({
                  ...current,
                  type: event.target.value as DashboardReportEntry['type'],
                  vatAmount:
                    event.target.value === 'friend-vat-expense'
                      ? String(
                          calculateBulgarianVatFromGrossAmount(current.amount),
                        )
                      : '0',
                }))
              }
              className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.22)',
                borderColor: 'rgba(148, 163, 184, 0.32)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="expense">Реален разход</option>
              <option value="friend-vat-expense">ДДС от приятели</option>
            </select>
          </ExpenseDraftField>

          <ExpenseDraftField label="Метод на плащане">
            <select
              value={draftExpense.paymentMethod}
              onChange={(event) =>
                setDraftExpense((current) => ({
                  ...current,
                  paymentMethod: event.target.value,
                }))
              }
              className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.22)',
                borderColor: 'rgba(148, 163, 184, 0.32)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="bank">Банков превод</option>
              <option value="card">Карта</option>
              <option value="cash">В брой</option>
            </select>
          </ExpenseDraftField>

          <ExpenseDraftField label="Източник">
            <input
              value={draftExpense.source}
              onChange={(event) =>
                setDraftExpense((current) => ({
                  ...current,
                  source: event.target.value,
                }))
              }
              placeholder="Например: Mind On Road"
              className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
              style={{
                background: 'rgba(15, 23, 42, 0.22)',
                borderColor: 'rgba(148, 163, 184, 0.32)',
                color: 'var(--text-primary)',
              }}
            />
          </ExpenseDraftField>

          <ExpenseDraftField label="Доставчик / контрагент">
            <input
              value={draftExpense.counterparty}
              onChange={(event) =>
                setDraftExpense((current) => ({
                  ...current,
                  counterparty: event.target.value,
                }))
              }
              placeholder="Например: Shell, OMV, сервиз"
              className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
              style={{
                background: 'rgba(15, 23, 42, 0.22)',
                borderColor: 'rgba(148, 163, 184, 0.32)',
                color: 'var(--text-primary)',
              }}
            />
          </ExpenseDraftField>

          <ExpenseDraftField label="Сума">
            <input
              type="number"
              value={draftExpense.amount}
              onChange={(event) =>
                setDraftExpense((current) => ({
                  ...current,
                  amount: event.target.value,
                  vatAmount:
                    current.type === 'friend-vat-expense'
                      ? String(
                          calculateBulgarianVatFromGrossAmount(
                            event.target.value,
                          ),
                        )
                      : current.vatAmount,
                }))
              }
              placeholder="Например: 120"
              className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
              style={{
                background: 'rgba(15, 23, 42, 0.22)',
                borderColor: 'rgba(148, 163, 184, 0.32)',
                color: 'var(--text-primary)',
              }}
            />
          </ExpenseDraftField>

          <ExpenseDraftField label="Бележка" className="md:col-span-2">
            <textarea
              value={draftExpense.note}
              onChange={(event) =>
                setDraftExpense((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
              rows={4}
              placeholder="Кратко описание или вътрешна бележка"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
              style={{
                background: 'rgba(15, 23, 42, 0.22)',
                borderColor: 'rgba(148, 163, 184, 0.32)',
                color: 'var(--text-primary)',
              }}
            />
          </ExpenseDraftField>
        </div>
      </Modal>
    </div>
  );
}

function ExpenseCard({
  entry,
  canDelete,
  onDelete,
}: {
  entry: DashboardReportEntry;
  canDelete: boolean;
  onDelete: () => void;
}) {
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

      {canDelete && (
        <div className="mt-4 flex justify-end">
          <Button variant="destructive" onClick={onDelete}>
            Изтрий
          </Button>
        </div>
      )}
    </article>
  );
}

function exportExpensesCsv(expenses: DashboardReportEntry[]) {
  const rows = [
    'Дата;Име на разхода;Тип разход;Категория;Сума;ДДС сума;Метод на плащане;Източник;Доставчик / контрагент;Бележка',
    ...expenses.map((entry) =>
      [
        entry.date,
        entry.title,
        entry.type === 'friend-vat-expense'
          ? 'ДДС от приятели'
          : 'Реален разход',
        entry.category,
        entry.amount,
        entry.vatAmount ?? 0,
        paymentMethodLabel(entry.paymentMethod),
        entry.source,
        entry.counterparty,
        entry.note,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(';'),
    ),
  ];
  const blob = new Blob([`\uFEFF${rows.join('\n')}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'razhodi_export.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function mapExpenseRecord(record: ExpenseRecordView): DashboardReportEntry {
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    category: record.category,
    amount: record.amount,
    date: record.date,
    source: record.source,
    paymentMethod:
      record.paymentMethod === 'bank' ||
      record.paymentMethod === 'card' ||
      record.paymentMethod === 'pos' ||
      record.paymentMethod === 'cash'
        ? record.paymentMethod
        : 'bank',
    status: record.status,
    documentReference: `EXP-${record.id.slice(0, 8)}`,
    counterparty: record.counterparty,
    note: record.note,
    currency: 'EUR',
    vatAmount: record.vatAmount,
    affectsOperationalExpense: record.affectsOperationalExpense,
  };
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

function ExpenseDraftField({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span
        className="mb-2 block text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
