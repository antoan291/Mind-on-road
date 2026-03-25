import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar, Clock, User, Car, MapPin, Plus,
  Filter, Search, ChevronRight, AlertCircle
} from 'lucide-react';

export function MobilePracticalLessons() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchOpen, setSearchOpen] = useState(false);

  const lessons = [
    {
      id: 1,
      date: '24.03.2026',
      time: '09:00',
      duration: '90 мин',
      student: 'Петър Георгиев',
      instructor: 'Георги Петров',
      vehicle: 'Toyota Corolla - СА 1234 АВ',
      type: 'Градско шофиране',
      location: 'Център',
      status: 'in-progress',
      statusLabel: 'В процес',
      isToday: true,
    },
    {
      id: 2,
      date: '24.03.2026',
      time: '10:30',
      duration: '90 мин',
      student: 'Елена Димитрова',
      instructor: 'Иван Димитров',
      vehicle: 'Skoda Octavia - СА 5678 ВС',
      type: 'Паркиране',
      location: 'Младост',
      status: 'scheduled',
      statusLabel: 'Записан',
      isToday: true,
    },
    {
      id: 3,
      date: '24.03.2026',
      time: '14:00',
      duration: '90 мин',
      student: 'Мартин Иванов',
      instructor: 'Георги Петров',
      vehicle: 'Toyota Corolla - СА 1234 АВ',
      type: 'Магистрала',
      location: 'София - Перник',
      status: 'confirmed',
      statusLabel: 'Потвърден',
      isToday: true,
      hasConflict: true,
    },
    {
      id: 4,
      date: '25.03.2026',
      time: '09:00',
      duration: '90 мин',
      student: 'София Николова',
      instructor: 'Мария Петкова',
      vehicle: 'Toyota Yaris - СА 3456 ЖЗ',
      type: 'Първи час',
      location: 'Студентски град',
      status: 'confirmed',
      statusLabel: 'Потвърден',
    },
    {
      id: 5,
      date: '25.03.2026',
      time: '11:00',
      duration: '120 мин',
      student: 'Иван Колев',
      instructor: 'Стоян Василев',
      vehicle: 'Mercedes Actros - СА 9012 ЕД',
      type: 'Практика със камион',
      location: 'Индустриална зона',
      status: 'scheduled',
      statusLabel: 'Записан',
    },
    {
      id: 6,
      date: '22.03.2026',
      time: '14:00',
      duration: '90 мин',
      student: 'Петър Георгиев',
      instructor: 'Георги Петров',
      vehicle: 'Toyota Corolla - СА 1234 АВ',
      type: 'Градско шофиране',
      location: 'Център',
      status: 'completed',
      statusLabel: 'Завършен',
    },
  ];

  const stats = [
    { label: 'Днес', value: '8', color: 'var(--primary-accent)' },
    { label: 'Тази седмица', value: '34', color: 'var(--ai-accent)' },
    { label: 'В процес', value: '2', color: 'var(--status-warning)' },
  ];

  const filterOptions = [
    { value: 'all', label: 'Всички' },
    { value: 'today', label: 'Днес' },
    { value: 'upcoming', label: 'Предстоящи' },
    { value: 'completed', label: 'Завършени' },
  ];

  const filteredLessons = lessons.filter(lesson => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'today') return lesson.isToday;
    if (filterStatus === 'upcoming') return lesson.status !== 'completed';
    if (filterStatus === 'completed') return lesson.status === 'completed';
    return true;
  });

  const todayLessons = filteredLessons.filter(l => l.isToday);
  const upcomingLessons = filteredLessons.filter(l => !l.isToday && l.status !== 'completed');
  const completedLessons = filteredLessons.filter(l => l.status === 'completed');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Практически часове
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filteredLessons.length} {filteredLessons.length === 1 ? 'час' : 'часа'}
            </p>
          </div>
          <button
            onClick={() => navigate('/schedule')}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'var(--primary-accent)',
              color: '#ffffff',
            }}
          >
            <Plus size={20} />
          </button>
        </div>

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

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value as any)}
              className="px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap transition-all active:scale-95"
              style={{
                background: filterStatus === option.value ? 'var(--primary-accent)' : 'var(--bg-card)',
                color: filterStatus === option.value ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons List */}
      <div className="px-4 pb-4 space-y-6">
        {/* Today */}
        {todayLessons.length > 0 && filterStatus !== 'completed' && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Днес - {new Date().toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}
            </h2>
            <div className="space-y-2">
              {todayLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} onClick={() => navigate(`/practical-lessons/${lesson.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcomingLessons.length > 0 && filterStatus !== 'completed' && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Предстоящи
            </h2>
            <div className="space-y-2">
              {upcomingLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} onClick={() => navigate(`/practical-lessons/${lesson.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedLessons.length > 0 && filterStatus === 'completed' && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Завършени
            </h2>
            <div className="space-y-2">
              {completedLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} onClick={() => navigate(`/practical-lessons/${lesson.id}`)} />
              ))}
            </div>
          </div>
        )}

        {filteredLessons.length === 0 && (
          <div className="py-12 text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--bg-card)' }}
            >
              <Calendar size={24} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Няма часове за показване
            </p>
            <button
              onClick={() => navigate('/schedule')}
              className="text-sm font-medium"
              style={{ color: 'var(--primary-accent)' }}
            >
              Запиши нов час
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LessonCard({ lesson, onClick }: { lesson: any; onClick: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--status-success)';
      case 'in-progress': return 'var(--status-warning)';
      case 'confirmed': return 'var(--primary-accent)';
      case 'scheduled': return 'var(--status-info)';
      case 'canceled': return 'var(--status-error)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl text-left transition-all active:scale-98"
      style={{
        background: lesson.hasConflict ? 'var(--status-error-bg)' : 'var(--bg-card)',
        border: lesson.hasConflict ? '1px solid var(--status-error-border)' : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Time */}
        <div className="flex flex-col items-center" style={{ minWidth: '52px' }}>
          <div className="text-2xl font-semibold" style={{ color: getStatusColor(lesson.status) }}>
            {lesson.time.split(':')[0]}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {lesson.time.split(':')[1]}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {lesson.student}
            </div>
            {lesson.hasConflict && (
              <AlertCircle size={16} style={{ color: 'var(--status-error)', flexShrink: 0 }} />
            )}
          </div>

          <div className="text-sm mb-2 truncate" style={{ color: 'var(--text-secondary)' }}>
            {lesson.type}
          </div>

          <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <div className="flex items-center gap-1">
              <User size={12} />
              <span className="truncate">{lesson.instructor}</span>
            </div>
            <div className="flex items-center gap-1">
              <Car size={12} />
              <span className="truncate">{lesson.vehicle.split(' - ')[1]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--ghost-border)' }}>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <MapPin size={12} />
          <span className="truncate">{lesson.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {lesson.duration}
          </span>
          <div
            className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
            style={{
              background: `${getStatusColor(lesson.status)}20`,
              color: getStatusColor(lesson.status),
            }}
          >
            {lesson.statusLabel}
          </div>
        </div>
      </div>

      {lesson.hasConflict && (
        <div className="mt-3 pt-3 border-t flex items-start gap-2" style={{ borderColor: 'var(--status-error-border)' }}>
          <AlertCircle size={14} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '1px' }} />
          <span className="text-xs" style={{ color: 'var(--status-error)' }}>
            Конфликт с друг час на инструктора
          </span>
        </div>
      )}
    </button>
  );
}
