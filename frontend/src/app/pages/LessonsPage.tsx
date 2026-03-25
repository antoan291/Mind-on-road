import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../components/ui-system/PageHeader';
import { FilterBar } from '../components/ui-system/FilterBar';
import { DataTable } from '../components/ui-system/DataTable';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import { Button } from '../components/ui-system/Button';
import { 
  Plus, Download, X, Calendar, List, User, 
  Clock, MapPin, Car, Star, AlertCircle, CheckCircle,
  XCircle, Timer, Mail, DollarSign, MessageSquare
} from 'lucide-react';

type LessonStatus = 'upcoming' | 'active' | 'completed' | 'late' | 'no-show' | 'canceled';

type Lesson = {
  id: number;
  date: string;
  time: string;
  student: string;
  studentId: number;
  instructor: string;
  instructorId: number;
  category: string;
  type: string;
  vehicle: string;
  location: string;
  duration: number;
  status: LessonStatus;
  statusLabel: string;
  isPaid: boolean;
  rating?: number;
  notes?: string;
  lateMinutes?: number;
  cancelReason?: string;
};

export function LessonsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // Filter states
  const [filterInstructor, setFilterInstructor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  // Mock data
  const lessons: Lesson[] = [
    {
      id: 1,
      date: '24.03.2024',
      time: '09:00',
      student: 'Петър Георгиев',
      studentId: 1,
      instructor: 'Георги Петров',
      instructorId: 1,
      category: 'B',
      type: 'Градско шофиране',
      vehicle: 'Toyota Corolla - СА 1234 АВ',
      location: 'Център - Младост',
      duration: 90,
      status: 'active',
      statusLabel: 'В процес',
      isPaid: true,
    },
    {
      id: 2,
      date: '24.03.2024',
      time: '10:30',
      student: 'Елена Димитрова',
      studentId: 2,
      instructor: 'Иван Димитров',
      instructorId: 2,
      category: 'B',
      type: 'Паркиране',
      vehicle: 'Skoda Octavia - СА 5678 ВС',
      location: 'Южна зона',
      duration: 90,
      status: 'upcoming',
      statusLabel: 'Предстоящ',
      isPaid: true,
    },
    {
      id: 3,
      date: '24.03.2024',
      time: '12:00',
      student: 'Мартин Иванов',
      studentId: 3,
      instructor: 'Георги Петров',
      instructorId: 1,
      category: 'A',
      type: 'Магистрала',
      vehicle: 'Honda CBR 500',
      location: 'София - Перник',
      duration: 90,
      status: 'upcoming',
      statusLabel: 'Предстоящ',
      isPaid: false,
    },
    {
      id: 4,
      date: '23.03.2024',
      time: '14:00',
      student: 'София Николова',
      studentId: 4,
      instructor: 'Иван Димитров',
      instructorId: 2,
      category: 'B',
      type: 'Градско шофиране',
      vehicle: 'Skoda Octavia - СА 5678 ВС',
      location: 'Северна зона',
      duration: 90,
      status: 'completed',
      statusLabel: 'Завършен',
      isPaid: true,
      rating: 5,
      notes: 'Отлично управление, готов за по-сложни маневри',
    },
    {
      id: 5,
      date: '23.03.2024',
      time: '11:00',
      student: 'Георги Тодоров',
      studentId: 5,
      instructor: 'Стоян Василев',
      instructorId: 3,
      category: 'C',
      type: 'Практика със камион',
      vehicle: 'Mercedes Actros - СА 9012 ЕД',
      location: 'Индустриална зона',
      duration: 120,
      status: 'late',
      statusLabel: 'Закъснение',
      isPaid: true,
      rating: 3,
      lateMinutes: 15,
      notes: 'Курсистът закъсня 15 минути',
    },
    {
      id: 6,
      date: '22.03.2024',
      time: '16:00',
      student: 'Ана Петкова',
      studentId: 6,
      instructor: 'Мария Петкова',
      instructorId: 4,
      category: 'B',
      type: 'Начално обучение',
      vehicle: 'Toyota Yaris - СА 3456 ЖЗ',
      location: 'Западна зона',
      duration: 90,
      status: 'no-show',
      statusLabel: 'Не се яви',
      isPaid: false,
      notes: 'Курсистът не се яви без предизвестие',
    },
    {
      id: 7,
      date: '22.03.2024',
      time: '09:00',
      student: 'Димитър Стоянов',
      studentId: 7,
      instructor: 'Георги Петров',
      instructorId: 1,
      category: 'B',
      type: 'Паркиране',
      vehicle: 'Toyota Corolla - СА 1234 АВ',
      location: 'Павел Баня',
      duration: 90,
      status: 'canceled',
      statusLabel: 'Отменен',
      isPaid: true,
      cancelReason: 'Болен курсист',
    },
  ];

  // Calculate stats
  const todayLessons = lessons.filter(l => l.date === '24.03.2024').length;
  const completedToday = lessons.filter(l => l.date === '24.03.2024' && l.status === 'completed').length;
  const unpaidLessons = lessons.filter(l => !l.isPaid && l.status !== 'canceled').length;
  const noShowCount = lessons.filter(l => l.status === 'no-show').length;

  const activeFiltersCount = [
    filterInstructor !== 'all',
    filterStatus !== 'all',
    filterDate !== 'all',
  ].filter(Boolean).length;

  const getStatusColor = (status: LessonStatus): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
      case 'late':
        return 'warning';
      case 'no-show':
      case 'canceled':
        return 'error';
      default:
        return 'info';
    }
  };

  const columns = [
    {
      key: 'date',
      label: 'Дата и час',
      render: (value: string, row: Lesson) => (
        <div>
          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {value}
          </div>
          <div className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            <Clock size={12} />
            {row.time} • {row.duration} мин
          </div>
        </div>
      ),
    },
    {
      key: 'student',
      label: 'Курсист',
      render: (value: string, row: Lesson) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
            style={{
              background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            }}
          >
            {value.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {value}
            </div>
            <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              Кат. {row.category}
              {!row.isPaid && row.status !== 'canceled' && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--status-error)' }}>
                    <DollarSign size={10} />
                    Неплатен
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Тип',
      render: (value: string, row: Lesson) => (
        <div>
          <div style={{ color: 'var(--text-primary)' }}>{value}</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {row.vehicle}
          </div>
        </div>
      ),
    },
    {
      key: 'instructor',
      label: 'Инструктор',
      render: (value: string, row: Lesson) => (
        <div>
          <div style={{ color: 'var(--text-primary)' }}>{value}</div>
          <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
            <MapPin size={12} />
            {row.location}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (_: string, row: Lesson) => (
        <div className="space-y-1">
          <StatusBadge status={getStatusColor(row.status)} size="small">
            {row.statusLabel}
          </StatusBadge>
          {row.rating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < row.rating! ? 'var(--status-warning)' : 'none'}
                  style={{ color: i < row.rating! ? 'var(--status-warning)' : 'var(--text-dim)' }}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (_: any, row: Lesson) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === 'upcoming' && (
            <>
              <QuickActionButton
                icon={<CheckCircle size={16} />}
                tooltip="Завърши"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction(row.id, 'complete');
                }}
              />
              <QuickActionButton
                icon={<Timer size={16} />}
                tooltip="Закъснение"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction(row.id, 'late');
                }}
              />
              <QuickActionButton
                icon={<XCircle size={16} />}
                tooltip="Не се яви"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction(row.id, 'no-show');
                }}
              />
            </>
          )}
          {row.status === 'completed' && !row.rating && (
            <QuickActionButton
              icon={<Star size={16} />}
              tooltip="Добави оценка"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLesson(row);
              }}
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/students/${row.studentId}`);
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
            style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
            title="Профил"
          >
            <User size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleQuickAction = (lessonId: number, action: 'complete' | 'late' | 'no-show') => {
    console.log(`Quick action: ${action} for lesson ${lessonId}`);
    // In real app, update lesson status
  };

  return (
    <div>
      <PageHeader
        title="Практически часове"
        description="Управление на практически часове и график"
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Практика' },
        ]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />}>
              Нов час
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="p-6 lg:p-8 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<Calendar size={20} style={{ color: 'var(--primary-accent)' }} />}
            label="Днешни часове"
            value={todayLessons.toString()}
            subtitle={`${completedToday} завършени`}
          />
          <StatCard
            icon={<CheckCircle size={20} style={{ color: 'var(--status-success)' }} />}
            label="Завършени днес"
            value={completedToday.toString()}
            subtitle="От общо днешни"
          />
          <StatCard
            icon={<DollarSign size={20} style={{ color: 'var(--status-warning)' }} />}
            label="Неплатени часове"
            value={unpaidLessons.toString()}
            subtitle="Автоматично известие до родители"
            alert={unpaidLessons > 0}
          />
          <StatCard
            icon={<AlertCircle size={20} style={{ color: 'var(--status-error)' }} />}
            label="Неявявания"
            value={noShowCount.toString()}
            subtitle="Последните 7 дни"
            alert={noShowCount > 0}
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setViewMode('list')}
            className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
            style={{
              background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <List size={18} />
            Списък
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
            style={{
              background: viewMode === 'calendar' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'calendar' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Calendar size={18} />
            Календар
          </button>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Търсене по курсист, инструктор или тип час..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={true}
        activeFiltersCount={activeFiltersCount}
        onFilterClick={() => setShowFilters(!showFilters)}
      />

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-6 lg:px-8 pt-6">
          <div 
            className="p-4 rounded-xl"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Инструктор
                </label>
                <select
                  value={filterInstructor}
                  onChange={(e) => setFilterInstructor(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">Всички инструктори</option>
                  <option value="1">Георги Петров</option>
                  <option value="2">Иван Димитров</option>
                  <option value="3">Стоян Василев</option>
                  <option value="4">Мария Петкова</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Статус
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">Всички статуси</option>
                  <option value="upcoming">Предстоящи</option>
                  <option value="active">В процес</option>
                  <option value="completed">Завършени</option>
                  <option value="late">Закъснение</option>
                  <option value="no-show">Не се яви</option>
                  <option value="canceled">Отменени</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Период
                </label>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">Всички периоди</option>
                  <option value="today">Днес</option>
                  <option value="tomorrow">Утре</option>
                  <option value="week">Тази седмица</option>
                  <option value="month">Този месец</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setFilterInstructor('all');
                  setFilterStatus('all');
                  setFilterDate('all');
                }}
              >
                Изчисти филтри
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        <div className="p-6 lg:p-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Показани {lessons.length} часа
            </p>
          </div>

          <DataTable
            columns={columns}
            data={lessons}
            onRowClick={(row) => setSelectedLesson(row)}
          />
        </div>
      ) : (
        <CalendarView lessons={lessons} onLessonClick={setSelectedLesson} />
      )}

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onViewStudent={() => navigate(`/students/${selectedLesson.studentId}`)}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  subtitle,
  alert = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtitle: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: alert ? 'var(--status-warning-bg)' : 'var(--bg-panel)' }}
        >
          {icon}
        </div>
        {alert && (
          <div 
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--status-error)' }}
          />
        )}
      </div>
      <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {subtitle}
      </p>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ 
  icon, 
  tooltip, 
  onClick 
}: { 
  icon: React.ReactNode; 
  tooltip: string; 
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
      style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
      title={tooltip}
    >
      {icon}
    </button>
  );
}

// Calendar View Component
function CalendarView({ 
  lessons, 
  onLessonClick 
}: { 
  lessons: Lesson[]; 
  onLessonClick: (lesson: Lesson) => void;
}) {
  // Group lessons by date
  const lessonsByDate: Record<string, Lesson[]> = {};
  lessons.forEach(lesson => {
    if (!lessonsByDate[lesson.date]) {
      lessonsByDate[lesson.date] = [];
    }
    lessonsByDate[lesson.date].push(lesson);
  });

  const getStatusColor = (status: LessonStatus) => {
    switch (status) {
      case 'completed':
        return 'var(--status-success)';
      case 'active':
        return 'var(--primary-accent)';
      case 'late':
        return 'var(--status-warning)';
      case 'no-show':
      case 'canceled':
        return 'var(--status-error)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="space-y-6">
        {Object.entries(lessonsByDate).map(([date, dateLessons]) => (
          <div key={date} className="rounded-xl p-6" style={{ background: 'var(--bg-card)' }}>
            <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>
              {date} • {dateLessons.length} {dateLessons.length === 1 ? 'час' : 'часа'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateLessons.map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => onLessonClick(lesson)}
                  className="p-4 rounded-lg transition-all text-left hover:shadow-[var(--glow-indigo)]"
                  style={{ 
                    background: 'var(--bg-panel)',
                    borderLeft: `4px solid ${getStatusColor(lesson.status)}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {lesson.time}
                      </span>
                    </div>
                    <StatusBadge status={getStatusColor(lesson.status) as any} size="small">
                      {lesson.statusLabel}
                    </StatusBadge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {lesson.student}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {lesson.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {lesson.instructor}
                      </span>
                    </div>
                  </div>

                  {!lesson.isPaid && lesson.status !== 'canceled' && (
                    <div 
                      className="mt-3 pt-3 flex items-center gap-2 text-xs"
                      style={{ 
                        borderTop: '1px solid var(--ghost-border)',
                        color: 'var(--status-error)'
                      }}
                    >
                      <DollarSign size={12} />
                      Неплатен час
                    </div>
                  )}

                  {lesson.rating && (
                    <div className="mt-3 pt-3 flex items-center gap-1" style={{ borderTop: '1px solid var(--ghost-border)' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < lesson.rating! ? 'var(--status-warning)' : 'none'}
                          style={{ color: i < lesson.rating! ? 'var(--status-warning)' : 'var(--text-dim)' }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Lesson Detail Modal
function LessonDetailModal({
  lesson,
  onClose,
  onViewStudent,
}: {
  lesson: Lesson;
  onClose: () => void;
  onViewStudent: () => void;
}) {
  const [rating, setRating] = useState(lesson.rating || 0);
  const [notes, setNotes] = useState(lesson.notes || '');

  const getStatusColor = (status: LessonStatus): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
      case 'late':
        return 'warning';
      case 'no-show':
      case 'canceled':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div 
            className="sticky top-0 z-10 p-6 border-b"
            style={{ 
              background: 'var(--bg-card)',
              borderColor: 'var(--ghost-border)' 
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
                  Детайли за час
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {lesson.date} • {lesson.time}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <StatusBadge status={getStatusColor(lesson.status)} size="medium">
              {lesson.statusLabel}
            </StatusBadge>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="rounded-xl p-6" style={{ background: 'var(--bg-panel)' }}>
              <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>
                Информация за часа
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<User size={16} />} label="Курсист" value={lesson.student} />
                <InfoItem icon={<User size={16} />} label="Инструктор" value={lesson.instructor} />
                <InfoItem icon={<Car size={16} />} label="Тип" value={lesson.type} />
                <InfoItem icon={<Car size={16} />} label="Автомобил" value={lesson.vehicle} />
                <InfoItem icon={<MapPin size={16} />} label="Локация" value={lesson.location} />
                <InfoItem icon={<Clock size={16} />} label="Продължителност" value={`${lesson.duration} минути`} />
              </div>
            </div>

            {/* Payment Status */}
            {!lesson.isPaid && lesson.status !== 'canceled' && (
              <div 
                className="rounded-xl p-6 flex items-start gap-4"
                style={{ 
                  background: 'var(--status-error-bg)',
                  border: '1px solid var(--status-error-border)'
                }}
              >
                <AlertCircle size={20} style={{ color: 'var(--status-error)', flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="font-medium mb-1" style={{ color: 'var(--status-error)' }}>
                    Неплатен час
                  </p>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Автоматично известие ще бъде изпратено до родителя на курсиста.
                  </p>
                  <Button variant="secondary" icon={<Mail size={16} />}>
                    Изпрати известие сега
                  </Button>
                </div>
              </div>
            )}

            {/* Late/No-show Info */}
            {lesson.lateMinutes && (
              <div 
                className="rounded-xl p-6"
                style={{ 
                  background: 'var(--status-warning-bg)',
                  border: '1px solid var(--status-warning-border)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Timer size={20} style={{ color: 'var(--status-warning)' }} />
                  <p className="font-medium" style={{ color: 'var(--status-warning)' }}>
                    Закъснение с {lesson.lateMinutes} минути
                  </p>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {lesson.notes}
                </p>
              </div>
            )}

            {lesson.cancelReason && (
              <div 
                className="rounded-xl p-6"
                style={{ 
                  background: 'var(--status-error-bg)',
                  border: '1px solid var(--status-error-border)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={20} style={{ color: 'var(--status-error)' }} />
                  <p className="font-medium" style={{ color: 'var(--status-error)' }}>
                    Отменен час
                  </p>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Причина: {lesson.cancelReason}
                </p>
              </div>
            )}

            {/* Rating Section */}
            {(lesson.status === 'completed' || lesson.status === 'late') && (
              <div className="rounded-xl p-6" style={{ background: 'var(--bg-panel)' }}>
                <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>
                  Оценка на часа
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-all hover:scale-110"
                    >
                      <Star
                        size={32}
                        fill={star <= rating ? 'var(--status-warning)' : 'none'}
                        style={{ 
                          color: star <= rating ? 'var(--status-warning)' : 'var(--text-dim)',
                          cursor: 'pointer'
                        }}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Бележки
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Добавете бележки за часа..."
                    rows={4}
                    className="w-full rounded-lg px-4 py-3 border-none outline-none resize-none"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="primary" onClick={onViewStudent} icon={<User size={18} />}>
                Профил на курсиста
              </Button>
              {(lesson.status === 'completed' || lesson.status === 'late') && !lesson.rating && (
                <Button variant="secondary" icon={<Star size={18} />}>
                  Запази оценка
                </Button>
              )}
              {!lesson.isPaid && (
                <Button variant="secondary" icon={<MessageSquare size={18} />}>
                  Свържи се
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Info Item Component
function InfoItem({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
