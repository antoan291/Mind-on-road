export type DashboardTransactionType = 'income' | 'expense';
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
  currency: 'BGN' | 'EUR';
};

export const reportEntries: DashboardReportEntry[] = [
  {
    id: 'entry-1',
    title: 'Шофьорски курс - B',
    type: 'income',
    category: 'Курсисти',
    amount: 250,
    date: '2026-02-05',
    source: 'Седмичен отчет',
    paymentMethod: 'cash',
    status: 'success',
    documentReference: 'ф7981',
    counterparty: 'Михаил Катеринов Минчев',
    note: 'Доплащане по курс',
    currency: 'BGN'
  },
  {
    id: 'entry-2',
    title: 'Такса теория',
    type: 'income',
    category: 'Такси',
    amount: 16.36,
    date: '2026-01-30',
    source: 'Седмичен отчет',
    paymentMethod: 'card',
    status: 'success',
    documentReference: '',
    counterparty: 'Даниел Веселинов Иванов',
    note: 'Такси',
    currency: 'EUR'
  },
  {
    id: 'entry-3',
    title: 'Гориво',
    type: 'expense',
    category: 'Поддръжка',
    amount: 17,
    date: '2026-01-30',
    source: 'Седмичен отчет',
    paymentMethod: 'bank',
    status: 'warning',
    documentReference: '',
    counterparty: 'Панчо',
    note: 'Гориво',
    currency: 'EUR'
  },
  {
    id: 'entry-4',
    title: 'Пратка Еконт',
    type: 'expense',
    category: 'Оперативни разходи',
    amount: 40,
    date: '2026-01-30',
    source: 'Седмичен отчет',
    paymentMethod: 'bank',
    status: 'warning',
    documentReference: '',
    counterparty: 'Ники',
    note: 'Пратка Еконт',
    currency: 'EUR'
  },
  {
    id: 'entry-5',
    title: 'II-ра практика ДАИ',
    type: 'income',
    category: 'Изпитни такси',
    amount: 171.28,
    date: '2026-02-12',
    source: 'Седмичен отчет',
    paymentMethod: 'pos',
    status: 'success',
    documentReference: '',
    counterparty: 'Даниел Асенов Кирилов',
    note: 'II-ра практика ДАИ',
    currency: 'EUR'
  },
  {
    id: 'entry-6',
    title: 'Банков превод към университет',
    type: 'expense',
    category: 'Такси и трансфери',
    amount: 64,
    date: '2026-02-25',
    source: 'Седмичен отчет',
    paymentMethod: 'bank',
    status: 'warning',
    documentReference: '',
    counterparty: 'Технически университет',
    note: 'Банково плащане към университет',
    currency: 'BGN'
  }
];

export function formatDashboardMoney(amount: number) {
  return amount.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' лв';
}
