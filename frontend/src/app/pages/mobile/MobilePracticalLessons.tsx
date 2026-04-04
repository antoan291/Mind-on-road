import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  Calendar,
  Car,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  User,
} from 'lucide-react';
import {
  studentOperationalRecords,
  type StudentOperationalRecord,
} from '../../content/studentOperations';
import { fetchStudentOperations } from '../../services/studentsApi';

type MobilePracticalLesson = {
  id: string;
  date: string;
  time: string;
  duration: string;
  student: string;
  instructor: string;
  vehicle: string;
  type: string;
  location: string;
  status: 'scheduled' | 'in-progress' | 'confirmed' | 'completed' | 'canceled';
  statusLabel: string;
  isToday: boolean;
  hasConflict?: boolean;
};

const todayDate = new Date().toLocaleDateString('bg-BG', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function MobilePracticalLessons() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'today' | 'upcoming' | 'completed'
  >('all');
  const [lessons, setLessons] = useState<MobilePracticalLesson[]>(
    buildMobileLessons(studentOperationalRecords),
  );
  const [sourceLabel, setSourceLabel] = useState('Зареждане...');

  useEffect(() => {
    let isMounted = true;

    fetchStudentOperations()
      .then((students) => {
        if (!isMounted) {
          return;
        }

        setLessons(buildMobileLessons(students));
        setSourceLabel('PostgreSQL');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setLessons(buildMobileLessons(studentOperationalRecords));
        setSourceLabel('Fallback данни');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLessons = useMemo(
    () =>
      lessons.filter((lesson) => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'today') return lesson.isToday;
        if (filterStatus === 'upcoming') return lesson.status !== 'completed';
        return lesson.status === 'completed';
      }),
    [lessons, filterStatus],
  );

  const todayLessons = filteredLessons.filter((lesson) => lesson.isToday);
  const upcomingLessons = filteredLessons.filter(
    (lesson) => !lesson.isToday && lesson.status !== 'completed',
  );
  const completedLessons = filteredLessons.filter(
    (lesson) => lesson.status === 'completed',
  );

  const stats = [
    {
      label: 'Днес',
      value: String(lessons.filter((lesson) => lesson.isToday).length),
      color: 'var(--primary-accent)',
    },
    {
      label: 'Всички',
      value: String(lessons.length),
      color: 'var(--ai-accent)',
    },
    {
      label: 'Източник',
      value: sourceLabel,
      color: 'var(--status-warning)',
    },
  ];

  const filterOptions = [
    { value: 'all', label: 'Всички' },
    { value: 'today', label: 'Днес' },
    { value: 'upcoming', label: 'Предстоящи' },
    { value: 'completed', label: 'Завършени' },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-xl font-semibold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Практически часове
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filteredLessons.length}{' '}
              {filteredLessons.length === 1 ? 'час' : 'часа'}
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

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[100px] p-3 rounded-xl"
              style={{ background: 'var(--bg-card)' }}
            >
              <div
                className="text-lg font-semibold mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs whitespace-nowrap"
                style={{ color: 'var(--text-secondary)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className="px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap transition-all active:scale-95"
              style={{
                background:
                  filterStatus === option.value
                    ? 'var(--primary-accent)'
                    : 'var(--bg-card)',
                color:
                  filterStatus === option.value
                    ? '#ffffff'
                    : 'var(--text-secondary)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 space-y-6">
        {todayLessons.length > 0 && filterStatus !== 'completed' && (
          <div>
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Днес - {new Date().toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}
            </h2>
            <div className="space-y-2">
              {todayLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => navigate('/practical-lessons')}
                />
              ))}
            </div>
          </div>
        )}

        {upcomingLessons.length > 0 && filterStatus !== 'completed' && (
          <div>
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Предстоящи
            </h2>
            <div className="space-y-2">
              {upcomingLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => navigate('/practical-lessons')}
                />
              ))}
            </div>
          </div>
        )}

        {completedLessons.length > 0 && filterStatus === 'completed' && (
          <div>
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Завършени
            </h2>
            <div className="space-y-2">
              {completedLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => navigate('/practical-lessons')}
                />
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

function LessonCard({
  lesson,
  onClick,
}: {
  lesson: MobilePracticalLesson;
  onClick: () => void;
}) {
  const statusColor = {
    completed: 'var(--status-success)',
    'in-progress': 'var(--status-warning)',
    confirmed: 'var(--primary-accent)',
    scheduled: 'var(--status-info)',
    canceled: 'var(--status-error)',
  }[lesson.status];

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl text-left transition-all active:scale-98"
      style={{
        background: lesson.hasConflict
          ? 'var(--status-error-bg)'
          : 'var(--bg-card)',
        border: lesson.hasConflict
          ? '1px solid var(--status-error-border)'
          : 'none',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex flex-col items-center" style={{ minWidth: '52px' }}>
          <div className="text-2xl font-semibold" style={{ color: statusColor }}>
            {lesson.time.split(':')[0]}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {lesson.time.split(':')[1]}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div
              className="font-medium truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {lesson.student}
            </div>
            {lesson.hasConflict && (
              <AlertCircle
                size={16}
                style={{ color: 'var(--status-error)', flexShrink: 0 }}
              />
            )}
          </div>

          <div className="text-sm mb-2 truncate" style={{ color: 'var(--text-secondary)' }}>
            {lesson.type}
          </div>

          <div
            className="flex flex-wrap gap-2 text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <div className="flex items-center gap-1">
              <User size={12} />
              <span className="truncate">{lesson.instructor}</span>
            </div>
            <div className="flex items-center gap-1">
              <Car size={12} />
              <span className="truncate">{lesson.vehicle}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-3 pt-3 border-t"
        style={{ borderColor: 'var(--ghost-border)' }}
      >
        <div
          className="flex items-center gap-1 text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
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
              background: `${statusColor}20`,
              color: statusColor,
            }}
          >
            {lesson.statusLabel}
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
        </div>
      </div>
    </button>
  );
}

function buildMobileLessons(
  students: StudentOperationalRecord[],
): MobilePracticalLesson[] {
  return students.map((student, index) => {
    const status =
      student.examOutcome === 'passed'
        ? 'completed'
        : student.inactivityAlert
          ? 'scheduled'
          : 'confirmed';

    return {
      id: String(student.id),
      date: todayDate,
      time: index === 0 ? '09:00' : '11:00',
      duration: '90 мин',
      student: student.name,
      instructor: student.instructor,
      vehicle: 'Toyota Corolla · CA 1234 AB',
      type:
        student.trainingMode === 'licensed-manual-hours'
          ? 'Допълнителен практически час'
          : 'Практика по пакет',
      location: 'Автошкола Mind on Road',
      status,
      statusLabel:
        status === 'completed'
          ? 'Завършен'
          : status === 'scheduled'
            ? 'Записан'
            : 'Потвърден',
      isToday: index === 0,
      hasConflict: false,
    };
  });
}
