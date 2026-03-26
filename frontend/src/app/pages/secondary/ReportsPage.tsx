import { useMemo, useState } from 'react';
import { CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { DataTableLayout, MetricCard, MetricGrid, PageSection, Panel, statusLabel, type StatusTone } from './secondaryShared';

type TransactionType = 'income' | 'expense';
type PeriodFilter = 'days' | 'months' | 'years';
type TypeFilter = 'all' | TransactionType;
type ReportEntry = { id: string; title: string; type: TransactionType; category: string; amount: number; date: string; source: string; status: StatusTone };
type ChipProps = { label: string; active: boolean; onClick: () => void };
type PageButtonProps = { label: string; active?: boolean; disabled?: boolean; onClick: () => void };

const PAGE_SIZE = 20;
const periodLabels: Record<PeriodFilter, string> = { days: 'Дни', months: 'Месеци', years: 'Години' };
const typeLabels: Record<TypeFilter, string> = { all: 'Всички', income: 'Приходи', expense: 'Разходи' };
const reportEntries: ReportEntry[] = Array.from({ length: 42 }, (_, index) => ({
  id: 'entry-' + (index + 1),
  title: index % 2 === 0 ? 'Курс категория B' : 'Фактура за гориво',
  type: index % 2 === 0 ? 'income' : 'expense',
  category: index % 2 === 0 ? 'Такси' : 'Поддръжка',
  amount: index % 2 === 0 ? 1400 + index * 9 : 180 + index * 7,
  date: '2026-' + (index < 30 ? '03' : index < 38 ? '02' : '01') + '-' + String(25 - (index % 25)).padStart(2, '0'),
  source: index % 2 === 0 ? 'Мария Иванова' : 'Auto Profi',
  status: index % 3 === 0 ? 'warning' : 'success',
}));

function formatMoney(amount: number) { return amount.toLocaleString('bg-BG') + ' лв'; }
function matchesPeriod(dateText: string, filter: PeriodFilter, selectedDate: string, selectedMonth: string, selectedYear: string) { const value = new Date(dateText); if (filter === 'days') return dateText === selectedDate; if (filter === 'months') return dateText.startsWith(selectedMonth); return String(value.getFullYear()) === selectedYear; }
function getPeriodSummary(filter: PeriodFilter, selectedDate: string, selectedMonth: string, selectedYear: string) { if (filter === 'days') return new Date(selectedDate).toLocaleDateString('bg-BG'); if (filter === 'months') { const [year, month] = selectedMonth.split('-'); return month + '.' + year; } return selectedYear; }
function FilterChip({ label, active, onClick }: ChipProps) {
  return <button type='button' onClick={onClick} className='rounded-full px-4 py-2 text-sm font-medium transition-all' style={{ background: active ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255,255,255,0.03)', color: active ? 'var(--text-primary)' : 'var(--text-secondary)', border: active ? '1px solid rgba(99, 102, 241, 0.28)' : '1px solid var(--ghost-border)' }}>{label}</button>;
}
function PaginationButton({ label, active = false, disabled = false, onClick }: PageButtonProps) {
  return <button type='button' onClick={onClick} disabled={disabled} className='flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40' style={{ background: active ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-card-elevated)', color: active ? 'var(--text-primary)' : 'var(--text-secondary)', border: active ? '1px solid rgba(99, 102, 241, 0.28)' : '1px solid var(--ghost-border)' }}>{label}</button>;
}

export function ReportsPage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('months');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedDate, setSelectedDate] = useState('2026-03-25');
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [page, setPage] = useState(1);
  const scopedEntries = useMemo(() => reportEntries.filter((entry) => matchesPeriod(entry.date, periodFilter, selectedDate, selectedMonth, selectedYear)), [periodFilter, selectedDate, selectedMonth, selectedYear]);
  const filteredEntries = useMemo(() => scopedEntries.filter((entry) => (typeFilter === 'all' ? true : entry.type === typeFilter)), [scopedEntries, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedEntries = useMemo(() => filteredEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [currentPage, filteredEntries]);
  const income = scopedEntries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = scopedEntries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  const result = income - expenses;
  const resultLabel = result >= 0 ? 'Печалба' : 'Загуба';
  const resultColor = result >= 0 ? 'var(--status-success)' : 'var(--status-error)';
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const changePeriod = (filter: PeriodFilter) => { setPeriodFilter(filter); setPage(1); };
  const changeType = (filter: TypeFilter) => { setTypeFilter(filter); setPage(1); };
  return (
    <div>
      <PageHeader title='Отчети' description='Финансов преглед с минималистични филтри, разделяне по приходи и разходи и странициране по 20 записа.' breadcrumbs={[{ label: 'Начало' }, { label: 'Отчети' }]} />
      <PageSection>
        <div className='rounded-3xl px-6 py-5' style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(25, 37, 64, 0.92))', border: '1px solid var(--ghost-border)' }}>
          <p className='text-xs uppercase tracking-[0.18em]' style={{ color: 'var(--text-tertiary)' }}>Месечен резултат</p>
          <p className='mt-3 text-3xl font-semibold' style={{ color: resultColor }}>{resultLabel} {formatMoney(Math.abs(result))}</p>
          <p className='mt-2 text-sm' style={{ color: 'var(--text-secondary)' }}>За {getPeriodSummary(periodFilter, selectedDate, selectedMonth, selectedYear)}</p>
        </div>
        <MetricGrid>
          <MetricCard icon={<TrendingUp size={18} />} label='Приходи' value={formatMoney(income)} detail={periodLabels[periodFilter]} tone='success' />
          <MetricCard icon={<TrendingDown size={18} />} label='Разходи' value={formatMoney(expenses)} detail={typeLabels[typeFilter]} tone='warning' />
          <MetricCard icon={<CheckCircle2 size={18} />} label='Записи' value={String(filteredEntries.length)} detail={'Страница ' + currentPage + ' от ' + totalPages} tone='info' />
        </MetricGrid>
        <Panel title='Филтри' subtitle='Избор по период и тип записи.'>
          <div className='space-y-5'>
            <div className='space-y-2'>
              <label className='text-xs uppercase tracking-[0.18em]' style={{ color: 'var(--text-tertiary)' }}>Период</label>
              <select value={periodFilter} onChange={(event) => changePeriod(event.target.value as PeriodFilter)} className='h-11 w-full rounded-2xl px-4 text-sm outline-none transition-all' style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }}>
                <option value='days'>Конкретен ден</option>
                <option value='months'>Цял месец</option>
                <option value='years'>Цяла година</option>
              </select>
            </div>
            <div className='space-y-2'>
              {periodFilter === 'days' && <input type='date' value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setPage(1); }} className='h-11 w-full rounded-2xl px-4 text-sm outline-none transition-all' style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }} />}
              {periodFilter === 'months' && <input type='month' value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); setPage(1); }} className='h-11 w-full rounded-2xl px-4 text-sm outline-none transition-all' style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }} />}
              {periodFilter === 'years' && <input type='number' min='2020' max='2035' value={selectedYear} onChange={(event) => { setSelectedYear(event.target.value); setPage(1); }} className='h-11 w-full rounded-2xl px-4 text-sm outline-none transition-all' style={{ background: 'var(--bg-card-elevated)', color: 'var(--text-primary)', border: '1px solid var(--ghost-border)' }} />}
            </div>
            <div className='flex flex-wrap gap-3'>
              {(Object.keys(typeLabels) as TypeFilter[]).map((filter) => <FilterChip key={filter} label={typeLabels[filter]} active={typeFilter === filter} onClick={() => changeType(filter)} />)}
            </div>
          </div>
        </Panel>
        <Panel title='Финансови записи' subtitle='Таблица с 20 записа на страница и ясна пагинация.'>
          <DataTableLayout columns={['Запис', 'Тип', 'Категория', 'Сума', 'Дата', 'Източник', 'Статус']} rows={pagedEntries.map((entry) => [entry.title, entry.type === 'income' ? 'Приход' : 'Разход', entry.category, formatMoney(entry.amount), new Date(entry.date).toLocaleDateString('bg-BG'), entry.source, <StatusBadge key={entry.id} status={entry.status}>{statusLabel(entry.status)}</StatusBadge>])} />
          <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>Показани {pagedEntries.length} от {filteredEntries.length} записа</p>
            <div className='flex flex-wrap items-center gap-2'>
              <PaginationButton label='‹' disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} />
              {pages.map((value) => <PaginationButton key={value} label={String(value)} active={value === currentPage} onClick={() => setPage(value)} />)}
              <PaginationButton label='›' disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} />
            </div>
          </div>
        </Panel>
      </PageSection>
    </div>
  );
}
