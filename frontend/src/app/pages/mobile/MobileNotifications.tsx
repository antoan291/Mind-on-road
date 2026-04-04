import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  User,
  X,
} from 'lucide-react';
import {
  fetchNotificationRecords,
  type NotificationRecordView,
} from '../../services/notificationsApi';

type MobileOperationalNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: typeof Bell;
  color: string;
};

export function MobileNotifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<
    MobileOperationalNotification[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    fetchNotificationRecords()
      .then((records) => {
        if (!isMounted) {
          return;
        }

        setNotifications(buildBackendMobileNotifications(records));
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

  const filteredNotifications = useMemo(
    () =>
      filter === 'unread'
        ? notifications.filter((notification) => !notification.read)
        : notifications,
    [notifications, filter],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const handleMarkAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  };

  const handleMarkRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-xl font-semibold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Известия
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {unreadCount} {unreadCount === 1 ? 'непрочетено' : 'непрочетени'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-medium"
              style={{ color: 'var(--primary-accent)' }}
            >
              Маркирай всички
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all"
            style={{
              background:
                filter === 'all' ? 'var(--primary-accent)' : 'var(--bg-card)',
              color: filter === 'all' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            Всички ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all"
            style={{
              background:
                filter === 'unread' ? 'var(--primary-accent)' : 'var(--bg-card)',
              color: filter === 'unread' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            Непрочетени ({unreadCount})
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--bg-card)' }}
            >
              <Bell size={24} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Няма известия за показване
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={() => handleMarkRead(notification.id)}
              onDelete={() => handleDelete(notification.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: MobileOperationalNotification;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const Icon = notification.icon;

  return (
    <div
      className="relative overflow-hidden rounded-xl transition-all"
      style={{
        background: notification.read
          ? 'var(--bg-card)'
          : 'rgba(99, 102, 241, 0.05)',
        border: notification.read
          ? 'none'
          : '1px solid rgba(99, 102, 241, 0.1)',
      }}
    >
      <button
        onClick={() => setShowActions((current) => !current)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${notification.color}15` }}
          >
            <Icon size={18} style={{ color: notification.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {notification.title}
              </div>
              {!notification.read && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: 'var(--primary-accent)' }}
                />
              )}
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              {notification.message}
            </p>
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Clock size={12} />
              {notification.time}
            </div>
          </div>
        </div>
      </button>

      {showActions && (
        <div className="flex border-t" style={{ borderColor: 'var(--ghost-border)' }}>
          {!notification.read && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onMarkRead();
                setShowActions(false);
              }}
              className="flex-1 h-11 flex items-center justify-center gap-2 text-sm font-medium transition-all active:bg-opacity-50"
              style={{ color: 'var(--primary-accent)' }}
            >
              <Check size={16} />
              Маркирай
            </button>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
              setShowActions(false);
            }}
            className="flex-1 h-11 flex items-center justify-center gap-2 text-sm font-medium transition-all active:bg-opacity-50"
            style={{
              color: 'var(--status-error)',
              borderLeft: '1px solid var(--ghost-border)',
            }}
          >
            <X size={16} />
            Изтрий
          </button>
        </div>
      )}
    </div>
  );
}

function buildBackendMobileNotifications(
  records: NotificationRecordView[],
): MobileOperationalNotification[] {
  return records.map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time: notification.eventTimeLabel,
    read: notification.deliveryStatus !== 'PENDING',
    icon: resolveNotificationIcon(notification),
    color: resolveNotificationColor(notification.severity),
  }));
}

function resolveNotificationIcon(notification: NotificationRecordView) {
  switch (notification.kind) {
    case 'PAYMENT_REMINDER':
      return DollarSign;
    case 'PARENT_LESSON_REPORT':
      return User;
    case 'ARRIVAL_REMINDER':
      return Clock;
    case 'PRACTICE_INACTIVITY':
      return AlertCircle;
    case 'CATEGORY_B_HOUR_MILESTONE':
      return FileText;
    default:
      return CheckCircle;
  }
}

function resolveNotificationColor(
  severity: NotificationRecordView['severity'],
) {
  switch (severity) {
    case 'error':
      return 'var(--status-error)';
    case 'warning':
      return 'var(--status-warning)';
    case 'success':
      return 'var(--status-success)';
    default:
      return 'var(--primary-accent)';
  }
}
