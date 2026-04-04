import type {
  PaymentRecord,
  PaymentsRepository
} from '../../domain/repositories/payments.repository';

export class PaymentsQueryService {
  public constructor(private readonly paymentsRepository: PaymentsRepository) {}

  public async listPayments(params: { tenantId: string }) {
    const payments = await this.paymentsRepository.listByTenant({
      tenantId: params.tenantId
    });

    return payments.map((payment) => toPaymentResponse(payment));
  }
}

export function toPaymentResponse(payment: PaymentRecord) {
  return {
    id: payment.id,
    studentId: payment.studentId,
    studentName: payment.studentName,
    paymentNumber: payment.paymentNumber,
    amount: payment.amount,
    paidAmount: payment.paidAmount,
    method: payment.method,
    status: payment.status,
    paidAt: payment.paidAt.toISOString().slice(0, 10),
    note: payment.note,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString()
  };
}
