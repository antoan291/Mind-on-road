import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  PaymentRecord,
  PaymentUpdateInput,
  PaymentsRepository,
  PaymentWriteInput
} from '../../../domain/repositories/payments.repository';

const paymentRecordSelect = {
  id: true,
  studentId: true,
  studentName: true,
  paymentNumber: true,
  amount: true,
  paidAmount: true,
  method: true,
  status: true,
  paidAt: true,
  note: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.PaymentRecordSelect;

export class PrismaPaymentsRepository implements PaymentsRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
  }): Promise<PaymentRecord[]> {
    return this.prisma.paymentRecord.findMany({
      where: {
        tenantId: params.tenantId
      },
      orderBy: {
        paidAt: 'desc'
      },
      select: paymentRecordSelect
    });
  }

  public async createForTenant(params: {
    tenantId: string;
    payment: PaymentWriteInput;
  }): Promise<PaymentRecord | null> {
    const normalizedPayment = await this.normalizePaymentForTenant(
      params.tenantId,
      params.payment
    );

    if (!normalizedPayment) {
      return null;
    }

    return this.prisma.paymentRecord.create({
      data: {
        tenantId: params.tenantId,
        studentId: params.payment.studentId,
        studentName: normalizedPayment.studentName ?? params.payment.studentName,
        paymentNumber:
          normalizedPayment.paymentNumber ?? params.payment.paymentNumber,
        amount: normalizedPayment.amount ?? params.payment.amount,
        paidAmount:
          normalizedPayment.paidAmount ??
          params.payment.paidAmount ??
          derivePaidAmountFromStatus(
            normalizedPayment.status ?? params.payment.status,
            normalizedPayment.amount ?? params.payment.amount
          ),
        method: normalizedPayment.method ?? params.payment.method,
        status: normalizedPayment.status ?? params.payment.status,
        paidAt: normalizedPayment.paidAt ?? params.payment.paidAt,
        note: normalizedPayment.note ?? params.payment.note
      },
      select: paymentRecordSelect
    });
  }

  public async updateByTenantAndId(params: {
    tenantId: string;
    paymentId: string;
    payment: PaymentUpdateInput;
  }): Promise<PaymentRecord | null> {
    const normalizedPayment = await this.normalizePaymentForTenant(
      params.tenantId,
      params.payment
    );

    if (!normalizedPayment) {
      return null;
    }

    const updateResult = await this.prisma.paymentRecord.updateMany({
      where: {
        id: params.paymentId,
        tenantId: params.tenantId
      },
      data: normalizedPayment
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.prisma.paymentRecord.findUnique({
      where: {
        id: params.paymentId
      },
      select: paymentRecordSelect
    });
  }

  private async normalizePaymentForTenant(
    tenantId: string,
    payment: PaymentWriteInput | PaymentUpdateInput
  ) {
    if (!payment.studentId) {
      return payment;
    }

    const student = await this.prisma.student.findFirst({
      where: {
        id: payment.studentId,
        tenantId
      },
      select: {
        id: true,
        displayName: true
      }
    });

    if (!student) {
      return null;
    }

    return {
      ...payment,
      studentId: student.id,
      studentName: student.displayName
    };
  }
}

function derivePaidAmountFromStatus(status: string, amount: number) {
  if (status === 'PAID' || status === 'PARTIAL') {
    return amount;
  }

  return 0;
}
