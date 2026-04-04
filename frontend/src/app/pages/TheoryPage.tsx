import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  PageHeader, Badge, Button, Modal, Input, Select
} from '../components/shared';
import { 
  Plus, Download, Calendar as CalendarIcon, AlertTriangle, 
  Clock, Users, BookOpen, CheckCircle, XCircle, AlertCircle,
  Search, X, Filter, MoreVertical, Eye, Edit2, Trash2,
  UserCheck, UserX, Mail, TrendingUp, Target, Send,
  ChevronRight, ChevronDown, ChevronUp, Bell, Award,
  ClipboardList, BarChart3, Activity, User, Hash, FileText
} from 'lucide-react';
import {
  fetchTheoryGroups,
  saveTheoryLectureAttendance,
} from '../services/theoryApi';
import { useAuthSession } from '../services/authSession';

type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';
type RecoveryStatus = 'not-required' | 'required' | 'in-progress' | 'completed';
type MessageStatus = 'not-sent' | 'sent' | 'scheduled';

type TheoryStudent = {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  attendanceCount: number;
  absenceCount: number;
  recoveryStatus: RecoveryStatus;
  messageStatus: MessageStatus;
  dueAmount?: number;
  lastAbsenceDate?: string;
};

type TheoryLecture = {
  id: string;
  number: number;
  title: string;
  date: string;
  time: string;
  endTime: string;
  duration: number;
  instructor: string;
  location: string;
  attendanceCount: number;
  absentCount: number;
  lateCount: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'canceled';
  students?: Array<{
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    notes?: string;
  }>;
};

type TheoryGroup = {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate?: string;
  studentCount: number;
  totalLectures: number;
  completedLectures: number;
  activeStudents: number;
  studentsWithAbsences: number;
  studentsNeedingRecovery: number;
  averageAttendance: number;
  status: 'active' | 'completed' | 'upcoming';
  schedule: string;
  lectures: TheoryLecture[];
  students: TheoryStudent[];
};

const getRecoveryStatusInfo = (status: RecoveryStatus) => {
  switch (status) {
    case 'not-required':
      return { label: 'Не е нужно', color: 'gray' as const };
    case 'required':
      return { label: 'Изисква се', color: 'red' as const };
    case 'in-progress':
      return { label: 'В процес', color: 'orange' as const };
    case 'completed':
      return { label: 'Завършено', color: 'green' as const };
  }
};

const getGroupStatusInfo = (status: TheoryGroup['status']) => {
  switch (status) {
    case 'active':
      return { label: 'Активна', color: 'green' as const };
    case 'completed':
      return { label: 'Завършена', color: 'gray' as const };
    case 'upcoming':
      return { label: 'Предстояща', color: 'blue' as const };
  }
};

