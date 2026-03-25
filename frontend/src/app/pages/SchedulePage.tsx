import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  PageHeader, Badge, Button 
} from '../components/shared';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Plus, Coffee, User, Car, Clock, AlertCircle, CheckCircle,
  XCircle, CreditCard, Users, Filter, X, Edit, Trash2,
  Calendar, DollarSign, FileText, UserCheck, UserX, MapPin
} from 'lucide-react';

type LessonStatus = 'scheduled' | 'confirmed' | 'completed' | 'late' | 'canceled' | 'no-show' | 'payment-missing';
type BlockType = 'lesson' | 'rest';

type Instructor = {
  id: number;
  name: string;
  color: string;
};

type Vehicle = {
  id: number;
  plate: string;
  model: string;
};

type ScheduleBlock = {
  id: number;
  type: BlockType;
  instructorId: number;
  startTime: string; // HH:mm format
  endTime: string;
  // Lesson fields
  studentName?: string;
  studentId?: number;
  vehicleId?: number;
  category?: string;
  status?: LessonStatus;
  paymentStatus?: 'paid' | 'pending' | 'missing';
  // Rest block fields
  note?: string;
};

const INSTRUCTORS: Instructor[] = [
  { id: 1, name: 'Иван Петров', color: '#6366F1' },
  { id: 2, name: 'Мария Георгиева', color: '#A78BFA' },
  { id: 3, name: 'Георги Димитров', color: '#22c55e' },
  { id: 4, name: 'Елена Иванова', color: '#fb923c' },
];

const VEHICLES: Vehicle[] = [
  { id: 1, plate: 'СВ 1234 АВ', model: 'VW Golf' },
  { id: 2, plate: 'СВ 5678 СД', model: 'Skoda Octavia' },
  { id: 3, plate: 'СВ 9012 ЕФ', model: 'Toyota Corolla' },
  { id: 4, plate: 'СВ 3456 ГХ', model: 'Renault Clio' },
];

// Generate time slots from 08:00 to 24:00 (every 30 minutes)
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 8; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Mock schedule data
const MOCK_SCHEDULE: ScheduleBlock[] = [
  {
    id: 1,
    type: 'lesson',
    instructorId: 1,
    startTime: '09:00',
    endTime: '10:30',
    studentName: 'Мария Иванова',
    studentId: 1,
    vehicleId: 1,
    category: 'B',
    status: 'confirmed',
    paymentStatus: 'paid',
  },
  {
    id: 2,
    type: 'rest',
    instructorId: 1,
    startTime: '10:30',
    endTime: '11:00',
    note: 'Почивка',
  },
  {
    id: 3,
    type: 'lesson',
    instructorId: 1,
    startTime: '11:00',
    endTime: '12:30',
    studentName: 'Георги Димитров',
    studentId: 2,
    vehicleId: 1,
    category: 'B',
    status: 'scheduled',
    paymentStatus: 'paid',
  },
  {
    id: 4,
    type: 'lesson',
    instructorId: 1,
    startTime: '14:00',
    endTime: '15:30',
    studentName: 'Елена Стоянова',
    studentId: 3,
    vehicleId: 1,
    category: 'B',
    status: 'completed',
    paymentStatus: 'paid',
  },
  {
    id: 5,
    type: 'lesson',
    instructorId: 2,
    startTime: '08:00',
    endTime: '09:30',
    studentName: 'Иван Петров',
    studentId: 4,
    vehicleId: 2,
    category: 'B',
    status: 'completed',
    paymentStatus: 'paid',
  },
  {
    id: 6,
    type: 'lesson',
    instructorId: 2,
    startTime: '10:00',
    endTime: '11:30',
    studentName: 'Александра Георгиева',
    studentId: 5,
    vehicleId: 2,
    category: 'B',
    status: 'confirmed',
    paymentStatus: 'pending',
  },
  {
    id: 7,
    type: 'lesson',
    instructorId: 2,
    startTime: '13:00',
    endTime: '14:30',
    studentName: 'Николай Василев',
    studentId: 6,
    vehicleId: 2,
    category: 'B',
    status: 'late',
    paymentStatus: 'paid',
  },
  {
    id: 8,
    type: 'rest',
    instructorId: 2,
    startTime: '15:00',
    endTime: '15:30',
    note: 'Обяд',
  },
  {
    id: 9,
    type: 'lesson',
    instructorId: 3,
    startTime: '09:00',
    endTime: '10:30',
    studentName: 'Петър Стоянов',
    studentId: 7,
    vehicleId: 3,
    category: 'B',
    status: 'no-show',
    paymentStatus: 'paid',
  },
  {
    id: 10,
    type: 'lesson',
    instructorId: 3,
    startTime: '11:00',
    endTime: '12:30',
    studentName: 'Диана Петрова',
    studentId: 8,
    vehicleId: 3,
    category: 'B',
    status: 'confirmed',
    paymentStatus: 'missing',
  },
  {
    id: 11,
    type: 'lesson',
    instructorId: 4,
    startTime: '08:00',
    endTime: '09:30',
    studentName: 'Стефан Георгиев',
    studentId: 9,
    vehicleId: 4,
    category: 'B',
    status: 'canceled',
    paymentStatus: 'paid',
  },
];

