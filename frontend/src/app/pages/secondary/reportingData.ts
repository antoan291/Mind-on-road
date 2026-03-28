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
};

export const reportEntries: DashboardReportEntry[] = Array.from({ length: 42 }, (_, index) => ({
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

export function formatDashboardMoney(amount: number) {
  return amount.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' лв';
}
