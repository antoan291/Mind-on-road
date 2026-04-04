import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  TrendingUp, Users, Calendar, Clock, 
  AlertCircle, CheckCircle, DollarSign, FileText,
  ChevronRight, Bell
} from 'lucide-react';
import {
  studentOperationalRecords,
  type StudentOperationalRecord,
} from '../../content/studentOperations';
import { fetchStudentOperations } from '../../services/studentsApi';

export function MobileDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentOperationalRecord[]>(studentOperationalRecords);
  const [sourceStatus, setSourceStatus] = useState<'loading' | 'backend' | 'fallback'>('loading');

  useEffect(() => {
    let isMounted = true;

    fetchStudentOperations()
      .then((records) => {
        if (!isMounted) return;
        setStudents(records);
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) return;
        setStudents(studentOperationalRecords);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const mainStudent =
    students[0] ??
    (sourceStatus === 'backend' ? null : studentOperationalRecords[0]);

  const stats = [
    { label: 'Активни курсисти', value: String(students.length), trend: mainStudent?.name ?? 'Няма курсист', icon: Users, color: 'var(--primary-accent)' },
    { label: 'Часове днес', value: mainStudent ? '1' : '0', trend: mainStudent?.instructor ?? 'Няма час', icon: Calendar, color: 'var(--ai-accent)' },
    { label: 'Приходи месец', value: '12,450 лв', trend: '+8%', icon: DollarSign, color: 'var(--status-success)' },
    { label: 'Нови заявки', value: '7', trend: 'Тази седмица', icon: Bell, color: 'var(--status-warning)' },
  ];

  const todayLessons = [
    ...(mainStudent
      ? [
          {
            id: String(mainStudent.id),
            time: '09:00',
            student: mainStudent.name,
            instructor: mainStudent.instructor,
            status: 'scheduled',
            statusLabel: 'Записан',
            location: 'Център',
          },
        ]
      : []),
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'Георги Петров има 3 часа подред без почивка', time: 'Преди 15 мин' },
    { id: 2, type: 'info', message: 'Теория B категория - начало след 30 минути', time: 'Днес, 14:00' },
  ];

  const quickActions = [
    { label: 'Нов курсист', icon: Users, action: () => navigate('/students/new') },
    { label: 'Запиши час', icon: Calendar, action: () => navigate('/schedule') },
    { label: 'Плащане', icon: DollarSign, action: () => navigate('/payments') },
    { label: 'Документи', icon: FileText, action: () => navigate('/documents') },
  ];

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="p-4 pb-3">
        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Добре дошли
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Вторник, 24 Март 2026
        </p>
      </div>

      {/* Stats Grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                {stat.label}
              </div>
              <div className="text-xs font-medium" style={{ color: stat.color }}>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
          Бързи действия
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
              style={{ background: 'var(--bg-card)' }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99, 102, 241, 0.1)' }}
              >
                <action.icon size={20} style={{ color: 'var(--primary-accent)' }} />
              </div>
              <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            Важни известия
          </h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl flex items-start gap-3"
                style={{ 
                  background: alert.type === 'warning' 
                    ? 'var(--status-warning-bg)' 
                    : 'var(--status-info-bg)' 
                }}
              >
                <AlertCircle 
                  size={18} 
                  style={{ 
                    color: alert.type === 'warning' 
                      ? 'var(--status-warning)' 
                      : 'var(--status-info)',
                    flexShrink: 0,
                    marginTop: '2px'
                  }} 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    {alert.message}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Lessons */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Часове днес
          </h2>
          <button
            onClick={() => navigate('/schedule')}
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: 'var(--primary-accent)' }}
          >
            Виж всички
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-2">
          {todayLessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => navigate(`/students/${lesson.id}`)}
              className="w-full p-4 rounded-xl text-left transition-all active:scale-98"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center" style={{ minWidth: '48px' }}>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
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
                    <StatusPill status={lesson.status} label={lesson.statusLabel} />
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>{lesson.instructor}</span>
                    <span>•</span>
                    <span>{lesson.location}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, label }: { status: string; label: string }) {
  const getColor = () => {
    switch (status) {
      case 'confirmed': return 'var(--primary-accent)';
      case 'in-progress': return 'var(--status-warning)';
      case 'scheduled': return 'var(--status-info)';
      case 'completed': return 'var(--status-success)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
      style={{
        background: `${getColor()}20`,
        color: getColor(),
      }}
    >
      {label}
    </span>
  );
}
