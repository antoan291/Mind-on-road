import type {
  InvoiceCreateInput,
  InvoicesRepository,
  InvoiceUpdateInput
} from '../../domain/repositories/invoices.repository';
import { toInvoiceResponse } from './invoices-query.service';

export class InvoicesCommandService {
  public constructor(private readonly invoicesRepository: InvoicesRepository) {}

  public async createInvoice(params: {
    tenantId: string;
    invoice: InvoiceCreateInput;
  }) {
    const invoice = await this.invoicesRepository.createForTenant(params);

    return invoice ? toInvoiceResponse(invoice) : null;
  }

  public async updateInvoice(params: {
    tenantId: string;
    invoiceId: string;
    invoice: InvoiceUpdateInput;
  }) {
    const invoice = await this.invoicesRepository.updateByTenantAndId(params);

    return invoice ? toInvoiceResponse(invoice) : null;
  }

  public async deleteInvoice(params: {
    tenantId: string;
    invoiceId: string;
  }) {
    return this.invoicesRepository.deleteByTenantAndId(params);
  }
}
