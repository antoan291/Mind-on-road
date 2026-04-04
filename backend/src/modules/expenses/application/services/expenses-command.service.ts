import type {
  ExpenseCreateInput,
  ExpensesRepository
} from '../../domain/repositories/expenses.repository';
import { toExpenseResponse } from './expenses-query.service';

export class ExpensesCommandService {
  public constructor(private readonly expensesRepository: ExpensesRepository) {}

  public async createExpense(command: {
    tenantId: string;
    expense: ExpenseCreateInput;
  }) {
    return toExpenseResponse(
      await this.expensesRepository.createForTenant({
        tenantId: command.tenantId,
        expense: command.expense
      })
    );
  }
}
