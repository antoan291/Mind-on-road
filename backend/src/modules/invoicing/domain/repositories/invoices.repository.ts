import type {
  InvoiceLifecycleStatus,
  InvoicePaymentLinkStatus
} from '@prisma/client';

export interface InvoiceRecord {
  id: string;
  studentId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  recipientName: string;
  categoryCode: string;
  invoiceReason: string;
  packageType: string;
  totalAmount: number;
  currency: string;
  status: InvoiceLifecycleStatus;
  paymentLinkStatus: InvoicePaymentLinkStatus;
  paymentNumber: string | null;
  paymentStatus: string | null;
  createdBy: string;
  createdDate: Date;
  lastUpdatedBy: string;
  notes: string | null;
  issuedDate: Date | null;
  dueDate: Date | null;
  vatAmount: number;
  subtotalAmount: number;
  wasCorrected: boolean;
  correctionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceCreateInput {
  studentId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  recipientName: string;
  categoryCode: string;
  invoiceReason: string;
  packageType: string;
  totalAmount: number;
  currency: string;
  status: InvoiceLifecycleStatus;
  paymentLinkStatus: InvoicePaymentLinkStatus;
  paymentNumber: string | null;
  paymentStatus: string | null;
  createdBy: string;
  createdDate: Date;
  lastUpdatedBy: string;
  notes: string | null;
  issuedDate: Date | null;
  dueDate: Date | null;
  vatAmount: number;
  subtotalAmount: number;
  wasCorrected: boolean;
  correctionReason: string | null;
}

export interface InvoiceUpdateInput {
  invoiceDate?: Date;
  recipientName?: string;
  categoryCode?: string;
  invoiceReason?: string;
  packageType?: string;
  totalAmount?: number;
  status?: InvoiceLifecycleStatus;
  paymentLinkStatus?: InvoicePaymentLinkStatus;
  paymentNumber?: string | null;
  paymentStatus?: string | null;
  lastUpdatedBy?: string;
  notes?: string | null;
  issuedDate?: Date | null;
  dueDate?: Date | null;
  vatAmount?: number;
  subtotalAmount?: number;
  wasCorrected?: boolean;
  correctionReason?: string | null;
}

export interface InvoicesRepository {
  listByTenant(params: { tenantId: string }): Promise<InvoiceRecord[]>;
  createForTenant(params: {
    tenantId: string;
    invoice: InvoiceCreateInput;
  }): Promise<InvoiceRecord | null>;
  updateByTenantAndId(params: {
    tenantId: string;
    invoiceId: string;
    invoice: InvoiceUpdateInput;
  }): Promise<InvoiceRecord | null>;
  deleteByTenantAndId(params: {
    tenantId: string;
    invoiceId: string;
  }): Promise<boolean>;
}
