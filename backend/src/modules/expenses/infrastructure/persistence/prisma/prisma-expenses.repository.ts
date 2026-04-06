import type { PrismaClient } from '@prisma/client';

import type {
  ExpenseCreateInput,
  ExpenseRecord,
  ExpensesRepository
} from '../../../domain/repositories/expenses.repository';

export class PrismaExpensesRepository implements ExpensesRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
  }): Promise<ExpenseRecord[]> {
    return this.prisma.expenseRecord.findMany({
      where: {
        tenantId: params.tenantId
      },
      orderBy: {
        entryDate: 'desc'
      },
      select: expenseSelection
    });
  }

  public async createForTenant(params: {
    tenantId: string;
    expense: ExpenseCreateInput;
  }): Promise<ExpenseRecord> {
    return this.prisma.expenseRecord.create({
      data: {
        tenantId: params.tenantId,
        expenseType: params.expense.expenseType,
        title: params.expense.title,
        category: params.expense.category,
        amount: params.expense.amount,
        vatAmount: params.expense.vatAmount,
        paymentMethod: params.expense.paymentMethod,
        source: params.expense.source,
        counterparty: params.expense.counterparty,
        note: params.expense.note,
        status: params.expense.status,
        affectsOperationalExpense: params.expense.affectsOperationalExpense,
        entryDate: params.expense.entryDate
      },
      select: expenseSelection
    });
  }

  public async deleteByTenantAndId(params: {
    tenantId: string;
    expenseId: string;
  }): Promise<boolean> {
    const deletedRows = await this.prisma.expenseRecord.deleteMany({
      where: {
        id: params.expenseId,
        tenantId: params.tenantId
      }
    });

    return deletedRows.count > 0;
  }
}

const expenseSelection = {
  id: true,
  expenseType: true,
  title: true,
  category: true,
  amount: true,
  vatAmount: true,
  paymentMethod: true,
  source: true,
  counterparty: true,
  note: true,
  status: true,
  affectsOperationalExpense: true,
  entryDate: true,
  createdAt: true,
  updatedAt: true
};
