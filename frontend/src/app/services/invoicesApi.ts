import { apiClient } from './apiClient';

export type InvoiceRecordView = {
  id: string | number;
  invoiceNumber: string;
  invoiceDate: string;
  student: string;
  studentId: string | number;
  category: string;
  invoiceReason: string;
  packageType: string;
  totalAmount: number;
  invoiceStatus: 'draft' | 'issued' | 'canceled' | 'corrected' | 'overdue';
  paymentLinkStatus: 'linked' | 'not_linked' | 'partial';
  paymentNumber?: string;
  paymentStatus?: 'paid' | 'partial' | 'overdue' | 'pending';
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
  wasCorrected: boolean;
  correctedBy?: string;
  correctionReason?: string;
  notes?: string;
  issuedDate?: string;
  dueDate?: string;
  vat?: number;
  subtotal?: number;
  activity?: Array<{
    type:
      | 'created'
      | 'edited'
      | 'issued'
      | 'payment_linked'
      | 'corrected'
      | 'canceled'
      | 'printed';
    description: string;
    timestamp: string;
    user: string;
  }>;
};

type BackendInvoiceRecord = {
  id: string;
  studentId: string;
  invoiceNumber: string;
  invoiceDate: string;
  recipientName: string;
  categoryCode: string;
  invoiceReason: string;
  packageType: string;
  totalAmount: number;
  status: 'DRAFT' | 'ISSUED' | 'CANCELED' | 'CORRECTED' | 'OVERDUE';
  paymentLinkStatus: 'LINKED' | 'NOT_LINKED' | 'PARTIAL';
  paymentNumber: string | null;
  paymentStatus: string | null;
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  notes: string | null;
  issuedDate: string | null;
  dueDate: string | null;
  vatAmount: number;
  subtotalAmount: number;
  wasCorrected: boolean;
  correctionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceCreatePayload = {
  studentId: string;
  invoiceNumber?: string;
  invoiceDate: string;
  recipientName: string;
  categoryCode: string;
  invoiceReason: string;
  packageType: string;
  totalAmount: number;
  status: 'DRAFT' | 'ISSUED' | 'CANCELED' | 'CORRECTED' | 'OVERDUE';
  paymentLinkStatus: 'LINKED' | 'NOT_LINKED' | 'PARTIAL';
  paymentNumber?: string | null;
  paymentStatus?: string | null;
  notes?: string | null;
  issuedDate?: string | null;
  dueDate?: string | null;
};

export type InvoiceUpdatePayload = {
  invoiceDate?: string;
  recipientName?: string;
  categoryCode?: string;
  invoiceReason?: string;
  packageType?: string;
  totalAmount?: number;
  status?: 'DRAFT' | 'ISSUED' | 'CANCELED' | 'CORRECTED' | 'OVERDUE';
  paymentLinkStatus?: 'LINKED' | 'NOT_LINKED' | 'PARTIAL';
  paymentNumber?: string | null;
  paymentStatus?: string | null;
  notes?: string | null;
  issuedDate?: string | null;
  dueDate?: string | null;
  wasCorrected?: boolean;
  correctionReason?: string | null;
};

export async function fetchInvoiceRecords() {
  const response = await apiClient.get<{ items: BackendInvoiceRecord[] }>(
    '/invoices',
  );

  return response.items.map((invoice) => mapBackendInvoice(invoice));
}

export async function createInvoiceRecord(
  payload: InvoiceCreatePayload,
  csrfToken: string,
) {
  const response = await apiClient.post<BackendInvoiceRecord>(
    '/invoices',
    payload,
    csrfToken,
  );

  return mapBackendInvoice(response);
}

export async function updateInvoiceRecord(
  invoiceId: string,
  payload: InvoiceUpdatePayload,
  csrfToken: string,
) {
  const response = await apiClient.put<BackendInvoiceRecord>(
    `/invoices/${invoiceId}`,
    payload,
    csrfToken,
  );

  return mapBackendInvoice(response);
}

export async function deleteInvoiceRecord(
  invoiceId: string,
  csrfToken: string,
) {
  return apiClient.delete<void>(`/invoices/${invoiceId}`, csrfToken);
}

function mapBackendInvoice(invoice: BackendInvoiceRecord): InvoiceRecordView {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: formatDate(invoice.invoiceDate),
    student: invoice.recipientName,
    studentId: invoice.studentId,
    category: invoice.categoryCode,
    invoiceReason: invoice.invoiceReason,
    packageType: invoice.packageType,
    totalAmount: invoice.totalAmount,
    invoiceStatus: mapInvoiceStatus(invoice.status),
    paymentLinkStatus: mapPaymentLinkStatus(invoice.paymentLinkStatus),
    paymentNumber: invoice.paymentNumber ?? undefined,
    paymentStatus: mapPaymentStatus(invoice.paymentStatus),
    createdBy: invoice.createdBy,
    createdDate: formatDate(invoice.createdDate),
    lastUpdatedBy: invoice.lastUpdatedBy,
    lastUpdatedDate: formatDate(invoice.updatedAt),
    wasCorrected: invoice.wasCorrected,
    correctedBy: invoice.wasCorrected ? invoice.lastUpdatedBy : undefined,
    correctionReason: invoice.correctionReason ?? undefined,
    notes: invoice.notes ?? undefined,
    issuedDate: invoice.issuedDate ? formatDate(invoice.issuedDate) : undefined,
    dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : undefined,
    vat: invoice.vatAmount,
    subtotal: invoice.subtotalAmount,
    activity: [
      {
        type: 'created',
        description: `Фактура ${invoice.invoiceNumber} е записана в PostgreSQL.`,
        timestamp: invoice.createdAt,
        user: invoice.createdBy,
      },
    ],
  };
}

function mapInvoiceStatus(
  status: BackendInvoiceRecord['status'],
): InvoiceRecordView['invoiceStatus'] {
  switch (status) {
    case 'DRAFT':
      return 'draft';
    case 'CANCELED':
      return 'canceled';
    case 'CORRECTED':
      return 'corrected';
    case 'OVERDUE':
      return 'overdue';
    default:
      return 'issued';
  }
}

function mapPaymentLinkStatus(
  status: BackendInvoiceRecord['paymentLinkStatus'],
): InvoiceRecordView['paymentLinkStatus'] {
  switch (status) {
    case 'NOT_LINKED':
      return 'not_linked';
    case 'PARTIAL':
      return 'partial';
    default:
      return 'linked';
  }
}

function mapPaymentStatus(
  status: BackendInvoiceRecord['paymentStatus'],
): InvoiceRecordView['paymentStatus'] | undefined {
  switch (status) {
    case 'PAID':
      return 'paid';
    case 'PARTIAL':
      return 'partial';
    case 'OVERDUE':
      return 'overdue';
    case 'PENDING':
      return 'pending';
    default:
      return undefined;
  }
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-');

  return `${day}.${month}.${year}`;
}
