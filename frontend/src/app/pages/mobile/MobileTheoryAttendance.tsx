import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar, Clock, Users, CheckCircle, XCircle,
  User, ChevronRight, Plus, BookOpen, AlertCircle
} from 'lucide-react';

export function MobileTheoryAttendance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance'>('schedule');

  const upcomingClasses = [
    {
      id: 1,
      date: '24.03.2026',
      time: '18:00',
      duration: '2 часа',
      topic: 'Правила за движение в кръстовища',
      category: 'B',
      instructor: 'Георги Петров',
      enrolled: 12,
      capacity: 15,
      room: 'Зала 1',
      isToday: true,
    },
    {
      id: 2,
      date: '26.03.2026',
      time: '18:00',
      duration: '2 часа',
      topic: 'Пътни знаци и маркировка',
      category: 'B',
      instructor: 'Иван Димитров',
      enrolled: 14,
      capacity: 15,
      room: 'Зала 1',
    },
    {
      id: 3,
      date: '28.03.2026',
      time: '18:00',
      duration: '2 часа',
      topic: 'Техника на управление',
      category: 'B',
      instructor: 'Георги Петров',
      enrolled: 11,
      capacity: 15,
      room: 'Зала 1',
    },
  ];

  const recentClasses = [
    {
      id: 4,
      date: '21.03.2026',
      time: '18:00',
      topic: 'Основи на движението по пътищата',
      category: 'B',
      instructor: 'Георги Петров',
      present: 13,
      total: 14,
      attendanceRate: 93,
    },
    {
      id: 5,
      date: '19.03.2026',
      time: '18:00',
      topic: 'Правила за предимство',
      category: 'B',
      instructor: 'Иван Димитров',
      present: 12,
      total: 14,
      attendanceRate: 86,
    },
  ];

  const students = [
    {
      id: 1,
      name: 'Антоан Тест',
      category: 'B',
      attended: 18,
      total: 20,
      attendanceRate: 90,
      lastClass: '21.03.2026',
      status: 'good',
    },
    {
      id: 2,
      name: 'Антоан Тест',
      category: 'B',
      attended: 20,
      total: 20,
      attendanceRate: 100,
      lastClass: '21.03.2026',
      status: 'excellent',
    },
    {
      id: 3,
      name: 'Антоан Тест',
      category: 'B',
      attended: 15,
      total: 20,
      attendanceRate: 75,
      lastClass: '19.03.2026',
      status: 'warning',
    },
    {
      id: 4,
      name: 'Антоан Тест',
      category: 'B',
      attended: 12,
      total: 20,
      attendanceRate: 60,
      lastClass: '14.03.2026',
      status: 'critical',
    },
  ];

  const stats = [
    { label: 'Тази седмица', value: '3', color: 'var(--primary-accent)' },
    { label: 'Записани', value: '37', color: 'var(--ai-accent)' },
    { label: 'Ср. посещаемост', value: '89%', color: 'var(--status-success)' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="p-4 pb-0">
        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Теория
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          График и посещаемост
        </p>

        {/* Stats */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex-1 min-w-[100px] p-3 rounded-xl"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="text-2xl font-semibold mb-1" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('schedule')}
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === 'schedule' ? 'var(--primary-accent)' : 'var(--bg-card)',
              color: activeTab === 'schedule' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            График
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === 'attendance' ? 'var(--primary-accent)' : 'var(--bg-card)',
              color: activeTab === 'attendance' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            Посещаемост
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Upcoming */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Предстоящи занятия
                </h2>
                <button
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--primary-accent)' }}
                >
                  <Plus size={14} />
                  Ново
                </button>
              </div>
              <div className="space-y-2">
                {upcomingClasses.map((cls) => (
                  <UpcomingClassCard key={cls.id} cls={cls} />
                ))}
              </div>
            </div>

            {/* Recent */}
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Проведени занятия
              </h2>
              <div className="space-y-2">
                {recentClasses.map((cls) => (
                  <CompletedClassCard key={cls.id} cls={cls} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Курсисти ({students.length})
              </h2>
            </div>

            <div className="space-y-2">
              {students.map((student) => (
                <StudentAttendanceCard key={student.id} student={student} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UpcomingClassCard({ cls }: { cls: any }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: cls.isToday ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
        border: cls.isToday ? '1px solid rgba(99, 102, 241, 0.2)' : 'none',
      }}
    >
      {cls.isToday && (
        <div className="mb-3">
          <span
            className="text-xs px-2 py-1 rounded font-medium"
            style={{
              background: 'var(--primary-accent)',
              color: '#ffffff',
            }}
          >
            Днес
          </span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        {/* Time */}
        <div className="flex flex-col items-center" style={{ minWidth: '52px' }}>
          <div className="text-2xl font-semibold" style={{ color: 'var(--primary-accent)' }}>
            {cls.time.split(':')[0]}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {cls.time.split(':')[1]}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            {cls.topic}
          </div>

          <div className="flex flex-wrap gap-3 text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              {cls.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              {cls.duration}
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={12} />
              Категория {cls.category}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {cls.instructor} • {cls.room}
            </div>
            <div
              className="text-xs px-2 py-1 rounded font-medium"
              style={{
                background: cls.enrolled >= cls.capacity 
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(99, 102, 241, 0.15)',
                color: cls.enrolled >= cls.capacity 
                  ? 'var(--status-error)'
                  : 'var(--primary-accent)',
              }}
            >
              {cls.enrolled}/{cls.capacity}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletedClassCard({ cls }: { cls: any }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
            {cls.topic}
          </div>
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            {cls.instructor} • Категория {cls.category}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <Calendar size={12} />
            {cls.date}
            <span>•</span>
            <Clock size={12} />
            {cls.time}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--ghost-border)' }}>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Посещаемост
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {cls.present}/{cls.total}
          </div>
          <div
            className="text-xs px-2 py-1 rounded font-medium"
            style={{
              background: cls.attendanceRate >= 80 
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(251, 191, 36, 0.15)',
              color: cls.attendanceRate >= 80 
                ? 'var(--status-success)'
                : 'var(--status-warning)',
            }}
          >
            {cls.attendanceRate}%
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentAttendanceCard({ student }: { student: any }) {
  const navigate = useNavigate();
  const getStatusIcon = () => {
    if (student.status === 'excellent') return <CheckCircle size={16} style={{ color: 'var(--status-success)' }} />;
    if (student.status === 'good') return <CheckCircle size={16} style={{ color: 'var(--primary-accent)' }} />;
    if (student.status === 'warning') return <AlertCircle size={16} style={{ color: 'var(--status-warning)' }} />;
    return <XCircle size={16} style={{ color: 'var(--status-error)' }} />;
  };

  const getStatusColor = () => {
    if (student.status === 'excellent') return 'var(--status-success)';
    if (student.status === 'good') return 'var(--primary-accent)';
    if (student.status === 'warning') return 'var(--status-warning)';
    return 'var(--status-error)';
  };

  return (
    <button
      onClick={() => navigate(`/students/${student.id}`)}
      className="w-full p-4 rounded-xl text-left transition-all active:scale-98"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
          style={{
            background: `${getStatusColor()}20`,
            color: getStatusColor(),
          }}
        >
          {student.name.split(' ').map((n: string) => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="font-medium truncate mb-1" style={{ color: 'var(--text-primary)' }}>
                {student.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Последно: {student.lastClass}
              </div>
            </div>
            {getStatusIcon()}
          </div>

          {/* Progress */}
          <div className="mb-2">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-panel)' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${student.attendanceRate}%`,
                  background: getStatusColor(),
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span style={{ color: 'var(--text-secondary)' }}>
              {student.attended}/{student.total} часа
            </span>
            <span
              className="font-medium"
              style={{ color: getStatusColor() }}
            >
              {student.attendanceRate}%
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
