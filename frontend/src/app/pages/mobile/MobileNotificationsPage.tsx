import { MobilePageHeader } from '../../components/mobile/MobilePageHeader';
import { CheckCircle, User, Calendar, AlertCircle, Bell, MessageSquare } from 'lucide-react';

export function MobileNotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle,
      title: 'Успешен изпит',
      message: 'Петър Георгиев - Категория B',
      time: 'Преди 2 часа',
      unread: true,
    },
    {
      id: 2,
      type: 'info',
      icon: User,
      title: 'Нова регистрация',
      message: 'Мария Стоянова',
      time: 'Преди 3 часа',
      unread: true,
    },
    {
      id: 3,
      type: 'info',
      icon: Calendar,
      title: 'Записан час',
      message: 'Иван Петков - Утре 15:00',
      time: 'Преди 5 часа',
      unread: true,
    },
    {
      id: 4,
      type: 'warning',
      icon: AlertCircle,
      title: 'Отменен час',
      message: 'Георги Димитров - Днес 16:00',
      time: 'Преди 1 ден',
      unread: false,
    },
    {
      id: 5,
      type: 'info',
      icon: MessageSquare,
      title: 'Ново съобщение',
      message: 'Елена Димитрова: Благодаря за часа!',
      time: 'Преди 1 ден',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div>
      <MobilePageHeader 
        title="Известия" 
        subtitle={`${unreadCount} нови`}
        actions={
          <button
            className="text-sm font-medium"
            style={{ color: 'var(--primary-accent)' }}
          >
            Маркирай прочетени
          </button>
        }
      />

      <div className="p-4 space-y-2">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}

function NotificationCard({ notification }: { notification: any }) {
  const Icon = notification.icon;
  
  const iconColor = {
    success: 'var(--status-success)',
    warning: 'var(--status-warning)',
    error: 'var(--status-error)',
    info: 'var(--primary-accent)',
  }[notification.type];

  return (
    <button
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
            <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
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
