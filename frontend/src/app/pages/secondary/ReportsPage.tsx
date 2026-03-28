import { useMemo, useState, type ReactNode } from 'react';
import { CalendarDays, CheckCircle2, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DataTableLayout, MetricCard, MetricGrid, PageSection, Panel, statusLabel, type StatusTone } from './secondaryShared';
import { formatDashboardMoney, reportEntries } from './reportingData';

type TransactionType = 'income' | 'expense';
type PeriodFilter = 'days' | 'months' | 'years';
type TypeFilter = 'all' | TransactionType;
type PaymentMethod = 'cash' | 'bank' | 'card' | 'pos';
type EntryStatus = Extract<StatusTone, 'success' | 'warning' | 'error'>;
type ReportEntry = { id: string; title: string; type: TransactionType; category: string; amount: number; date: string; source: string; paymentMethod: PaymentMethod; status: EntryStatus };
type RecordFormState = { type: TransactionType; title: string; category: string; amount: string; date: string; source: string; paymentMethod: PaymentMethod; status: EntryStatus };
type ButtonProps = { label: string; onClick: () => void; icon?: ReactNode; active?: boolean; primary?: boolean; disabled?: boolean };
const PAGE_SIZE = 20;
const todayIso = new Date().toISOString().slice(0, 10);
const currentMonth = todayIso.slice(0, 7);
const currentYear = todayIso.slice(0, 4);
const fieldStyle = { background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' } as const;
const typeLabels: Record<TypeFilter, string> = { all: 'Всички', income: 'Приходи', expense: 'Разходи' };
const paymentLabels: Record<PaymentMethod, string> = { cash: 'В брой', bank: 'Банков превод', card: 'Карта', pos: 'POS терминал' };
const periodOptions: { value: PeriodFilter; label: string }[] = [{ value: 'days', label: 'Конкретен ден' }, { value: 'months', label: 'Цял месец' }, { value: 'years', label: 'Цяла година' }];
const statusOptions: { value: EntryStatus; label: string }[] = [{ value: 'success', label: 'Потвърден' }, { value: 'warning', label: 'Очаква' }, { value: 'error', label: 'Просрочен' }];
const defaultFormState: RecordFormState = { type: 'income', title: '', category: '', amount: '', date: todayIso, source: '', paymentMethod: 'cash', status: 'success' };
const baseEntries: ReportEntry[] = Array.from({ length: 42 }, (_, index) => ({
  id: 'entry-' + (index + 1),
  title: index % 3 === 0 ? 'Фактура за гориво' : 'Курс категория B',
  type: index % 3 === 0 ? 'expense' : 'income',
  category: index % 3 === 0 ? 'Поддръжка' : 'Такси',
  amount: index % 3 === 0 ? 180 + index * 14 : 1280 + index * 18,
  date: (index < 28 ? '2026-03' : index < 36 ? '2026-02' : '2026-01') + '-' + String(((index * 2) % 27) + 1).padStart(2, '0'),
  source: index % 3 === 0 ? 'Auto Profi' : index % 2 === 0 ? 'Мария Иванова' : 'Николай Петров',
  paymentMethod: index % 3 === 0 ? 'bank' : index % 2 === 0 ? 'cash' : 'card',
  status: index % 5 === 0 ? 'warning' : 'success',
}));
function formatMoney(amount: number) { return amount.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' лв'; }
function matchesPeriod(date: string, filter: PeriodFilter, selectedDate: string, selectedMonth: string, selectedYear: string) { if (filter === 'days') return date === selectedDate; if (filter === 'months') return date.startsWith(selectedMonth); return date.startsWith(selectedYear); }
function periodLabel(filter: PeriodFilter, selectedDate: string, selectedMonth: string, selectedYear: string) { if (filter === 'days') return new Date(selectedDate).toLocaleDateString('bg-BG'); if (filter === 'months') { const parts = selectedMonth.split('-'); return parts[1] + '.' + parts[0]; } return selectedYear; }
function ActionButton({ label, onClick, icon, active = false, primary = false, disabled = false }: ButtonProps) { return <button type='button' onClick={onClick} disabled={disabled} className='inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40' style={{ background: primary ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(96, 99, 238, 0.9))' : active ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: active || primary ? '1px solid rgba(99, 102, 241, 0.28)' : '1px solid var(--ghost-border)', boxShadow: primary ? '0 12px 24px rgba(99, 102, 241, 0.22)' : 'none' }}>{icon}{label}</button>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <div className='space-y-2'><label className='text-xs uppercase tracking-[0.18em]' style={{ color: 'var(--text-tertiary)' }}>{label}</label>{children}</div>; }
export function ReportsPage() {
  const [entries, setEntries] = useState<ReportEntry[]>(baseEntries);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('months');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<RecordFormState>(defaultFormState);
  const scopedEntries = useMemo(() => entries.filter((entry) => matchesPeriod(entry.date, periodFilter, selectedDate, selectedMonth, selectedYear)), [entries, periodFilter, selectedDate, selectedMonth, selectedYear]);
  const filteredEntries = useMemo(() => scopedEntries.filter((entry) => typeFilter === 'all' ? true : entry.type === typeFilter), [scopedEntries, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const currentPageValue = Math.min(page, totalPages);
  const pagedEntries = useMemo(() => filteredEntries.slice((currentPageValue - 1) * PAGE_SIZE, currentPageValue * PAGE_SIZE), [currentPageValue, filteredEntries]);
  const income = scopedEntries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = scopedEntries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  const result = income - expenses;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const resultLabel = result >= 0 ? 'Печалба' : 'Загуба';
  const resultColor = result >= 0 ? 'var(--status-success)' : 'var(--status-error)';
  const openDialog = () => { setFormState(defaultFormState); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setFormState(defaultFormState); };
  const goToToday = () => { setPeriodFilter('days'); setSelectedDate(todayIso); setSelectedMonth(currentMonth); setSelectedYear(currentYear); setPage(1); };
  const updateForm = <K extends keyof RecordFormState>(key: K, value: RecordFormState[K]) => setFormState((current) => ({ ...current, [key]: value }));
  const addRecord = () => {
    const amount = Number(formState.amount.replace(',', '.'));
    if (!formState.title.trim() || !formState.category.trim() || !formState.source.trim() || !formState.date || Number.isNaN(amount) || amount <= 0) return;
    setEntries((current) => [{ id: 'entry-' + Date.now(), title: formState.title.trim(), type: formState.type, category: formState.category.trim(), amount, date: formState.date, source: formState.source.trim(), paymentMethod: formState.paymentMethod, status: formState.status }, ...current]);
    setPage(1);
    closeDialog();
  };
  return <div>
    <PageHeader title='Отчети' description='Финансов преглед с по-лесни действия, бърз бутон за днешна дата и диалог за добавяне на нов запис.' breadcrumbs={[{ label: 'Начало' }, { label: 'Отчети' }]} />
    <PageSection>
      <div className='rounded-3xl px-6 py-5' style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(25, 37, 64, 0.92))', border: '1px solid var(--ghost-border)' }}><p className='text-xs uppercase tracking-[0.18em]' style={{ color: 'var(--text-tertiary)' }}>Финансов резултат</p><p className='mt-3 text-3xl font-semibold' style={{ color: resultColor }}>{resultLabel} {formatMoney(Math.abs(result))}</p><p className='mt-2 text-sm' style={{ color: 'var(--text-secondary)' }}>За {periodLabel(periodFilter, selectedDate, selectedMonth, selectedYear)}</p></div>
      <MetricGrid>
        <MetricCard icon={<TrendingUp size={18} />} label='Приходи' value={formatMoney(income)} detail='Постъпления за избрания период' tone='success' />
        <MetricCard icon={<TrendingDown size={18} />} label='Разходи' value={formatMoney(expenses)} detail='Разходи за избрания период' tone='warning' />
        <MetricCard icon={<CheckCircle2 size={18} />} label='Записи' value={String(filteredEntries.length)} detail={'Страница ' + currentPageValue + ' от ' + totalPages} tone='info' />
      </MetricGrid>
      <Panel title='Управление на периода' subtitle='Изберете какво да видите, върнете се към днес или добавете нов запис с един ясен бутон.'>
        <div className='space-y-5'>
          <div className='flex flex-wrap items-center gap-3'><ActionButton label='Днес' icon={<CalendarDays size={16} />} onClick={goToToday} /><ActionButton label='Добави запис' icon={<Plus size={16} />} primary onClick={openDialog} /></div>
          <div className='grid gap-4 lg:grid-cols-[minmax(220px,260px)_minmax(240px,1fr)]'>
            <Field label='Какво искате да видите'><select value={periodFilter} onChange={(event) => { setPeriodFilter(event.target.value as PeriodFilter); setPage(1); }} className='h-12 w-full px-4 text-sm outline-none transition-all'>{periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
            <Field label='Избран период'>{periodFilter === 'days' ? <input type='date' value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setPage(1); }} className='h-12 w-full px-4 text-sm outline-none transition-all' style={fieldStyle} /> : periodFilter === 'months' ? <input type='month' value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); setPage(1); }} className='h-12 w-full px-4 text-sm outline-none transition-all' style={fieldStyle} /> : <input type='number' min='2020' max='2035' value={selectedYear} onChange={(event) => { setSelectedYear(event.target.value); setPage(1); }} className='h-12 w-full px-4 text-sm outline-none transition-all' style={fieldStyle} />}</Field>
          </div>
          <div className='space-y-2'><label className='text-xs uppercase tracking-[0.18em]' style={{ color: 'var(--text-tertiary)' }}>Какво да се покаже в таблицата</label><div className='flex flex-wrap gap-3'>{(Object.keys(typeLabels) as TypeFilter[]).map((filter) => <ActionButton key={filter} label={typeLabels[filter]} active={typeFilter === filter} onClick={() => { setTypeFilter(filter); setPage(1); }} />)}</div></div>
        </div>
      </Panel>
      <Panel title='Финансови записи' subtitle='20 записа на страница, ясен филтър по вид и лесно добавяне на нови приходи и разходи.'>
        <DataTableLayout columns={['Запис', 'Тип', 'Категория', 'Сума', 'Дата', 'Начин на плащане', 'Източник', 'Статус']} rows={pagedEntries.map((entry) => [entry.title, entry.type === 'income' ? 'Приход' : 'Разход', entry.category, formatMoney(entry.amount), new Date(entry.date).toLocaleDateString('bg-BG'), paymentLabels[entry.paymentMethod], entry.source, <StatusBadge key={entry.id} status={entry.status}>{statusLabel(entry.status)}</StatusBadge>])} />
        <div className='mt-5 flex flex-wrap items-center justify-between gap-3'><p className='text-sm' style={{ color: 'var(--text-secondary)' }}>Показани {pagedEntries.length} от {filteredEntries.length} записа</p><div className='flex flex-wrap items-center gap-2'><ActionButton label='‹' disabled={currentPageValue === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} />{pages.map((value) => <ActionButton key={value} label={String(value)} active={value === currentPageValue} onClick={() => setPage(value)} />)}<ActionButton label='›' disabled={currentPageValue === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} /></div></div>
      </Panel>
    </PageSection>
    <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setFormState(defaultFormState); }}>

      <DialogContent className='max-w-2xl border-none p-0' style={{ background: 'linear-gradient(180deg, rgba(25, 37, 64, 0.98), rgba(15, 23, 42, 0.98))', boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)' }}>
        <div className='p-6'><DialogHeader><DialogTitle style={{ color: 'var(--text-primary)' }}>Добави запис</DialogTitle><DialogDescription style={{ color: 'var(--text-secondary)' }}>Добавете нов приход или разход, който веднага ще се покаже в таблицата.</DialogDescription></DialogHeader>
        <div className='mt-6 grid gap-4 md:grid-cols-2'>
          <Field label='Тип запис'><select value={formState.type} onChange={(event) => updateForm('type', event.target.value as TransactionType)} className='h-12 w-full px-4 text-sm outline-none transition-all'><option value='income'>Приход</option><option value='expense'>Разход</option></select></Field>
          <Field label='Стойност'><input type='number' min='0' step='0.01' value={formState.amount} onChange={(event) => updateForm('amount', event.target.value)} className='h-12 w-full px-4 text-sm outline-none transition-all' style={fieldStyle} placeholder='Например 1250.00' /></Field>
          <Field label='Запис'><input type='text' value={formState.title} onChange={(event) => updateForm('title', event.target.value)} className='h-12 w-full px-4 text-sm outline-none transition-all' style={fieldStyle} placeholder='Например Курс категория B' /></Field>
          <Field label='Категория'><input type='text' value={formState.category} onChange={(event) => updateForm('category', event.target.value)} className='h-12 w-full px-4 text-sm outline-none transition-all' style={fieldStyle} placeholder='Например Такси или Поддръжка' /></Field>
          <Field label='Дата'><input type='date' value={formState.date} onChange={(event) => updateForm('date', event.target.value)} className='h-12 w-full px-4 text-sm outline-none transition-all' style={fieldStyle} /></Field>
          <Field label='Начин на плащане'><select value={formState.paymentMethod} onChange={(event) => updateForm('paymentMethod', event.target.value as PaymentMethod)} className='h-12 w-full px-4 text-sm outline-none transition-all'>{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label='Източник / платец'><input type='text' value={formState.source} onChange={(event) => updateForm('source', event.target.value)} className='h-12 w-full px-4 text-sm outline-none transition-all' style={fieldStyle} placeholder='Например Мария Иванова или Fuel Express' /></Field>
          <Field label='Статус'><select value={formState.status} onChange={(event) => updateForm('status', event.target.value as EntryStatus)} className='h-12 w-full px-4 text-sm outline-none transition-all'>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
        </div>
        <DialogFooter className='mt-6 flex gap-3 sm:justify-end'><ActionButton label='Отказ' onClick={closeDialog} /><ActionButton label='Добави' icon={<Wallet size={16} />} primary onClick={addRecord} /></DialogFooter></div>
      </DialogContent>
    </Dialog>
  </div>;
}
