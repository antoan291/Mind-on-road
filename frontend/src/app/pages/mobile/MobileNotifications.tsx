import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell, CheckCircle, AlertCircle, Calendar, Clock,
  User, Car, DollarSign, FileText, X, Check
} from 'lucide-react';

export function MobileNotifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notifications = [
    {
      id: 1,
      type: 'lesson-reminder',
      title: 'Час след 30 минути',
      message: 'Петър Георгиев - Градско шофиране в 14:00',
      time: 'Преди 5 мин',
      read: false,
      icon: Calendar,
      color: 'var(--primary-accent)',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Получено плащане',
      message: 'Елена Димитрова внесе 500 лв за практически часове',
      time: 'Преди 15 мин',
      read: false,
      icon: DollarSign,
      color: 'var(--status-success)',
    },
    {
      id: 3,
      type: 'alert',
      title: 'Инструктор с плътен график',
      message: 'Георги Петров има 3 часа подред без почивка днес',
      time: 'Преди 30 мин',
      read: false,
      icon: AlertCircle,
      color: 'var(--status-warning)',
    },
    {
      id: 4,
      type: 'new-student',
      title: 'Нова заявка за записване',
      message: 'Иван Петков подаде заявка за категория B',
      time: 'Преди 1 час',
      read: false,
      icon: User,
      color: 'var(--ai-accent)',
    },
    {
      id: 5,
      type: 'theory',
      title: 'Теория започва скоро',
      message: 'Правила за движение в кръстовища - 18:00 в Зала 1',
      time: 'Преди 1 час',
      read: true,
      icon: Bell,
      color: 'var(--primary-accent)',
    },
    {
      id: 6,
      type: 'document',
      title: 'Качен документ',
      message: 'София Николова качи медицинско свидетелство',
      time: 'Преди 2 часа',
      read: true,
      icon: FileText,
      color: 'var(--status-info)',
    },
    {
      id: 7,
      type: 'lesson-completed',
      title: 'Час завършен',
      message: 'Мартин Иванов завърши час "Магистрала" с Георги Петров',
      time: 'Преди 3 часа',
      read: true,
      icon: CheckCircle,
      color: 'var(--status-success)',
    },
    {
      id: 8,
      type: 'vehicle',
      title: 'Технически преглед',
      message: 'Toyota Corolla - СА 1234 АВ изисква преглед след 7 дни',
      time: 'Преди 5 часа',
      read: true,
      icon: Car,
      color: 'var(--status-warning)',
    },
  ];

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    // Mark all as read logic
  };

  const handleMarkRead = (id: number) => {
    // Mark single as read logic
  };

  const handleDelete = (id: number) => {
    // Delete notification logic
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
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

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === 'all' ? 'var(--primary-accent)' : 'var(--bg-card)',
              color: filter === 'all' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            Всички ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === 'unread' ? 'var(--primary-accent)' : 'var(--bg-card)',
              color: filter === 'unread' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            Непрочетени ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
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
  notification: any;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-xl transition-all"
      style={{
        background: notification.read ? 'var(--bg-card)' : 'rgba(99, 102, 241, 0.05)',
        border: notification.read ? 'none' : '1px solid rgba(99, 102, 241, 0.1)',
      }}
    >
      <button
        onClick={() => setShowActions(!showActions)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${notification.color}15` }}
          >
            <notification.icon size={18} style={{ color: notification.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
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
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <Clock size={12} />
              {notification.time}
            </div>
          </div>
        </div>
      </button>

      {/* Actions */}
      {showActions && (
        <div
          className="flex border-t"
          style={{ borderColor: 'var(--ghost-border)' }}
        >
          {!notification.read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
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
