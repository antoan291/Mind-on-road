import { apiClient } from './apiClient';

export type NotificationRecordView = {
  id: string;
  kind:
    | 'PRACTICE_INACTIVITY'
    | 'ARRIVAL_REMINDER'
    | 'CATEGORY_B_HOUR_MILESTONE'
    | 'PAYMENT_REMINDER'
    | 'PARENT_LESSON_REPORT'
    | 'INSTRUCTOR_DOCUMENT_EXPIRY';
  severity: 'info' | 'success' | 'warning' | 'error';
  deliveryStatus: 'PENDING' | 'SENT' | 'FAILED' | 'RESOLVED';
  channelLabel: string;
  title: string;
  message: string;
  audienceLabel: string;
  actionTarget: string | null;
  eventTimeLabel: string;
  rawEventTime: string;
};

type BackendNotificationRecord = {
  id: string;
  kind: NotificationRecordView['kind'];
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  deliveryStatus: NotificationRecordView['deliveryStatus'];
  channel: 'SYSTEM' | 'VIBER' | 'SYSTEM_AND_VIBER';
  title: string;
  message: string;
  audienceLabel: string;
  actionTarget: string | null;
  eventTime: string;
};

export async function fetchNotificationRecords() {
  const response = await apiClient.get<{ items: BackendNotificationRecord[] }>(
    '/notifications',
  );

  return response.items.map((notification) =>
    mapBackendNotification(notification),
  );
}

function mapBackendNotification(
  notification: BackendNotificationRecord,
): NotificationRecordView {
  return {
    id: notification.id,
    kind: notification.kind,
    severity: notification.severity.toLowerCase() as NotificationRecordView['severity'],
    deliveryStatus: notification.deliveryStatus,
    channelLabel: mapNotificationChannel(notification.channel),
    title: notification.title,
    message: notification.message,
    audienceLabel: notification.audienceLabel,
    actionTarget: notification.actionTarget,
    eventTimeLabel: formatRelativeNotificationTime(notification.eventTime),
    rawEventTime: notification.eventTime,
  };
}

function mapNotificationChannel(
  channel: BackendNotificationRecord['channel'],
) {
  switch (channel) {
    case 'VIBER':
      return 'Viber';
    case 'SYSTEM_AND_VIBER':
      return 'Система + Viber';
    default:
      return 'Система';
  }
}

function formatRelativeNotificationTime(eventTime: string) {
  const parsedEventTime = new Date(eventTime);

  if (Number.isNaN(parsedEventTime.getTime())) {
    return eventTime.slice(0, 10);
  }

  const diffMs = Date.now() - parsedEventTime.getTime();
  const diffMinutes = Math.round(Math.abs(diffMs) / (60 * 1000));
  const isFuture = diffMs < 0;

  if (diffMinutes < 60) {
    return isFuture
      ? `След ${Math.max(diffMinutes, 1)} мин`
      : `Преди ${Math.max(diffMinutes, 1)} мин`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return isFuture
      ? `След ${Math.max(diffHours, 1)} ч`
      : `Преди ${Math.max(diffHours, 1)} ч`;
  }

  const diffDays = Math.round(diffHours / 24);

  return isFuture
    ? `След ${Math.max(diffDays, 1)} дни`
    : `Преди ${Math.max(diffDays, 1)} дни`;
}
