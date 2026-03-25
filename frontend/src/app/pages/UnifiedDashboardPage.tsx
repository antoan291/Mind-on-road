import {
  PageHeader, StatCard, Card, CardHeader, SectionHeader,
  Button, Badge, Alert, EmptyState
} from '../components/shared';
import {
  Plus, Calendar, Users, DollarSign, FileText,
  Clock, User, MapPin, TrendingUp, Download,
  CheckCircle, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function UnifiedDashboardPage() {
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Днешни часове',
      value: '18',
      trend: '3 активни сега',
      icon: <Calendar size={20} />,
      color: 'var(--primary-accent)',
    },
    {
      label: 'Активни курсисти',
      value: '127',
      trend: '+12 този месец',
      icon: <Users size={20} />,
      color: 'var(--ai-accent)',
    },
    {
      label: 'Приходи месец',
      value: '12,450 лв',
      trend: '+8% от миналия',
      icon: <DollarSign size={20} />,
      color: 'var(--status-success)',
    },
    {
      label: 'Изчакващи задачи',
      value: '7',
      trend: '3 спешни',
      icon: <FileText size={20} />,
      color: 'var(--status-warning)',
    },
  ];

  const todayLessons = [
    {
      id: 1,
      time: '09:00',
      student: 'Петър Георгиев',
      instructor: 'Георги Петров',
      type: 'Градско шофиране',
      status: 'in-progress',
      location: 'Център',
    },
    {
      id: 2,
      time: '10:30',
      student: 'Елена Димитрова',
      instructor: 'Иван Димитров',
      type: 'Паркиране',
      status: 'confirmed',
      location: 'Младост',
    },
    {
      id: 3,
      time: '14:00',
      student: 'Мартин Иванов',
      instructor: 'Георги Петров',
      type: 'Магистрала',
      status: 'scheduled',
      location: 'София - Перник',
    },
    {
      id: 4,
      time: '16:00',
      student: 'София Николова',
      instructor: 'Мария Петкова',
      type: 'Първи час',
      status: 'scheduled',
      location: 'Студентски град',
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Обади се на Петър Георгиев',
      description: 'Потвърди час за утре в 10:00',
      priority: 'high',
      dueTime: 'Днес, 15:00',
    },
    {
      id: 2,
      title: 'Провери документи на София Николова',
      description: 'Медицинско свидетелство',
      priority: 'medium',
      dueTime: 'Днес, 17:00',
    },
    {
      id: 3,
      title: 'Технически преглед - СА 1234 АВ',
      description: 'Toyota Corolla',
      priority: 'low',
      dueTime: 'Утре, 09:00',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'payment',
      title: 'Получено плащане',
      description: 'Елена Димитрова - 500 лв',
      time: 'Преди 15 мин',
      icon: <DollarSign size={16} />,
      color: 'var(--status-success)',
    },
    {
      id: 2,
      type: 'lesson',
      title: 'Завършен час',
      description: 'Мартин Иванов - Градско шофиране',
      time: 'Преди 1 час',
      icon: <CheckCircle size={16} />,
      color: 'var(--primary-accent)',
    },
    {
      id: 3,
      type: 'student',
      title: 'Нов курсист',
      description: 'Иван Петков - Категория B',
      time: 'Преди 2 часа',
      icon: <User size={16} />,
      color: 'var(--ai-accent)',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      'in-progress': { label: 'В процес', variant: 'warning' },
      'confirmed': { label: 'Потвърден', variant: 'primary' },
      'scheduled': { label: 'Записан', variant: 'info' },
    };
    return statusConfig[status] || { label: status, variant: 'neutral' };
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; variant: any }> = {
      high: { label: 'Спешно', variant: 'error' },
      medium: { label: 'Средно', variant: 'warning' },
      low: { label: 'Ниско', variant: 'info' },
    };
    return priorityConfig[priority] || { label: priority, variant: 'neutral' };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Административно табло"
        subtitle="Преглед на ключова информация и задачи за днес"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/schedule')}>
              Нов час
            </Button>
          </>
        }
      />

      {/* Alerts */}
      <div className="space-y-3">
        <Alert
          variant="warning"
          title="Инструктор с плътен график"
          message="Георги Петров има 3 часа подред без почивка днес след 14:00"
          action={{
            label: 'Виж графика',
            onClick: () => navigate('/schedule'),
          }}
        />
        <Alert
          variant="info"
          message="Теория B категория започва след 30 минути в Зала 1"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader
            title="Днешен график"
            subtitle="Вторник, 24 Март 2026"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/schedule')}
              >
                Виж всички
              </Button>
            }
          />

          <div className="space-y-3">
            {todayLessons.map((lesson) => {
              const statusBadge = getStatusBadge(lesson.status);
              return (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/practical-lessons/${lesson.id}`)}
                  className="w-full p-4 rounded-lg text-left transition-all hover:opacity-80"
                  style={{ background: 'var(--bg-panel)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center" style={{ minWidth: '48px' }}>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {lesson.time.split(':')[0]}
                      </div>
                      <div className="text-lg font-semibold" style={{ color: 'var(--primary-accent)' }}>
                        {lesson.time.split(':')[1]}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {lesson.student}
                        </div>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                      <div className="text-sm mb-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                        {lesson.type}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <User size={12} />
                        <span>{lesson.instructor}</span>
                        <span>•</span>
                        <MapPin size={12} />
                        <span>{lesson.location}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader
            title="Предстоящи задачи"
            subtitle={`${upcomingTasks.length} активни`}
          />

          <div className="space-y-3">
            {upcomingTasks.map((task) => {
              const priorityBadge = getPriorityBadge(task.priority);
              return (
                <div
                  key={task.id}
                  className="p-4 rounded-lg"
                  style={{ background: 'var(--bg-panel)' }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {task.title}
                    </div>
                    <Badge variant={priorityBadge.variant} size="sm">
                      {priorityBadge.label}
                    </Badge>
                  </div>
                  <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {task.description}
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    <Clock size={12} />
                    {task.dueTime}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader
          title="Последна активност"
          subtitle="Последни събития в системата"
        />

        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: 'var(--bg-panel)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${activity.color}15` }}
              >
                <div style={{ color: activity.color }}>
                  {activity.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {activity.title}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {activity.description}
                </div>
              </div>
              <div className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
