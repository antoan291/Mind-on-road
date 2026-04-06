import type {
  PaymentUpdateInput,
  PaymentWriteInput,
  PaymentsRepository
} from '../../domain/repositories/payments.repository';
import { toPaymentResponse } from './payments-query.service';

export class PaymentsCommandService {
  public constructor(
    private readonly paymentsRepository: PaymentsRepository
  ) {}

  public async createPayment(params: {
    tenantId: string;
    payment: PaymentWriteInput;
  }) {
    const payment = await this.paymentsRepository.createForTenant({
      tenantId: params.tenantId,
      payment: params.payment
    });

    return payment ? toPaymentResponse(payment) : null;
  }

  public async updatePayment(params: {
    tenantId: string;
    paymentId: string;
    payment: PaymentUpdateInput;
  }) {
    const payment = await this.paymentsRepository.updateByTenantAndId({
      tenantId: params.tenantId,
      paymentId: params.paymentId,
      payment: params.payment
    });

    return payment ? toPaymentResponse(payment) : null;
  }

  public async deletePayment(params: {
    tenantId: string;
    paymentId: string;
  }) {
    return this.paymentsRepository.deleteByTenantAndId(params);
  }
}
