import type { Prisma, PrismaClient } from '@prisma/client';

import type { QueryReadAccessScope } from '../../../../shared/query/read-access-scope';
import type {
  InvoiceCreateInput,
  InvoiceRecord,
  InvoiceUpdateInput,
  InvoicesRepository
} from '../../../domain/repositories/invoices.repository';

const invoiceSelect = {
  id: true,
  studentId: true,
  invoiceNumber: true,
  invoiceDate: true,
  recipientName: true,
  categoryCode: true,
  invoiceReason: true,
  packageType: true,
  totalAmount: true,
  currency: true,
  status: true,
  paymentLinkStatus: true,
  paymentNumber: true,
  paymentStatus: true,
  createdBy: true,
  createdDate: true,
  lastUpdatedBy: true,
  notes: true,
  issuedDate: true,
  dueDate: true,
  vatAmount: true,
  subtotalAmount: true,
  wasCorrected: true,
  correctionReason: true,
  createdAt: true,
  updatedAt: true
} as const;

export class PrismaInvoicesRepository implements InvoicesRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }): Promise<InvoiceRecord[]> {
    return this.prisma.invoiceRecord.findMany({
      where: buildInvoiceReadWhere(params.tenantId, params.scope),
      orderBy: {
        invoiceDate: 'desc'
      },
      select: invoiceSelect
    });
  }

  public async createForTenant(params: {
    tenantId: string;
    invoice: InvoiceCreateInput;
  }): Promise<InvoiceRecord | null> {
    const student = await this.prisma.student.findFirst({
      where: {
        id: params.invoice.studentId,
        tenantId: params.tenantId
      },
      select: {
        id: true,
        displayName: true
      }
    });

    if (!student) {
      return null;
    }

    return this.prisma.invoiceRecord.create({
      data: {
        tenantId: params.tenantId,
        ...params.invoice,
        studentId: student.id,
        recipientName: student.displayName
      },
      select: invoiceSelect
    });
  }

  public async updateByTenantAndId(params: {
    tenantId: string;
    invoiceId: string;
    invoice: InvoiceUpdateInput;
  }): Promise<InvoiceRecord | null> {
    const updatedRows = await this.prisma.invoiceRecord.updateMany({
      where: {
        id: params.invoiceId,
        tenantId: params.tenantId
      },
      data: params.invoice
    });

    if (updatedRows.count === 0) {
      return null;
    }

    return this.prisma.invoiceRecord.findFirst({
      where: {
        id: params.invoiceId,
        tenantId: params.tenantId
      },
      select: invoiceSelect
    });
  }

  public async deleteByTenantAndId(params: {
    tenantId: string;
    invoiceId: string;
  }): Promise<boolean> {
    const deletedRows = await this.prisma.invoiceRecord.deleteMany({
      where: {
        id: params.invoiceId,
        tenantId: params.tenantId
      }
    });

    return deletedRows.count > 0;
  }
}

function buildInvoiceReadWhere(
  tenantId: string,
  scope?: QueryReadAccessScope
): Prisma.InvoiceRecordWhereInput {
  if (!scope || scope.mode === 'tenant') {
    return { tenantId };
  }

  return {
    tenantId,
    studentId: {
      in: scope.studentIds
    }
  };
}
