import type { ExpenseRecordView } from '../../services/expensesApi';
import type { PaymentRecordView } from '../../services/paymentsApi';

export type DashboardTransactionType =
  | 'income'
  | 'expense'
  | 'friend-vat-expense';
export type DashboardPaymentMethod = 'cash' | 'bank' | 'card' | 'pos';
export type DashboardEntryStatus = 'success' | 'warning' | 'error';

export type DashboardReportEntry = {
  id: string;
  title: string;
  type: DashboardTransactionType;
  category: string;
  amount: number;
  date: string;
  source: string;
  paymentMethod: DashboardPaymentMethod;
  status: DashboardEntryStatus;
  documentReference: string;
  counterparty: string;
  note: string;
  currency: 'EUR';
  vatAmount?: number;
  affectsOperationalExpense?: boolean;
};

export const reportEntries: DashboardReportEntry[] = [
  {
    id: 'entry-antoan-payment',
    title: 'Шофьорски курс - B · Антоан Тест',
    type: 'income',
    category: 'Курсисти',
    amount: 1200,
    date: '2026-04-04',
    source: 'PostgreSQL плащания',
    paymentMethod: 'bank',
    status: 'success',
    documentReference: 'PAY-AT-001',
    counterparty: 'Антоан Тест',
    note: 'Единствен тестов курсист за локална проверка на отчетите.',
    currency: 'EUR'
  },
  {
    id: 'entry-friend-vat-001',
    title: 'Фактура гориво от приятел · тест',
    type: 'friend-vat-expense',
    category: 'ДДС от приятели',
    amount: 240,
    date: '2026-04-04',
    source: 'Приятелски документ',
    paymentMethod: 'bank',
    status: 'success',
    documentReference: 'FR-VAT-AT-001',
    counterparty: 'Партньор доставчик',
    note: 'Не е реален разход в касата, използва се само за ДДС калкулация.',
    currency: 'EUR',
    vatAmount: 40,
    affectsOperationalExpense: false
  }
];

export function formatDashboardMoney(amount: number) {
  return amount.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export function buildReportEntriesFromFinanceRecords(
  payments: PaymentRecordView[],
  expenses: ExpenseRecordView[],
): DashboardReportEntry[] {
  const paymentEntries: DashboardReportEntry[] = payments.map((payment) => ({
    id: String(payment.id),
    title: `${payment.paymentReason || 'Плащане'} · ${payment.student}`,
    type: 'income',
    category: payment.category || 'Курсисти',
    amount: payment.paidAmount,
    date: payment.date,
    source: 'PostgreSQL плащания',
    paymentMethod: normalizePaymentMethod(payment.paymentMethod),
    status: normalizeIncomeStatus(payment.paymentStatus),
    documentReference: payment.paymentNumber,
    counterparty: payment.student,
    note: payment.notes || '',
    currency: 'EUR',
    affectsOperationalExpense: true,
  }));

  const expenseEntries: DashboardReportEntry[] = expenses.map((expense) => ({
    id: expense.id,
    title: expense.title,
    type: expense.type,
    category: expense.category,
    amount: expense.amount,
    date: expense.date,
    source: expense.source,
    paymentMethod: normalizePaymentMethod(expense.paymentMethod),
    status: expense.status,
    documentReference: '',
    counterparty: expense.counterparty,
    note: expense.note,
    currency: 'EUR',
    vatAmount: expense.vatAmount,
    affectsOperationalExpense: expense.affectsOperationalExpense,
  }));

  return [...paymentEntries, ...expenseEntries].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
}

function normalizePaymentMethod(value: string): DashboardPaymentMethod {
  if (
    value === 'cash' ||
    value === 'bank' ||
    value === 'card' ||
    value === 'pos'
  ) {
    return value;
  }

  return 'bank';
}

function normalizeIncomeStatus(
  value: PaymentRecordView['paymentStatus'],
): DashboardEntryStatus {
  if (value === 'paid') {
    return 'success';
  }

  if (value === 'partial' || value === 'pending') {
    return 'warning';
  }

  return 'error';
}
