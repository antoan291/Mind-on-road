import assert from 'node:assert/strict';
import test from 'node:test';

import { DocumentsCommandService } from '../../src/modules/documents/application/services/documents-command.service';
import { ExpensesCommandService } from '../../src/modules/expenses/application/services/expenses-command.service';
import { InvoicesCommandService } from '../../src/modules/invoicing/application/services/invoices-command.service';
import { PaymentsCommandService } from '../../src/modules/payments/application/services/payments-command.service';

test('payments delete delegates to tenant-scoped repository delete', async () => {
  let capturedParams: { tenantId: string; paymentId: string } | null = null;
  const service = new PaymentsCommandService({
    deleteByTenantAndId: async (params: {
      tenantId: string;
      paymentId: string;
    }) => {
      capturedParams = params;
      return true;
    },
  } as never);

  const deleted = await service.deletePayment({
    tenantId: 'tenant-1',
    paymentId: 'payment-1',
  });

  assert.equal(deleted, true);
  assert.deepEqual(capturedParams, {
    tenantId: 'tenant-1',
    paymentId: 'payment-1',
  });
});

test('expenses delete delegates to tenant-scoped repository delete', async () => {
  let capturedParams: { tenantId: string; expenseId: string } | null = null;
  const service = new ExpensesCommandService({
    deleteByTenantAndId: async (params: {
      tenantId: string;
      expenseId: string;
    }) => {
      capturedParams = params;
      return true;
    },
  } as never);

  const deleted = await service.deleteExpense({
    tenantId: 'tenant-1',
    expenseId: 'expense-1',
  });

  assert.equal(deleted, true);
  assert.deepEqual(capturedParams, {
    tenantId: 'tenant-1',
    expenseId: 'expense-1',
  });
});

test('documents delete delegates to tenant-scoped repository delete', async () => {
  let capturedParams: { tenantId: string; documentId: string } | null = null;
  const service = new DocumentsCommandService({
    deleteByTenantAndId: async (params: {
      tenantId: string;
      documentId: string;
    }) => {
      capturedParams = params;
      return true;
    },
  } as never);

  const deleted = await service.deleteDocument({
    tenantId: 'tenant-1',
    documentId: 'document-1',
  });

  assert.equal(deleted, true);
  assert.deepEqual(capturedParams, {
    tenantId: 'tenant-1',
    documentId: 'document-1',
  });
});

test('invoices delete delegates to tenant-scoped repository delete', async () => {
  let capturedParams: { tenantId: string; invoiceId: string } | null = null;
  const service = new InvoicesCommandService({
    deleteByTenantAndId: async (params: {
      tenantId: string;
      invoiceId: string;
    }) => {
      capturedParams = params;
      return true;
    },
  } as never);

  const deleted = await service.deleteInvoice({
    tenantId: 'tenant-1',
    invoiceId: 'invoice-1',
  });

  assert.equal(deleted, true);
  assert.deepEqual(capturedParams, {
    tenantId: 'tenant-1',
    invoiceId: 'invoice-1',
  });
});
