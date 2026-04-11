export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  paymentNumber: string;
  amount: number;
  paidAmount: number;
  method: string;
  status: string;
  paidAt: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentWriteInput {
  studentId: string;
  studentName: string;
  paymentNumber: string;
  amount: number;
  paidAmount: number;
  method: string;
  status: string;
  paidAt: Date;
  note: string | null;
}

export interface PaymentUpdateInput {
  studentId?: string;
  studentName?: string;
  paymentNumber?: string;
  amount?: number;
  paidAmount?: number;
  method?: string;
  status?: string;
  paidAt?: Date;
  note?: string | null;
}

export interface PaymentsRepository {
  listByTenant(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }): Promise<PaymentRecord[]>;
  createForTenant(params: {
    tenantId: string;
    payment: PaymentWriteInput;
  }): Promise<PaymentRecord | null>;
  updateByTenantAndId(params: {
    tenantId: string;
    paymentId: string;
    payment: PaymentUpdateInput;
  }): Promise<PaymentRecord | null>;
  deleteByTenantAndId(params: {
    tenantId: string;
    paymentId: string;
  }): Promise<boolean>;
}
import type { QueryReadAccessScope } from '../../../shared/query/read-access-scope';