export function TheoryPage() {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState<TheoryGroup | null>(null);
  const [isGroupDetailOpen, setIsGroupDetailOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedLecture, setExpandedLecture] = useState<string | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceLecture, setAttendanceLecture] = useState<TheoryLecture | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [selectedAbsentStudent, setSelectedAbsentStudent] = useState<{
    student: TheoryStudent;
    lecture: TheoryLecture;
    group: TheoryGroup;
  } | null>(null);
  const [isAbsenceDetailOpen, setIsAbsenceDetailOpen] = useState(false);
  const [theoryGroups, setTheoryGroups] =
    useState<TheoryGroup[]>([]);
  const [sourceStatus, setSourceStatus] = useState<
    'loading' | 'backend' | 'fallback'
  >('loading');
  const [actionMessage, setActionMessage] = useState(
    'Зареждане на теория групите от PostgreSQL.',
  );

  useEffect(() => {
    let isMounted = true;

    fetchTheoryGroups()
      .then((groups) => {
        if (!isMounted) {
          return;
        }

        setTheoryGroups(groups);
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setTheoryGroups([]);
        setSourceStatus('fallback');
        setActionMessage('Неуспешно зареждане на теория групите от базата.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate summary statistics
  const filteredGroups = theoryGroups.filter((group) => {
    const query = searchValue.trim().toLowerCase();
    const searchMatch =
      !query ||
      [group.name, group.category, ...group.students.map((student) => student.name)].some((value) =>
        value.toLowerCase().includes(query),
      );

    const categoryMatch =
      categoryFilter === 'all' || group.category === categoryFilter;

    const statusMatch =
      statusFilter === 'all' || group.status === statusFilter;

    const todayIso = new Date().toISOString().slice(0, 10);
    const dateMatch =
      dateFilter === 'all' ||
      (dateFilter === 'today' && group.lectures.some((lecture) => lecture.date === todayIso)) ||
      (dateFilter === 'week' && group.lectures.some((lecture) => isWithinCurrentWeek(lecture.date))) ||
      (dateFilter === 'month' && group.startDate.startsWith(todayIso.slice(0, 7)));

    const recoveryFilterMatch =
      !activeFilters.includes('needs-recovery') || group.studentsNeedingRecovery > 0;
    const todayFilterMatch =
      !activeFilters.includes('today') ||
      group.lectures.some((lecture) => lecture.date === todayIso);
    const activeFilterMatch =
      !activeFilters.includes('active') || group.status === 'active';
    const nearCompletionFilterMatch =
      !activeFilters.includes('near-completion') ||
      group.completedLectures / Math.max(group.totalLectures, 1) >= 0.8;
    const messagesFilterMatch =
      !activeFilters.includes('messages-sent') ||
      group.students.some((student) => student.messageStatus === 'sent');
    const presentFilterMatch =
      !activeFilters.includes('present-today') ||
      group.lectures.some((lecture) => lecture.date === todayIso && lecture.attendanceCount > 0);
    const absentFilterMatch =
      !activeFilters.includes('absent-today') ||
      group.lectures.some((lecture) => lecture.date === todayIso && lecture.absentCount > 0);

    return (
      searchMatch &&
      categoryMatch &&
      statusMatch &&
      dateMatch &&
      recoveryFilterMatch &&
      todayFilterMatch &&
      activeFilterMatch &&
      nearCompletionFilterMatch &&
      messagesFilterMatch &&
      presentFilterMatch &&
      absentFilterMatch
    );
  });
  const activeGroups = theoryGroups.filter(g => g.status === 'active');
  const todayLectures = theoryGroups.flatMap(g =>
    g.lectures.filter(l => l.date === new Date().toISOString().slice(0, 10))
  );
  const totalPresentToday = todayLectures.reduce((sum, l) => sum + l.attendanceCount, 0);
  const totalAbsentToday = todayLectures.reduce((sum, l) => sum + l.absentCount, 0);
  const studentsNeedingRecovery = theoryGroups.reduce((sum, g) => sum + g.studentsNeedingRecovery, 0);
  const messagesAutomated = theoryGroups.flatMap(g => g.students).filter(s => s.messageStatus === 'sent').length;
  const groupsNearingCompletion = theoryGroups.filter(g =>
    g.status === 'active' && (g.completedLectures / g.totalLectures) >= 0.8
  );

  const handleGroupClick = (group: TheoryGroup) => {
    // Navigate to dedicated group page
    navigate(`/theory/${group.id}`);
  };

  const handleOpenAttendance = (e: React.MouseEvent, lecture: TheoryLecture, group: TheoryGroup) => {
    e.stopPropagation();
    setAttendanceLecture(lecture);
    setSelectedGroup(group);
    
    // Initialize attendance data with current status
    const initialData: Record<string, AttendanceStatus> = {};
    if (lecture.students) {
      lecture.students.forEach(s => {
        initialData[s.studentId] = s.status;
      });
    } else {
      // Initialize all students as present
      group.students.forEach(s => {
        initialData[s.id] = 'present';
      });
    }
    setAttendanceData(initialData);
    setIsAttendanceModalOpen(true);
  };

  const handleMarkAllPresent = () => {
    if (!selectedGroup) return;
    const newData: Record<string, AttendanceStatus> = {};
    selectedGroup.students.forEach(s => {
      newData[s.id] = 'present';
    });
    setAttendanceData(newData);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedGroup || !attendanceLecture) {
      return;
    }

    try {
      const updatedGroup = await saveTheoryLectureAttendance(
        selectedGroup.id,
        attendanceLecture.id,
        selectedGroup.students.map((student) => ({
          studentId: student.id,
          status: attendanceData[student.id] ?? 'present',
          viberSent:
            attendanceLecture.students?.find(
              (lectureStudent) => lectureStudent.studentId === student.id,
            )?.viberSent ?? false,
        })),
        session?.csrfToken ?? '',
      );

      setTheoryGroups((current) =>
        current.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group,
        ),
      );
      setSelectedGroup(updatedGroup);
      setActionMessage(
        `Присъствието за лекция ${attendanceLecture.number} е записано в PostgreSQL.`,
      );
      setIsAttendanceModalOpen(false);
      setAttendanceData({});
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? `Неуспешен запис на присъствие: ${error.message}`
          : 'Неуспешен запис на присъствие в базата.',
      );
    }
  };

  const handleViewAbsentStudent = (student: TheoryStudent, lecture: TheoryLecture, group: TheoryGroup) => {
    setSelectedAbsentStudent({ student, lecture, group });
    setIsAbsenceDetailOpen(true);
  };

  const toggleLecture = (lectureId: string) => {
    setExpandedLecture(expandedLecture === lectureId ? null : lectureId);
  };

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchValue('');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Page Header */}
      <PageHeader
        title="Теория"
        description={`Управление на теоретично обучение, групи, лекции и присъствие · ${
          sourceStatus === 'backend'
            ? 'PostgreSQL + Redis'
            : sourceStatus === 'fallback'
              ? 'Fallback данни'
              : 'Зареждане...'
        }`}
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Теория' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<AlertTriangle size={18} />}
              onClick={() => addFilter('needs-recovery')}
            >
              Нужно възстановяване ({studentsNeedingRecovery})
            </Button>
            <Button
              variant="secondary"
              icon={<CalendarIcon size={18} />}
              onClick={() => addFilter('today')}
            >
              Днес
            </Button>
            <Button
              variant="secondary"
              icon={<Download size={18} />}
              onClick={() => {
                exportTheoryGroupsCsv(filteredGroups);
                setActionMessage(
                  `Експортирани са ${filteredGroups.length} теоретични групи в CSV файл.`,
                );
              }}
            >
              Експорт
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Нова група
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="px-6 lg:px-8 py-6">
        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {actionMessage}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {/* Active Groups */}
          <button
            onClick={() => addFilter('active')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(99, 102, 241, 0.1)' }}
              >
                <Users size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {activeGroups.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Активни групи
            </p>
          </button>

          {/* Today's Lectures */}
          <button
            onClick={() => addFilter('today')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(167, 139, 250, 0.1)' }}
              >
                <BookOpen size={20} style={{ color: 'var(--accent-ai)' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {todayLectures.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Лекции днес
            </p>
          </button>

          {/* Present Today */}
          <button
            onClick={() => addFilter('present-today')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(34, 197, 94, 0.1)' }}
              >
                <UserCheck size={20} style={{ color: '#22c55e' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {totalPresentToday}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Присъстващи днес
            </p>
          </button>

          {/* Absent Today */}
          <button
            onClick={() => addFilter('absent-today')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--bg-card)',
              border: totalAbsentToday > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <UserX size={20} style={{ color: '#ef4444' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {totalAbsentToday}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Отсъстващи днес
            </p>
          </button>

          {/* Messages Sent */}
          <button
            onClick={() => addFilter('messages-sent')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(99, 102, 241, 0.1)' }}
              >
                <Send size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {messagesAutomated}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Изпратени съобщения
            </p>
          </button>

          {/* Needs Recovery */}
          <button
            onClick={() => addFilter('needs-recovery')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--bg-card)',
              border: studentsNeedingRecovery > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <AlertCircle size={20} style={{ color: '#ef4444' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {studentsNeedingRecovery}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Нужно възстановяване
            </p>
          </button>

          {/* Near Completion */}
          <button
            onClick={() => addFilter('near-completion')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(34, 197, 94, 0.1)' }}
              >
                <Target size={20} style={{ color: '#22c55e' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {groupsNearingCompletion.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Близо до завършване
            </p>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 lg:px-8 pb-6">
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Search and Main Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-[280px] relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Търсене по име на група или курсист..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all"
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[160px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option value="all">Всички категории</option>
              <option value="A">Категория A</option>
              <option value="B">Категория B</option>
              <option value="C">Категория C</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[160px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option value="all">Всички групи</option>
              <option value="active">Активни</option>
              <option value="completed">Завършени</option>
              <option value="upcoming">Предстоящи</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[160px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option value="all">Всички дати</option>
              <option value="today">Днес</option>
              <option value="week">Тази седмица</option>
              <option value="month">Този месец</option>
            </select>

            {/* More Filters Button */}
            <Button variant="secondary" icon={<Filter size={16} />}>
              Филтри
            </Button>
          </div>

          {/* Active Filters Pills */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                Активни филтри:
              </span>
              {activeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => removeFilter(filter)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: 'var(--accent-primary)',
                    fontSize: '0.875rem',
                  }}
                >
                  {filter}
                  <X size={14} />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm transition-all hover:opacity-80"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Изчисти всички
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Theory Groups List */}
      <div className="px-6 lg:px-8 pb-8">
        {filteredGroups.length === 0 ? (
          /* Empty State */
          <div
            className="rounded-xl p-16 text-center"
            style={{ background: 'var(--bg-card)' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(99, 102, 241, 0.1)' }}
            >
              <BookOpen size={32} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3
              className="text-xl font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Няма теоретични групи
            </h3>
            <p
              className="mb-8 max-w-md mx-auto"
              style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}
            >
              Създайте първата теоретична група, за да започнете управлението на лекции и присъствие
            </p>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Създай първа група
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => {
            const statusInfo = getGroupStatusInfo(group.status);
            const progress = (group.completedLectures / group.totalLectures) * 100;
            const hasIssues = group.studentsNeedingRecovery > 0;

            return (
              <div
                key={group.id}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: hasIssues ? '1px solid rgba(239, 68, 68, 0.2)' : 'none',
                }}
              >
                {/* Group Header */}
                <button
                  onClick={() => handleGroupClick(group)}
                  className="w-full p-6 text-left transition-all hover:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Left: Group Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3
                          className="text-xl font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {group.name}
                        </h3>
                        <Badge variant={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <span
                          className="px-3 py-1 rounded-lg font-medium"
                          style={{
                            background: 'rgba(167, 139, 250, 0.1)',
                            color: 'var(--accent-ai)',
                            fontSize: '0.875rem',
                          }}
                        >
                          Категория {group.category}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem', marginBottom: '12px' }}>
                        {group.schedule}
                      </p>
                      
                      {/* Stats Row */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Users size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {group.studentCount} курсисти
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {group.completedLectures} / {group.totalLectures} лекции
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {group.averageAttendance.toFixed(1)}% присъствие
                          </span>
                        </div>
                        {group.studentsWithAbsences > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} style={{ color: '#fb923c' }} />
                            <span style={{ color: '#fb923c', fontSize: '0.9375rem' }}>
                              {group.studentsWithAbsences} с отсъствия
                            </span>
                          </div>
                        )}
                        {group.studentsNeedingRecovery > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                            <span style={{ color: '#ef4444', fontSize: '0.9375rem', fontWeight: 500 }}>
                              {group.studentsNeedingRecovery} нужно възстановяване
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Progress & Action */}
                    <div className="flex items-center gap-4">
                      {/* Progress Circle */}
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                          style={{
                            background: `conic-gradient(var(--accent-primary) ${progress}%, rgba(255, 255, 255, 0.05) ${progress}%)`,
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--bg-card)' }}
                          >
                            <span
                              className="text-sm font-semibold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                          Прогрес
                        </p>
                      </div>

                      {/* Open Button */}
                      <div>
                        <ChevronRight size={24} style={{ color: 'var(--text-tertiary)' }} />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="mt-4 h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${progress}%`,
                        background: 'var(--accent-primary)',
                      }}
                    />
                  </div>
                </button>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Group Detail View - Side Drawer */}
      {isGroupDetailOpen && selectedGroup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end"
          onClick={() => setIsGroupDetailOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl h-full overflow-y-auto"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Drawer Header */}
            <div
              className="sticky top-0 z-10 px-8 py-6 flex items-start justify-between"
              style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div>
                <h2
                  className="text-2xl font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedGroup.name}
                </h2>
                <div className="flex items-center gap-3">
                  <Badge variant={getGroupStatusInfo(selectedGroup.status).color}>
                    {getGroupStatusInfo(selectedGroup.status).label}
                  </Badge>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                    {selectedGroup.schedule}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsGroupDetailOpen(false)}
                className="p-2 rounded-lg transition-all hover:bg-white/[0.05]"
              >
                <X size={24} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Group Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={18} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Курсисти
                    </span>
                  </div>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedGroup.studentCount}
                  </p>
                </div>
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={18} style={{ color: 'var(--accent-ai)' }} />
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Лекции
                    </span>
                  </div>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedGroup.completedLectures} / {selectedGroup.totalLectures}
                  </p>
                </div>
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={18} style={{ color: '#22c55e' }} />
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Средно присъствие
                    </span>
                  </div>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedGroup.averageAttendance.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Lectures List */}
              <div>
                <h3
                  className="font-medium mb-4"
                  style={{ color: 'var(--text-primary)', fontSize: '1.125rem' }}
                >
                  Лекции
                </h3>
                <div className="space-y-3">
                  {selectedGroup.lectures.map((lecture) => {
                    const isExpanded = expandedLecture === lecture.id;
                    const isToday = lecture.date === '2024-03-24' || lecture.date === '2026-03-24';

                    return (
                      <div
                        key={lecture.id}
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: 'var(--bg-primary)',
                          border: isToday ? '1px solid rgba(99, 102, 241, 0.2)' : 'none',
                        }}
                      >
                        <button
                          onClick={() => toggleLecture(lecture.id)}
                          className="w-full p-5 text-left transition-all hover:bg-white/[0.02]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span
                                  className="font-medium"
                                  style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                                >
                                  Лекция {lecture.number}: {lecture.title}
                                </span>
                                {lecture.status === 'completed' && (
                                  <CheckCircle size={16} style={{ color: '#22c55e' }} />
                                )}
                                {lecture.status === 'scheduled' && isToday && (
                                  <Badge variant="purple">Днес</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                  {new Date(lecture.date).toLocaleDateString('bg-BG', {
                                    day: 'numeric',
                                    month: 'short',
                                  })} • {lecture.time} - {lecture.endTime}
                                </span>
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                  {lecture.instructor}
                                </span>
                                {lecture.status === 'completed' && (
                                  <>
                                    <span style={{ color: '#22c55e', fontSize: '0.875rem' }}>
                                      {lecture.attendanceCount} присъстващи
                                    </span>
                                    {lecture.absentCount > 0 && (
                                      <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                                        {lecture.absentCount} отсъстващи
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {lecture.status === 'scheduled' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={<ClipboardList size={16} />}
                                  onClick={(e) => handleOpenAttendance(e, lecture, selectedGroup)}
                                >
                                  Маркирай присъствие
                                </Button>
                              )}
                              {lecture.status === 'completed' && lecture.students && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  icon={<Eye size={16} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLecture(lecture.id);
                                  }}
                                >
                                  Преглед
                                </Button>
                              )}
                              <div>
                                {isExpanded ? (
                                  <ChevronUp size={20} style={{ color: 'var(--text-tertiary)' }} />
                                ) : (
                                  <ChevronDown size={20} style={{ color: 'var(--text-tertiary)' }} />
                                )}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Expanded Attendance Details */}
                        {isExpanded && lecture.students && (
                          <div
                            className="px-5 pb-5 pt-2"
                            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}
                          >
                            <h4
                              className="font-medium mb-3"
                              style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                            >
                              Присъствие
                            </h4>
                            <div className="space-y-2">
                              {lecture.students.map((student) => {
                                const fullStudent = selectedGroup.students.find(s => s.id === student.studentId);
                                
                                return (
                                  <button
                                    key={student.studentId}
                                    onClick={() => {
                                      if (student.status === 'absent' && fullStudent) {
                                        handleViewAbsentStudent(fullStudent, lecture, selectedGroup);
                                      }
                                    }}
                                    className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-all hover:bg-white/[0.02]"
                                    style={{
                                      background: student.status === 'absent'
                                        ? 'rgba(239, 68, 68, 0.05)'
                                        : 'rgba(255, 255, 255, 0.02)',
                                      cursor: student.status === 'absent' ? 'pointer' : 'default',
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      {student.status === 'present' ? (
                                        <CheckCircle size={16} style={{ color: '#22c55e' }} />
                                      ) : (
                                        <XCircle size={16} style={{ color: '#ef4444' }} />
                                      )}
                                      <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                                        {student.studentName}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {student.notes && (
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                          {student.notes}
                                        </span>
                                      )}
                                      {student.status === 'absent' && (
                                        <Eye size={14} style={{ color: 'var(--text-tertiary)' }} />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Students List */}
              {selectedGroup.students.length > 0 && (
                <div>
                  <h3
                    className="font-medium mb-4"
                    style={{ color: 'var(--text-primary)', fontSize: '1.125rem' }}
                  >
                    Курсисти ({selectedGroup.students.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedGroup.students.map((student) => {
                      const recoveryInfo = getRecoveryStatusInfo(student.recoveryStatus);
                      const hasIssues = student.recoveryStatus === 'required';

                      return (
                        <div
                          key={student.id}
                          className="rounded-xl p-4"
                          style={{
                            background: 'var(--bg-primary)',
                            border: hasIssues ? '1px solid rgba(239, 68, 68, 0.2)' : 'none',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                              >
                                <User size={18} style={{ color: 'var(--accent-primary)' }} />
                              </div>
                              <div>
                                <p
                                  className="font-medium mb-1"
                                  style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                                >
                                  {student.name}
                                </p>
                                <div className="flex items-center gap-3">
                                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                                    {student.attendanceCount} присъствия
                                  </span>
                                  {student.absenceCount > 0 && (
                                    <span style={{ color: '#fb923c', fontSize: '0.8125rem' }}>
                                      {student.absenceCount} отсъствия
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={recoveryInfo.color}>
                                {recoveryInfo.label}
                              </Badge>
                              {student.messageStatus === 'sent' && (
                                <div
                                  className="p-2 rounded-lg"
                                  style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                                  title="Съобщение изпратено"
                                >
                                  <Mail size={14} style={{ color: 'var(--accent-primary)' }} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-4 rounded-xl p-4" style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.18)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                След маркиране на присъстващите и отсъстващите натиснете "Запази присъствие", за да се изпрати заявка към базата данни за тази лекция и група.
              </p>
            </div>

            {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="primary" icon={<Edit2 size={18} />} fullWidth>
                  Редактиране на група
                </Button>
                <Button variant="secondary" icon={<FileText size={18} />}>
                  Отчет
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal - Placeholder */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Нова теоретична група"
          maxWidth="2xl"
        >
          <div className="space-y-6 p-6">
            <div
              className="rounded-xl p-12 text-center"
              style={{ background: 'var(--bg-primary)' }}
            >
              <p style={{ color: 'var(--text-tertiary)' }}>
                Форма за създаване на нова група ще бъде добавена
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Отказ
              </Button>
              <Button variant="primary">
                Създай група
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && attendanceLecture && selectedGroup && (
        <Modal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          title={`Маркиране на присъствие`}
          maxWidth="3xl"
        >
          <div className="p-6">
            {/* Lecture Info */}
            <div
              className="rounded-xl p-5 mb-6"
              style={{ background: 'var(--bg-primary)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(167, 139, 250, 0.1)' }}
                >
                  <BookOpen size={20} style={{ color: 'var(--accent-ai)' }} />
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: 'var(--text-primary)', fontSize: '1.125rem' }}
                  >
                    Лекция {attendanceLecture.number}: {attendanceLecture.title}
                  </h3>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                    {new Date(attendanceLecture.date).toLocaleDateString('bg-BG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })} • {attendanceLecture.time} - {attendanceLecture.endTime} • {attendanceLecture.instructor}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Курсисти: {selectedGroup.students.length}
              </p>
              <Button
                variant="secondary"
                icon={<UserCheck size={16} />}
                onClick={handleMarkAllPresent}
              >
                Маркирай всички като присъстващи
              </Button>
            </div>

            {/* Student List */}
            <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto">
              {selectedGroup.students.map((student, index) => {
                const currentStatus = attendanceData[student.id] || 'present';
                
                return (
                  <div
                    key={student.id}
                    className="rounded-xl p-5 transition-all"
                    style={{
                      background: currentStatus === 'absent' 
                        ? 'rgba(239, 68, 68, 0.05)'
                        : currentStatus === 'late'
                        ? 'rgba(251, 146, 60, 0.05)'
                        : 'var(--bg-primary)',
                      border: currentStatus === 'absent' 
                        ? '1px solid rgba(239, 68, 68, 0.2)'
                        : currentStatus === 'late'
                        ? '1px solid rgba(251, 146, 60, 0.2)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Student Info */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                        >
                          <User size={18} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div>
                          <p
                            className="font-medium mb-1"
                            style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                          >
                            {student.name}
                          </p>
                          <div className="flex items-center gap-4">
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                              {student.attendanceCount} присъствия
                            </span>
                            {student.absenceCount > 0 && (
                              <span style={{ color: '#fb923c', fontSize: '0.875rem' }}>
                                {student.absenceCount} отсъствия
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Status Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAttendanceData({ ...attendanceData, [student.id]: 'present' })}
                          className="px-5 py-2.5 rounded-lg transition-all font-medium"
                          style={{
                            background: currentStatus === 'present' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: currentStatus === 'present' ? '2px solid #22c55e' : '2px solid transparent',
                            color: currentStatus === 'present' ? '#22c55e' : 'var(--text-secondary)',
                          }}
                        >
                          Присъства
                        </button>
                        <button
                          onClick={() => setAttendanceData({ ...attendanceData, [student.id]: 'late' })}
                          className="px-5 py-2.5 rounded-lg transition-all font-medium"
                          style={{
                            background: currentStatus === 'late' ? 'rgba(251, 146, 60, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: currentStatus === 'late' ? '2px solid #fb923c' : '2px solid transparent',
                            color: currentStatus === 'late' ? '#fb923c' : 'var(--text-secondary)',
                          }}
                        >
                          Закъснял
                        </button>
                        <button
                          onClick={() => setAttendanceData({ ...attendanceData, [student.id]: 'absent' })}
                          className="px-5 py-2.5 rounded-lg transition-all font-medium"
                          style={{
                            background: currentStatus === 'absent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: currentStatus === 'absent' ? '2px solid #ef4444' : '2px solid transparent',
                            color: currentStatus === 'absent' ? '#ef4444' : 'var(--text-secondary)',
                          }}
                        >
                          Отсъства
                        </button>
                        <button
                          onClick={() => setAttendanceData({ ...attendanceData, [student.id]: 'excused' })}
                          className="px-5 py-2.5 rounded-lg transition-all font-medium"
                          style={{
                            background: currentStatus === 'excused' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: currentStatus === 'excused' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            color: currentStatus === 'excused' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          Оправдан
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-4 rounded-xl p-4" style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.18)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                След маркиране на присъстващите и отсъстващите натиснете "Запази присъствие", за да се изпрати заявка към базата данни за тази лекция и група.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <Button
                variant="secondary"
                onClick={() => setIsAttendanceModalOpen(false)}
                fullWidth
              >
                Отказ
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleSubmitAttendance()}
                fullWidth
              >
                Запази присъствие
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Absence Detail Drawer */}
      {isAbsenceDetailOpen && selectedAbsentStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end"
          onClick={() => setIsAbsenceDetailOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl h-full overflow-y-auto"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Drawer Header */}
            <div
              className="sticky top-0 z-10 px-8 py-6 flex items-start justify-between"
              style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div>
                <h2
                  className="text-2xl font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Детайли за отсъствие
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="red">Отсъства</Badge>
                  {selectedAbsentStudent.student.messageStatus === 'sent' && (
                    <Badge variant="blue">Изпратено съобщение</Badge>
                  )}
                  {selectedAbsentStudent.student.recoveryStatus === 'required' && (
                    <Badge variant="red">Нужно възстановяване</Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsAbsenceDetailOpen(false)}
                className="p-2 rounded-lg transition-all hover:bg-white/[0.05]"
              >
                <X size={24} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Student Info */}
              <div
                className="rounded-xl p-6"
                style={{ background: 'var(--bg-primary)' }}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                  >
                    <User size={24} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: 'var(--text-primary)', fontSize: '1.125rem' }}
                    >
                      {selectedAbsentStudent.student.name}
                    </h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                      {selectedAbsentStudent.group.name} • Категория {selectedAbsentStudent.student.category}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '4px' }}>
                      Присъствия
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}
                    >
                      {selectedAbsentStudent.student.attendanceCount}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '4px' }}>
                      Отсъствия
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: '#ef4444', fontSize: '1.25rem' }}
                    >
                      {selectedAbsentStudent.student.absenceCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lecture Info */}
              <div>
                <h3
                  className="font-medium mb-3"
                  style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                >
                  Пропусната лекция
                </h3>
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: 'rgba(167, 139, 250, 0.1)' }}
                    >
                      <BookOpen size={18} style={{ color: 'var(--accent-ai)' }} />
                    </div>
                    <h4
                      className="font-medium"
                      style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                    >
                      Лекция {selectedAbsentStudent.lecture.number}: {selectedAbsentStudent.lecture.title}
                    </h4>
                  </div>
                  <div className="space-y-2 pl-11">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        {new Date(selectedAbsentStudent.lecture.date).toLocaleDateString('bg-BG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        {selectedAbsentStudent.lecture.time} - {selectedAbsentStudent.lecture.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        {selectedAbsentStudent.lecture.instructor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h3
                  className="font-medium mb-3"
                  style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                >
                  Статус и последващи действия
                </h3>
                <div className="space-y-3">
                  {/* Recovery Status */}
                  <div
                    className="rounded-xl p-5"
                    style={{
                      background: selectedAbsentStudent.student.recoveryStatus === 'required'
                        ? 'rgba(239, 68, 68, 0.05)'
                        : 'var(--bg-primary)',
                      border: selectedAbsentStudent.student.recoveryStatus === 'required'
                        ? '1px solid rgba(239, 68, 68, 0.2)'
                        : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle
                          size={20}
                          style={{ color: selectedAbsentStudent.student.recoveryStatus === 'required' ? '#ef4444' : 'var(--text-tertiary)' }}
                        />
                        <div>
                          <p
                            className="font-medium mb-1"
                            style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                          >
                            Възстановяване на часове
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            {selectedAbsentStudent.student.recoveryStatus === 'required'
                              ? 'Курсистът трябва да посети допълнителна лекция'
                              : 'Не се изисква възстановяване'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getRecoveryStatusInfo(selectedAbsentStudent.student.recoveryStatus).color}>
                        {getRecoveryStatusInfo(selectedAbsentStudent.student.recoveryStatus).label}
                      </Badge>
                    </div>
                  </div>

                  {/* Message Status */}
                  <div
                    className="rounded-xl p-5"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail size={20} style={{ color: selectedAbsentStudent.student.messageStatus === 'sent' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                        <div>
                          <p
                            className="font-medium mb-1"
                            style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                          >
                            Автоматично съобщение
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            {selectedAbsentStudent.student.messageStatus === 'sent'
                              ? 'SMS изпратено до родител за отсъствието'
                              : 'Съобщение не е изпращано'}
                          </p>
                        </div>
                      </div>
                      {selectedAbsentStudent.student.messageStatus === 'sent' && (
                        <Badge variant="blue">Изпратено</Badge>
                      )}
                    </div>
                  </div>

                  {/* Financial Impact */}
                  {selectedAbsentStudent.student.dueAmount && (
                    <div
                      className="rounded-xl p-5"
                      style={{
                        background: 'rgba(251, 146, 60, 0.05)',
                        border: '1px solid rgba(251, 146, 60, 0.2)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle size={20} style={{ color: '#fb923c' }} />
                          <div>
                            <p
                              className="font-medium mb-1"
                              style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                            >
                              Такса за възстановяване
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                              Дължима сума за допълнителна лекция
                            </p>
                          </div>
                        </div>
                        <span
                          className="font-semibold"
                          style={{ color: '#fb923c', fontSize: '1.125rem' }}
                        >
                          {selectedAbsentStudent.student.dueAmount} лв
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h3
                  className="font-medium mb-4"
                  style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                >
                  История на активност
                </h3>
                <div className="space-y-4">
                  {/* Timeline Item 1 */}
                  <div className="flex gap-4">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        <XCircle size={18} style={{ color: '#ef4444' }} />
                      </div>
                      <div
                        className="absolute left-1/2 top-10 bottom-0 w-px -translate-x-1/2"
                        style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                      />
                    </div>
                    <div className="flex-1 pb-6">
                      <p
                        className="font-medium mb-1"
                        style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                      >
                        Отсъствие регистрирано
                      </p>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '6px' }}>
                        Курсистът не се яви на лекцията
                      </p>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                        {new Date(selectedAbsentStudent.lecture.date).toLocaleDateString('bg-BG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })} • 12:05
                      </p>
                    </div>
                  </div>

                  {/* Timeline Item 2 */}
                  {selectedAbsentStudent.student.messageStatus === 'sent' && (
                    <div className="flex gap-4">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                        >
                          <Send size={18} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div
                          className="absolute left-1/2 top-10 bottom-0 w-px -translate-x-1/2"
                          style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                        />
                      </div>
                      <div className="flex-1 pb-6">
                        <p
                          className="font-medium mb-1"
                          style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                        >
                          SMS изпратено до родител
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '6px' }}>
                          Автоматично уведомление за пропуснатата лекция
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                          {new Date(selectedAbsentStudent.lecture.date).toLocaleDateString('bg-BG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })} • 12:10
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Timeline Item 3 */}
                  {selectedAbsentStudent.student.recoveryStatus === 'required' && (
                    <div className="flex gap-4">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                        </div>
                      </div>
                      <div className="flex-1 pb-6">
                        <p
                          className="font-medium mb-1"
                          style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                        >
                          Маркирано за възстановяване
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '6px' }}>
                          Курсистът трябва да посети допълнителна лекция
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                          {new Date(selectedAbsentStudent.lecture.date).toLocaleDateString('bg-BG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })} • 12:15
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* System Metadata */}
              <div
                className="rounded-xl p-5"
                style={{ background: 'var(--bg-primary)', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <h4
                  className="font-medium mb-3"
                  style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                >
                  Системна информация
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Създадено от:
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Система (автоматично)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Последна промяна:
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(selectedAbsentStudent.lecture.date).toLocaleDateString('bg-BG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })} • 12:15
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-xl p-4" style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.18)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                След маркиране на присъстващите и отсъстващите натиснете "Запази присъствие", за да се изпрати заявка към базата данни за тази лекция и група.
              </p>
            </div>

            {/* Actions */}
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Button variant="secondary" icon={<Mail size={18} />} fullWidth>
                  Изпрати напомняне
                </Button>
                <Button variant="primary" icon={<CalendarIcon size={18} />} fullWidth>
                  Планирай възстановяване
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isWithinCurrentWeek(dateValue: string) {
  const value = new Date(`${dateValue}T12:00:00`);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return value >= weekStart && value <= weekEnd;
}

function exportTheoryGroupsCsv(groups: TheoryGroup[]) {
  const rows = [
    'name;category;startDate;status;studentCount;totalLectures;completedLectures;averageAttendance;students',
    ...groups.map((group) =>
      [
        group.name,
        group.category,
        group.startDate,
        getGroupStatusInfo(group.status).label,
        group.studentCount,
        group.totalLectures,
        group.completedLectures,
        group.averageAttendance.toFixed(1),
        group.students.map((student) => student.name).join(' | '),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(';'),
    ),
  ];
  const blob = new Blob([`\uFEFF${rows.join('\n')}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'theory_groups_export.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
