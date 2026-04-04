import type {
  InvoiceRecord,
  InvoicesRepository
} from '../../domain/repositories/invoices.repository';

export class InvoicesQueryService {
  public constructor(private readonly invoicesRepository: InvoicesRepository) {}

  public async listInvoices(params: { tenantId: string }) {
    const invoices = await this.invoicesRepository.listByTenant({
      tenantId: params.tenantId
    });

    return invoices.map((invoice) => toInvoiceResponse(invoice));
  }
}

export function toInvoiceResponse(invoice: InvoiceRecord) {
  return {
    id: invoice.id,
    studentId: invoice.studentId,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString().slice(0, 10),
    recipientName: invoice.recipientName,
    categoryCode: invoice.categoryCode,
    invoiceReason: invoice.invoiceReason,
    packageType: invoice.packageType,
    totalAmount: invoice.totalAmount,
    currency: invoice.currency,
    status: invoice.status,
    paymentLinkStatus: invoice.paymentLinkStatus,
    paymentNumber: invoice.paymentNumber,
    paymentStatus: invoice.paymentStatus,
    createdBy: invoice.createdBy,
    createdDate: invoice.createdDate.toISOString().slice(0, 10),
    lastUpdatedBy: invoice.lastUpdatedBy,
    notes: invoice.notes,
    issuedDate: invoice.issuedDate
      ? invoice.issuedDate.toISOString().slice(0, 10)
      : null,
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString().slice(0, 10) : null,
    vatAmount: invoice.vatAmount,
    subtotalAmount: invoice.subtotalAmount,
    wasCorrected: invoice.wasCorrected,
    correctionReason: invoice.correctionReason,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString()
  };
}
