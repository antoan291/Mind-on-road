import { apiClient } from './apiClient';

export type FinanceReportEntryView = {
  id: string;
  title: string;
  type: 'income' | 'expense' | 'friend-vat-expense';
  category: string;
  amount: number;
  date: string;
  source: string;
  paymentMethod: 'cash' | 'bank' | 'card' | 'pos' | string;
  status: 'success' | 'warning' | 'error';
  documentReference: string;
  counterparty: string;
  note: string;
  currency: 'EUR';
  vatAmount: number;
  affectsOperationalExpense: boolean;
};

export type FinanceReportSummaryView = {
  incomeTotal: number;
  realExpenseTotal: number;
  friendVatTotal: number;
  netResult: number;
  entriesCount: number;
};

export type FinanceLedgerReportView = {
  summary: FinanceReportSummaryView;
  items: FinanceReportEntryView[];
};

export async function fetchFinanceLedgerReport() {
  return apiClient.get<FinanceLedgerReportView>('/reports/finance-ledger');
}
