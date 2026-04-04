import type { ExpensesQueryService } from '../../../expenses/application/services/expenses-query.service';
import type { PaymentsQueryService } from '../../../payments/application/services/payments-query.service';

type FinanceReportEntryType = 'income' | 'expense' | 'friend-vat-expense';
type FinanceReportStatus = 'success' | 'warning' | 'error';

export interface FinanceReportEntryResponse {
  id: string;
  title: string;
  type: FinanceReportEntryType;
  category: string;
  amount: number;
  date: string;
  source: string;
  paymentMethod: string;
  status: FinanceReportStatus;
  documentReference: string;
  counterparty: string;
  note: string;
  currency: 'BGN';
  vatAmount: number;
  affectsOperationalExpense: boolean;
}

export interface FinanceReportSummaryResponse {
  incomeTotal: number;
  realExpenseTotal: number;
  friendVatTotal: number;
  netResult: number;
  entriesCount: number;
}

export interface FinanceReportResponse {
  summary: FinanceReportSummaryResponse;
  items: FinanceReportEntryResponse[];
}

export class FinanceReportQueryService {
  public constructor(
    private readonly paymentsQueryService: PaymentsQueryService,
    private readonly expensesQueryService: ExpensesQueryService
  ) {}

  public async getFinanceReport(params: {
    tenantId: string;
  }): Promise<FinanceReportResponse> {
    const [payments, expenses] = await Promise.all([
      this.paymentsQueryService.listPayments({
        tenantId: params.tenantId
      }),
      this.expensesQueryService.listExpenses({
        tenantId: params.tenantId
      })
    ]);

    const items = [
      ...payments.map((payment) => ({
        id: payment.id,
        title: `${payment.note || 'Плащане'} · ${payment.studentName}`,
        type: 'income' as const,
        category: 'Курсисти',
        amount: payment.status === 'PAID' || payment.status === 'PARTIAL'
          ? payment.amount
          : 0,
        date: payment.paidAt,
        source: 'PostgreSQL плащания',
        paymentMethod: payment.method,
        status: mapPaymentStatus(payment.status),
        documentReference: payment.paymentNumber,
        counterparty: payment.studentName,
        note: payment.note ?? '',
        currency: 'BGN' as const,
        vatAmount: 0,
        affectsOperationalExpense: true
      })),
      ...expenses.map((expense) => ({
        id: expense.id,
        title: expense.title,
        type: expense.type as FinanceReportEntryType,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        source: expense.source,
        paymentMethod: expense.paymentMethod,
        status: expense.status as FinanceReportStatus,
        documentReference: '',
        counterparty: expense.counterparty,
        note: expense.note,
        currency: 'BGN' as const,
        vatAmount: expense.vatAmount,
        affectsOperationalExpense: expense.affectsOperationalExpense
      }))
    ].sort((left, right) => right.date.localeCompare(left.date));

    const incomeTotal = items
      .filter((entry) => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const realExpenseTotal = items
      .filter(
        (entry) =>
          entry.type === 'expense' &&
          entry.affectsOperationalExpense !== false
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
    const friendVatTotal = items
      .filter((entry) => entry.type === 'friend-vat-expense')
      .reduce((sum, entry) => sum + entry.vatAmount, 0);

    return {
      summary: {
        incomeTotal,
        realExpenseTotal,
        friendVatTotal,
        netResult: incomeTotal - realExpenseTotal,
        entriesCount: items.length
      },
      items
    };
  }
}

function mapPaymentStatus(status: string): FinanceReportStatus {
  if (status === 'PAID') {
    return 'success';
  }

  if (status === 'PARTIAL' || status === 'PENDING') {
    return 'warning';
  }

  return 'error';
}
