import type {
  ExpenseRecord,
  ExpensesRepository
} from '../../domain/repositories/expenses.repository';

export class ExpensesQueryService {
  public constructor(private readonly expensesRepository: ExpensesRepository) {}

  public async listExpenses(params: { tenantId: string }) {
    const expenses = await this.expensesRepository.listByTenant({
      tenantId: params.tenantId
    });

    return expenses.map((expense) => toExpenseResponse(expense));
  }
}

export function toExpenseResponse(expense: ExpenseRecord) {
  return {
    id: expense.id,
    type: expense.expenseType,
    title: expense.title,
    category: expense.category,
    amount: expense.amount,
    vatAmount: expense.vatAmount,
    paymentMethod: expense.paymentMethod,
    source: expense.source,
    counterparty: expense.counterparty,
    note: expense.note,
    status: expense.status,
    affectsOperationalExpense: expense.affectsOperationalExpense,
    date: expense.entryDate.toISOString().slice(0, 10),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString()
  };
}
