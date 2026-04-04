import { apiClient } from './apiClient';

export type ExpenseRecordView = {
  id: string;
  type: 'expense' | 'friend-vat-expense';
  title: string;
  category: string;
  amount: number;
  vatAmount: number;
  paymentMethod: 'cash' | 'bank' | 'card' | 'pos' | string;
  source: string;
  counterparty: string;
  note: string;
  status: 'success' | 'warning' | 'error';
  affectsOperationalExpense: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseCreatePayload = {
  type: 'expense' | 'friend-vat-expense';
  title: string;
  category: string;
  amount: number;
  vatAmount: number;
  paymentMethod: string;
  source: string;
  counterparty: string;
  note: string;
  status: 'success' | 'warning' | 'error';
  affectsOperationalExpense: boolean;
  date: string;
};

export async function fetchExpenseRecords() {
  const response = await apiClient.get<{ items: ExpenseRecordView[] }>(
    '/expenses',
  );

  return response.items;
}

export async function createExpenseRecord(
  payload: ExpenseCreatePayload,
  csrfToken: string,
) {
  return apiClient.post<ExpenseRecordView>('/expenses', payload, csrfToken);
}
