export interface ExpenseRecord {
  id: string;
  expenseType: string;
  title: string;
  category: string;
  amount: number;
  vatAmount: number;
  paymentMethod: string;
  source: string;
  counterparty: string;
  note: string;
  status: string;
  affectsOperationalExpense: boolean;
  entryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCreateInput {
  expenseType: string;
  title: string;
  category: string;
  amount: number;
  vatAmount: number;
  paymentMethod: string;
  source: string;
  counterparty: string;
  note: string;
  status: string;
  affectsOperationalExpense: boolean;
  entryDate: Date;
}

export interface ExpensesRepository {
  listByTenant(params: { tenantId: string }): Promise<ExpenseRecord[]>;

  createForTenant(params: {
    tenantId: string;
    expense: ExpenseCreateInput;
  }): Promise<ExpenseRecord>;
}
