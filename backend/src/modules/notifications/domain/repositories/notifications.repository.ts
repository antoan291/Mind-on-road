export type NotificationKind =
  | 'PRACTICE_INACTIVITY'
  | 'ARRIVAL_REMINDER'
  | 'CATEGORY_B_HOUR_MILESTONE'
  | 'PAYMENT_REMINDER'
  | 'PARENT_LESSON_REPORT'
  | 'INSTRUCTOR_DOCUMENT_EXPIRY';

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export type NotificationDeliveryStatus =
  | 'PENDING'
  | 'SENT'
  | 'FAILED'
  | 'RESOLVED';

export type NotificationChannel = 'SYSTEM' | 'VIBER' | 'SYSTEM_AND_VIBER';

export interface NotificationRecord {
  id: string;
  signalKey: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  deliveryStatus: NotificationDeliveryStatus;
  channel: NotificationChannel;
  title: string;
  message: string;
  audienceLabel: string;
  actionLabel: string | null;
  actionTarget: string | null;
  studentId: string | null;
  practicalLessonId: string | null;
  eventTime: Date;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationWriteInput {
  signalKey: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  deliveryStatus: NotificationDeliveryStatus;
  channel: NotificationChannel;
  title: string;
  message: string;
  audienceLabel: string;
  actionLabel?: string | null;
  actionTarget?: string | null;
  studentId?: string | null;
  practicalLessonId?: string | null;
  eventTime: Date;
  metadata?: Record<string, unknown> | null;
}

export interface NotificationsRepository {
  upsertManyForTenant(params: {
    tenantId: string;
    notifications: NotificationWriteInput[];
  }): Promise<void>;
  listByTenant(params: { tenantId: string }): Promise<NotificationRecord[]>;
}