const getStatusInfo = (status: LessonStatus) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Потвърден', color: 'blue', bgColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' };
    case 'scheduled':
      return { label: 'Планиран', color: 'purple', bgColor: 'rgba(167, 139, 250, 0.1)', borderColor: 'rgba(167, 139, 250, 0.3)' };
    case 'completed':
      return { label: 'Завършен', color: 'green', bgColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' };
    case 'late':
      return { label: 'Закъснение', color: 'orange', bgColor: 'rgba(251, 146, 60, 0.1)', borderColor: 'rgba(251, 146, 60, 0.3)' };
    case 'canceled':
      return { label: 'Отменен', color: 'gray', bgColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' };
    case 'no-show':
      return { label: 'Не се яви', color: 'red', bgColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' };
    case 'payment-missing':
      return { label: 'Липсва плащане', color: 'orange', bgColor: 'rgba(251, 146, 60, 0.1)', borderColor: 'rgba(251, 146, 60, 0.3)' };
  }
};

export function SchedulePage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date('2024-03-24'));
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>(INSTRUCTORS.map(i => i.id));
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(MOCK_SCHEDULE);
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);
  const [isNewRestModalOpen, setIsNewRestModalOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date('2024-03-24')); // Using mock "today"
  };

  const toggleInstructor = (instructorId: number) => {
    if (selectedInstructors.includes(instructorId)) {
      // Don't allow deselecting the last instructor
      if (selectedInstructors.length > 1) {
        setSelectedInstructors(selectedInstructors.filter(id => id !== instructorId));
      }
    } else {
      setSelectedInstructors([...selectedInstructors, instructorId]);
    }
  };

  const getVehicle = (vehicleId?: number) => {
    return VEHICLES.find(v => v.id === vehicleId);
  };

  const getBlocksForInstructor = (instructorId: number) => {
    return schedule.filter(block => block.instructorId === instructorId);
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateBlockHeight = (startTime: string, endTime: string) => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const durationInMinutes = end - start;
    // Each hour = 80px, so each minute = 80/60 = 1.333px
    return (durationInMinutes / 60) * 80;
  };

  const calculateBlockTop = (time: string) => {
    const minutes = timeToMinutes(time);
    const startMinutes = timeToMinutes('08:00');
    const offsetMinutes = minutes - startMinutes;
    return (offsetMinutes / 60) * 80;
  };

  const visibleInstructors = INSTRUCTORS.filter(i => selectedInstructors.includes(i.id));

  // Calculate daily statistics
  const totalLessons = schedule.filter(b => b.type === 'lesson').length;
  const completedLessons = schedule.filter(b => b.type === 'lesson' && b.status === 'completed').length;
  const confirmedLessons = schedule.filter(b => b.type === 'lesson' && b.status === 'confirmed').length;
  const issuesCount = schedule.filter(b => 
    b.type === 'lesson' && (b.status === 'no-show' || b.status === 'late' || b.paymentStatus === 'missing')
  ).length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Page Header */}
      <PageHeader
        title="Дневен график"
        description="Управление на практически часове и почивки"
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'График' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<Plus size={18} />}
            >
              Нов час
            </Button>
            <Button
              variant="secondary"
              icon={<Coffee size={18} />}
            >
              Почивка
            </Button>
          </div>
        }
      />

      {/* Controls Bar */}
      <div className="px-6 lg:px-8 py-6">
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousDay}
                className="p-2 rounded-lg transition-all hover:bg-white/[0.05]"
              >
                <ChevronLeft size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <div className="text-center min-w-[280px]">
                <h2
                  className="text-xl font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatDate(selectedDate)}
                </h2>
              </div>
              <button
                onClick={goToNextDay}
                className="p-2 rounded-lg transition-all hover:bg-white/[0.05]"
              >
                <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            <Button
              variant="secondary"
              icon={<CalendarIcon size={18} />}
              onClick={goToToday}
            >
              Днес
            </Button>
          </div>

          {/* Instructor Filter - Segmented Buttons */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Users size={18} style={{ color: 'var(--text-secondary)' }} />
              <span
                className="font-medium"
                style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}
              >
                Инструктори:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INSTRUCTORS.map((instructor) => {
                const isSelected = selectedInstructors.includes(instructor.id);
                return (
                  <button
                    key={instructor.id}
                    onClick={() => toggleInstructor(instructor.id)}
                    className="px-5 py-3 rounded-xl transition-all font-medium"
                    style={{
                      background: isSelected 
                        ? instructor.color + '20'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected
                        ? `2px solid ${instructor.color}`
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      color: isSelected 
                        ? instructor.color
                        : 'var(--text-secondary)',
                      fontSize: '0.9375rem',
                    }}
                  >
                    {instructor.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="px-6 lg:px-8 pb-8">
        {/* Status Legend */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <span
            className="font-medium"
            style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}
          >
            Легенда:
          </span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(99, 102, 241, 0.2)', border: '2px solid rgba(99, 102, 241, 0.5)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Потвърден</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(167, 139, 250, 0.2)', border: '2px solid rgba(167, 139, 250, 0.5)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Планиран</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(34, 197, 94, 0.2)', border: '2px solid rgba(34, 197, 94, 0.5)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Завършен</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(251, 146, 60, 0.2)', border: '2px solid rgba(251, 146, 60, 0.5)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Закъснение</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '2px solid rgba(239, 68, 68, 0.5)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Не се яви</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '2px solid rgba(255, 255, 255, 0.2)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Отменен</span>
          </div>
          <div className="flex items-center gap-2">
            <Coffee size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Почивка</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={14} style={{ color: '#fb923c' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Липсва плащане</span>
          </div>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Schedule Header */}
          <div
            className="grid sticky top-0 z-10"
            style={{
              gridTemplateColumns: `80px repeat(${visibleInstructors.length}, 1fr)`,
              background: 'var(--bg-card)',
              borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="p-4" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                Час
              </span>
            </div>
            {visibleInstructors.map((instructor) => (
              <div
                key={instructor.id}
                className="p-4 text-center"
                style={{ borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: instructor.color }}
                  />
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                  >
                    {instructor.name}
                  </span>
                </div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                  {getBlocksForInstructor(instructor.id).filter(b => b.type === 'lesson').length} часа
                </span>
              </div>
            ))}
          </div>

          {/* Schedule Body */}
          <div className="relative">
            {/* Time Grid */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `80px repeat(${visibleInstructors.length}, 1fr)`,
              }}
            >
              {/* Time Labels Column */}
              <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}>
                {TIME_SLOTS.filter((_, index) => index % 2 === 0).map((time) => (
                  <div
                    key={time}
                    className="px-4 py-2"
                    style={{
                      height: '80px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}
                    >
                      {time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Instructor Columns */}
              {visibleInstructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className="relative"
                  style={{
                    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                    minHeight: '1280px', // 16 hours * 80px
                  }}
                >
                  {/* Hour lines */}
                  {TIME_SLOTS.filter((_, index) => index % 2 === 0).map((time, index) => (
                    <div
                      key={time}
                      style={{
                        position: 'absolute',
                        top: `${index * 80}px`,
                        left: 0,
                        right: 0,
                        height: '80px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    />
                  ))}

                  {/* Lesson and Rest Blocks */}
                  {getBlocksForInstructor(instructor.id).map((block) => {
                    const height = calculateBlockHeight(block.startTime, block.endTime);
                    const top = calculateBlockTop(block.startTime);
                    const vehicle = block.vehicleId ? getVehicle(block.vehicleId) : null;

                    if (block.type === 'rest') {
                      return (
                        <button
                          key={block.id}
                          className="absolute left-2 right-2 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all hover:bg-white/[0.02] cursor-pointer"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            background: 'rgba(75, 85, 99, 0.15)',
                            border: '2px solid rgba(156, 163, 175, 0.25)',
                          }}
                          onClick={() => {
                            setSelectedBlock(block);
                            setIsDrawerOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="p-2 rounded-lg"
                              style={{ background: 'rgba(156, 163, 175, 0.15)' }}
                            >
                              <Coffee size={18} style={{ color: '#9ca3af' }} />
                            </div>
                          </div>
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500 }}>
                            {block.note || 'Почивка'}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                            Неналично време
                          </span>
                        </button>
                      );
                    }

                    // Lesson block
                    const statusInfo = getStatusInfo(block.status!);
                    const hasPaymentIssue = block.paymentStatus === 'missing';
                    const isLate = block.status === 'late';

                    // Premium red warning state for missing payment
                    const cardBackground = hasPaymentIssue 
                      ? 'rgba(239, 68, 68, 0.08)' 
                      : statusInfo.bgColor;
                    const cardBorder = hasPaymentIssue 
                      ? '2px solid rgba(239, 68, 68, 0.4)' 
                      : `2px solid ${statusInfo.borderColor}`;

                    return (
                      <button
                        key={block.id}
                        className="absolute left-2 right-2 rounded-lg p-3 text-left transition-all hover:shadow-lg overflow-hidden"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          background: cardBackground,
                          border: cardBorder,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setSelectedBlock(block);
                          setIsDrawerOpen(true);
                        }}
                      >
                        <div className="flex flex-col h-full overflow-hidden">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2 min-h-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: instructor.color }}
                              />
                              <span
                                className="font-semibold truncate"
                                style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                              >
                                {block.studentName}
                              </span>
                            </div>
                            {hasPaymentIssue && (
                              <div className="flex-shrink-0">
                                <CreditCard size={14} style={{ color: '#ef4444' }} />
                              </div>
                            )}
                          </div>

                          {/* Late Warning - Explicit Red Text */}
                          {isLate && (
                            <div className="mb-2 flex items-center gap-2">
                              <AlertCircle size={14} style={{ color: '#ef4444' }} />
                              <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
                                ЗАКЪСНЕНИЕ
                              </span>
                            </div>
                          )}

                          {/* Payment Warning - Explicit Red Text */}
                          {hasPaymentIssue && (
                            <div className="mb-2 flex items-center gap-2">
                              <CreditCard size={14} style={{ color: '#ef4444' }} />
                              <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
                                ЛИПСВА ПЛАЩАНЕ
                              </span>
                            </div>
                          )}

                          {/* Time */}
                          <div className="flex items-center gap-2 mb-1.5 min-h-0">
                            <Clock size={14} style={{ color: 'var(--text-tertiary)' }} className="flex-shrink-0" />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }} className="truncate">
                              {block.startTime} - {block.endTime}
                            </span>
                          </div>

                          {/* Instructor */}
                          <div className="flex items-center gap-2 mb-1.5 min-h-0">
                            <User size={14} style={{ color: 'var(--text-tertiary)' }} className="flex-shrink-0" />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }} className="truncate">
                              {instructor.name}
                            </span>
                          </div>

                          {/* Vehicle */}
                          {vehicle && (
                            <div className="flex items-center gap-2 mb-1.5 min-h-0">
                              <Car size={14} style={{ color: 'var(--text-tertiary)' }} className="flex-shrink-0" />
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }} className="truncate">
                                {vehicle.plate}
                              </span>
                            </div>
                          )}

                          {/* Category Badge */}
                          {block.category && !hasPaymentIssue && !isLate && (
                            <div className="mt-auto">
                              <Badge variant="blue" size="sm">
                                Кат. {block.category}
                              </Badge>
                            </div>
                          )}

                          {/* Status Icon */}
                          <div className="absolute top-2 right-2">
                            {block.status === 'completed' && (
                              <CheckCircle size={16} style={{ color: '#22c55e' }} />
                            )}
                            {block.status === 'no-show' && (
                              <XCircle size={16} style={{ color: '#ef4444' }} />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {isDrawerOpen && selectedBlock && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div
            className="fixed top-0 right-0 bottom-0 w-full lg:w-[480px] z-50 overflow-y-auto"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Drawer Header */}
            <div
              className="sticky top-0 z-10 p-6 flex items-center justify-between"
              style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <h2
                className="text-xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {selectedBlock.type === 'rest' ? 'Почивка' : 'Детайли на часа'}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg transition-all hover:bg-white/[0.05]"
              >
                <X size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6">
              {selectedBlock.type === 'rest' ? (
                /* Rest Block Details */
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <Coffee size={24} style={{ color: 'var(--text-tertiary)', marginRight: '12px' }} />
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        Неналично време
                      </p>
                      <p className="text-lg font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                        {selectedBlock.note || 'Почивка'}
                      </p>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div>
                    <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Инструктор
                    </label>
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: INSTRUCTORS.find(i => i.id === selectedBlock.instructorId)?.color }}
                      />
                      <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>
                        {INSTRUCTORS.find(i => i.id === selectedBlock.instructorId)?.name}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Дата
                    </label>
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      <Calendar size={18} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                        {formatDate(selectedDate)}
                      </span>
                    </div>
                  </div>

                  {/* Time Range */}
                  <div>
                    <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Времетраене
                    </label>
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      <Clock size={18} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>
                        {selectedBlock.startTime} - {selectedBlock.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 space-y-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Button
                      variant="secondary"
                      icon={<Edit size={18} />}
                      fullWidth
                    >
                      Редактирай
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Trash2 size={18} />}
                      fullWidth
                    >
                      Изтрий почивката
                    </Button>
                  </div>
                </div>
              ) : (
                /* Lesson Details */
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center p-4 rounded-xl" style={{
                    background: getStatusInfo(selectedBlock.status!).bgColor,
                    border: `2px solid ${getStatusInfo(selectedBlock.status!).borderColor}`,
                  }}>
                    <Badge variant={getStatusInfo(selectedBlock.status!).color as any}>
                      {getStatusInfo(selectedBlock.status!).label}
                    </Badge>
                  </div>

                  {/* Student */}
                  <div>
                    <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Курсист
                    </label>
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      <User size={18} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>
                        {selectedBlock.studentName}
                      </span>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div>
                    <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Инструктор
                    </label>
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: INSTRUCTORS.find(i => i.id === selectedBlock.instructorId)?.color }}
                      />
                      <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>
                        {INSTRUCTORS.find(i => i.id === selectedBlock.instructorId)?.name}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle */}
                  {selectedBlock.vehicleId && (
                    <div>
                      <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Автомобил
                      </label>
                      <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                        <Car size={18} style={{ color: 'var(--text-tertiary)' }} />
                        <div>
                          <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>
                            {getVehicle(selectedBlock.vehicleId)?.plate}
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            {getVehicle(selectedBlock.vehicleId)?.model}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  {selectedBlock.category && (
                    <div>
                      <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Категория
                      </label>
                      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                        <Badge variant="blue">Категория {selectedBlock.category}</Badge>
                      </div>
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Дата
                      </label>
                      <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                        <Calendar size={16} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                          {new Date(selectedDate).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Време
                      </label>
                      <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                        <Clock size={16} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                          {selectedBlock.startTime} - {selectedBlock.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  {selectedBlock.paymentStatus && (
                    <div>
                      <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Плащане
                      </label>
                      <div className="flex items-center gap-3 p-4 rounded-lg" style={{
                        background: selectedBlock.paymentStatus === 'paid'
                          ? 'rgba(34, 197, 94, 0.1)'
                          : selectedBlock.paymentStatus === 'pending'
                          ? 'rgba(251, 146, 60, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                      }}>
                        <DollarSign size={18} style={{
                          color: selectedBlock.paymentStatus === 'paid'
                            ? '#22c55e'
                            : selectedBlock.paymentStatus === 'pending'
                            ? '#fb923c'
                            : '#ef4444',
                        }} />
                        <span style={{
                          color: selectedBlock.paymentStatus === 'paid'
                            ? '#22c55e'
                            : selectedBlock.paymentStatus === 'pending'
                            ? '#fb923c'
                            : '#ef4444',
                          fontSize: '1rem',
                          fontWeight: 500,
                        }}>
                          {selectedBlock.paymentStatus === 'paid' && 'Платено'}
                          {selectedBlock.paymentStatus === 'pending' && 'В изчакване'}
                          {selectedBlock.paymentStatus === 'missing' && 'Липсва плащане'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div>
                    <label className="block mb-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Бележки
                    </label>
                    <div className="p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontStyle: 'italic' }}>
                        Няма добавени бележки
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                          Създаден от:
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          Администратор
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                          Дата на създаване:
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          20.03.2024, 14:30
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                          Последна промяна:
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          22.03.2024, 09:15
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-6 space-y-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Button
                      variant="primary"
                      icon={<Edit size={18} />}
                      fullWidth
                    >
                      Редактирай часа
                    </Button>
                    
                    {selectedBlock.status !== 'completed' && selectedBlock.status !== 'canceled' && (
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="secondary"
                          icon={<UserCheck size={18} />}
                          fullWidth
                        >
                          Завърши
                        </Button>
                        <Button
                          variant="secondary"
                          icon={<UserX size={18} />}
                          fullWidth
                        >
                          Отмени
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="secondary"
                      icon={<Trash2 size={18} />}
                      fullWidth
                    >
                      Изтрий часа
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}