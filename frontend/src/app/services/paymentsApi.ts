import { apiClient } from './apiClient';

export type PaymentRecordView = {
  id: string | number;
  paymentNumber: string;
  date: string;
  student: string;
  studentId: string | number;
  category: string;
  packageType: string;
  dueAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'partial' | 'overdue' | 'pending' | 'canceled';
  invoiceStatus: 'issued' | 'pending' | 'none';
  invoiceNumber?: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
  wasCorrected: boolean;
  correctedBy?: string;
  instructor?: string;
  theoryGroup?: string;
  paymentReason?: string;
  notes?: string;
  createdBy?: string;
  createdDate?: string;
  activity?: Array<{
    type:
      | 'created'
      | 'edited'
      | 'invoice_linked'
      | 'reminder_sent'
      | 'status_changed';
    description: string;
    timestamp: string;
    user: string;
  }>;
};

type BackendPaymentRecord = {
  id: string;
  studentId: string;
  studentName: string;
  paymentNumber: string;
  amount: number;
  paidAmount: number;
  method: string;
  status: string;
  paidAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentCreatePayload = {
  studentId: string;
  paymentNumber?: string;
  amount: number;
  paidAmount?: number;
  method: string;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING' | 'CANCELED';
  paidAt: string;
  note?: string | null;
};

export type PaymentUpdatePayload = {
  studentId?: string;
  paymentNumber?: string;
  amount?: number;
  paidAmount?: number;
  method?: string;
  status?: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING' | 'CANCELED';
  paidAt?: string;
  note?: string | null;
};

export async function fetchPaymentRecords() {
  const response = await apiClient.get<{ items: BackendPaymentRecord[] }>(
    '/payments',
  );

  return response.items.map((payment) => mapBackendPayment(payment));
}

export async function createPaymentRecord(
  payload: PaymentCreatePayload,
  csrfToken: string,
) {
  const response = await apiClient.post<BackendPaymentRecord>(
    '/payments',
    payload,
    csrfToken,
  );

  return mapBackendPayment(response);
}

export async function updatePaymentRecord(
  paymentId: string,
  payload: PaymentUpdatePayload,
  csrfToken: string,
) {
  const response = await apiClient.put<BackendPaymentRecord>(
    `/payments/${paymentId}`,
    payload,
    csrfToken,
  );

  return mapBackendPayment(response);
}

export async function deletePaymentRecord(
  paymentId: string,
  csrfToken: string,
) {
  return apiClient.delete<void>(`/payments/${paymentId}`, csrfToken);
}

function mapBackendPayment(payment: BackendPaymentRecord): PaymentRecordView {
  const paymentStatus = mapPaymentStatus(payment.status);
  const paidAmount =
    paymentStatus === 'paid' || paymentStatus === 'partial'
      ? payment.paidAmount
      : 0;
  const remainingAmount =
    paymentStatus === 'paid'
      ? 0
      : Math.max(payment.amount - paidAmount, 0);

  return {
    id: payment.id,
    paymentNumber: payment.paymentNumber,
    date: payment.paidAt,
    student: payment.studentName,
    studentId: payment.studentId,
    category: 'B',
    packageType: payment.note ?? 'Такса обучение',
    dueAmount: payment.amount,
    paidAmount,
    remainingAmount,
    paymentMethod: payment.method,
    paymentStatus,
    invoiceStatus: 'issued',
    invoiceNumber: `INV-${payment.paymentNumber}`,
    lastUpdatedBy: 'Система',
    lastUpdatedDate: payment.updatedAt.slice(0, 10),
    wasCorrected: false,
    paymentReason: payment.note ?? 'Такса обучение',
    notes: payment.note ?? '',
    createdBy: 'Система',
    createdDate: payment.createdAt.slice(0, 10),
    activity: [
      {
        type: 'created',
        description: `Плащането ${payment.paymentNumber} е записано в PostgreSQL.`,
        timestamp: payment.createdAt,
        user: 'Система',
      },
    ],
  };
}

function mapPaymentStatus(
  status: string,
): PaymentRecordView['paymentStatus'] {
  switch (status) {
    case 'PAID':
      return 'paid';
    case 'PARTIAL':
      return 'partial';
    case 'OVERDUE':
      return 'overdue';
    case 'CANCELED':
      return 'canceled';
    default:
      return 'pending';
  }
}
