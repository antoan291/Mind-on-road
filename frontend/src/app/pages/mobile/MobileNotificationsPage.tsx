import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  MessageSquare,
  User,
} from 'lucide-react';
import { MobilePageHeader } from '../../components/mobile/MobilePageHeader';
import {
  fetchNotificationRecords,
  type NotificationRecordView,
} from '../../services/notificationsApi';

type MobileNotificationItem = {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  icon: typeof CheckCircle;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

export function MobileNotificationsPage() {
  const [notifications, setNotifications] = useState<MobileNotificationItem[]>(
    [],
  );

  useEffect(() => {
    let isMounted = true;

    fetchNotificationRecords()
      .then((records) => {
        if (!isMounted) {
          return;
        }

        setNotifications(buildBackendNotifications(records));
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setNotifications([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = useMemo(
    () =>
      notifications.filter((notification) => notification.unread).length,
    [notifications],
  );

  const handleMarkAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    );
  };

  const handleOpenNotification = (notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification,
      ),
    );
  };

  return (
    <div>
      <MobilePageHeader
        title="Известия"
        subtitle={`${unreadCount} нови`}
        actions={
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium"
            style={{ color: 'var(--primary-accent)' }}
          >
            Маркирай прочетени
          </button>
        }
      />

      <div className="p-4 space-y-2">
        {notifications.length === 0 ? (
          <div
            className="rounded-xl p-4 text-center text-sm"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
            }}
          >
            Няма известия за показване
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onOpen={() => handleOpenNotification(notification.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onOpen,
}: {
  notification: MobileNotificationItem;
  onOpen: () => void;
}) {
  const Icon = notification.icon;

  const iconColor = {
    success: 'var(--status-success)',
    warning: 'var(--status-warning)',
    error: 'var(--status-error)',
    info: 'var(--primary-accent)',
  }[notification.type];

  return (
    <button
      onClick={onOpen}
      className="w-full rounded-xl p-4 transition-all text-left"
      style={{
        background: notification.unread
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.02))'
          : 'var(--bg-card)',
        border: notification.unread
          ? '1px solid rgba(99, 102, 241, 0.15)'
          : '1px solid transparent',
      }}
    >
      <div className="flex gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: notification.unread ? 'var(--bg-panel)' : 'transparent',
          }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className="font-semibold text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              {notification.title}
            </h4>
            {notification.unread && (
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                style={{ background: 'var(--primary-accent)' }}
              />
            )}
          </div>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            {notification.message}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {notification.time}
          </p>
        </div>
      </div>
    </button>
  );
}

function buildBackendNotifications(
  records: NotificationRecordView[],
): MobileNotificationItem[] {
  return records.map((notification) => ({
    id: notification.id,
    type: notification.severity,
    icon: resolveNotificationIcon(notification),
    title: notification.title,
    message: notification.message,
    time: notification.eventTimeLabel,
    unread: notification.deliveryStatus === 'PENDING',
  }));
}

function resolveNotificationIcon(notification: NotificationRecordView) {
  switch (notification.kind) {
    case 'ARRIVAL_REMINDER':
      return Calendar;
    case 'PARENT_LESSON_REPORT':
      return notification.deliveryStatus === 'SENT' ? MessageSquare : User;
    case 'PRACTICE_INACTIVITY':
    case 'PAYMENT_REMINDER':
      return AlertCircle;
    default:
      return CheckCircle;
  }
}
