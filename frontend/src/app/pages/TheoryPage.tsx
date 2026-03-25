import { useState } from 'react';
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

type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';
type RecoveryStatus = 'not-required' | 'required' | 'in-progress' | 'completed';
type MessageStatus = 'not-sent' | 'sent' | 'scheduled';

type TheoryStudent = {
  id: number;
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
  id: number;
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
    studentId: number;
    studentName: string;
    status: AttendanceStatus;
    notes?: string;
  }>;
};

type TheoryGroup = {
  id: number;
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

const MOCK_THEORY_GROUPS: TheoryGroup[] = [
  {
    id: 1,
    name: 'B-2024-03-Ð£Ñ‚Ñ€Ð¾',
    category: 'B',
    startDate: '2024-03-01',
    studentCount: 18,
    totalLectures: 28,
    completedLectures: 12,
    activeStudents: 17,
    studentsWithAbsences: 5,
    studentsNeedingRecovery: 2,
    averageAttendance: 94.5,
    status: 'active',
    schedule: 'ÐŸÐ¾Ð½ÐµÐ´ÐµÐ»Ð½Ð¸Ðº Ð¸ Ð¡Ñ€ÑÐ´Ð°, 09:00 - 12:00',
    lectures: [
      {
        id: 101,
        number: 13,
        title: 'ÐŸÑŠÑ‚Ð½Ð¸ Ð·Ð½Ð°Ñ†Ð¸ - Ð¿Ñ€Ð¾Ð´ÑŠÐ»Ð¶ÐµÐ½Ð¸Ðµ',
        date: '2024-03-24',
        time: '09:00',
        endTime: '12:00',
        duration: 180,
        instructor: 'Ð˜Ð²Ð°Ð½ ÐŸÐµÑ‚Ñ€Ð¾Ð²',
        location: 'Ð—Ð°Ð»Ð° 1',
        attendanceCount: 16,
        absentCount: 2,
        lateCount: 0,
        status: 'scheduled',
      },
      {
        id: 102,
        number: 12,
        title: 'ÐžÑÐ½Ð¾Ð²Ð½Ð¸ Ð¿ÑŠÑ‚Ð½Ð¸ Ð·Ð½Ð°Ñ†Ð¸',
        date: '2024-03-22',
        time: '09:00',
        endTime: '12:00',
        duration: 180,
        instructor: 'Ð˜Ð²Ð°Ð½ ÐŸÐµÑ‚Ñ€Ð¾Ð²',
        location: 'Ð—Ð°Ð»Ð° 1',
        attendanceCount: 17,
        absentCount: 1,
        lateCount: 0,
        status: 'completed',
        students: [
          { studentId: 1, studentName: 'ÐœÐ°Ñ€Ð¸Ñ Ð˜Ð²Ð°Ð½Ð¾Ð²Ð°', status: 'present' },
          { studentId: 2, studentName: 'Ð“ÐµÐ¾Ñ€Ð³Ð¸ Ð”Ð¸Ð¼Ð¸Ñ‚Ñ€Ð¾Ð²', status: 'present' },
          { studentId: 3, studentName: 'Ð•Ð»ÐµÐ½Ð° Ð¡Ñ‚Ð¾ÑÐ½Ð¾Ð²Ð°', status: 'absent', notes: 'Ð˜Ð·Ð¿Ñ€Ð°Ñ‚ÐµÐ½Ð¾ SMS Ð½Ð° Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»' },
        ],
      },
    ],
    students: [
      {
        id: 1,
        name: 'ÐœÐ°Ñ€Ð¸Ñ Ð˜Ð²Ð°Ð½Ð¾Ð²Ð°',
        category: 'B',
        phone: '+359 88 123 4567',
        email: 'maria@example.com',
        attendanceCount: 12,
        absenceCount: 0,
        recoveryStatus: 'not-required',
        messageStatus: 'not-sent',
      },
      {
        id: 2,
        name: 'Ð“ÐµÐ¾Ñ€Ð³Ð¸ Ð”Ð¸Ð¼Ð¸Ñ‚Ñ€Ð¾Ð²',
        category: 'B',
        phone: '+359 88 234 5678',
        email: 'georgi@example.com',
        attendanceCount: 11,
        absenceCount: 1,
        recoveryStatus: 'not-required',
        messageStatus: 'not-sent',
      },
      {
        id: 3,
        name: 'Ð•Ð»ÐµÐ½Ð° Ð¡Ñ‚Ð¾ÑÐ½Ð¾Ð²Ð°',
        category: 'B',
        phone: '+359 88 345 6789',
        email: 'elena@example.com',
        attendanceCount: 9,
        absenceCount: 3,
        recoveryStatus: 'required',
        messageStatus: 'sent',
        dueAmount: 25,
        lastAbsenceDate: '2024-03-22',
      },
    ],
  },
  {
    id: 2,
    name: 'B-2024-03-Ð’ÐµÑ‡ÐµÑ€',
    category: 'B',
    startDate: '2024-03-04',
    studentCount: 22,
    totalLectures: 28,
    completedLectures: 11,
    activeStudents: 21,
    studentsWithAbsences: 8,
    studentsNeedingRecovery: 1,
    averageAttendance: 91.2,
    status: 'active',
    schedule: 'Ð’Ñ‚Ð¾Ñ€Ð½Ð¸Ðº Ð¸ Ð§ÐµÑ‚Ð²ÑŠÑ€Ñ‚ÑŠÐº, 18:00 - 21:00',
    lectures: [
      {
        id: 201,
        number: 12,
        title: 'ÐŸÑŠÑ‚Ð½Ð° Ð¼Ð°Ñ€ÐºÐ¸Ñ€Ð¾Ð²ÐºÐ°',
        date: '2024-03-23',
        time: '18:00',
        endTime: '21:00',
        duration: 180,
        instructor: 'ÐœÐ°Ñ€Ð¸Ñ Ð“ÐµÐ¾Ñ€Ð³Ð¸ÐµÐ²Ð°',
        location: 'Ð—Ð°Ð»Ð° 2',
        attendanceCount: 20,
        absentCount: 2,
        lateCount: 0,
        status: 'completed',
      },
    ],
    students: [],
  },
  {
    id: 3,
    name: 'A-2024-02-Ð¡ÑŠÐ±Ð¾Ñ‚Ð°',
    category: 'A',
    startDate: '2024-02-10',
    studentCount: 12,
    totalLectures: 20,
    completedLectures: 18,
    activeStudents: 12,
    studentsWithAbsences: 3,
    studentsNeedingRecovery: 0,
    averageAttendance: 96.8,
    status: 'active',
    schedule: 'Ð¡ÑŠÐ±Ð¾Ñ‚Ð°, 10:00 - 16:00',
    lectures: [],
    students: [],
  },
  {
    id: 4,
    name: 'B-2024-02-Ð£Ñ‚Ñ€Ð¾',
    category: 'B',
    startDate: '2024-02-01',
    endDate: '2024-03-15',
    studentCount: 20,
    totalLectures: 28,
    completedLectures: 28,
    activeStudents: 20,
    studentsWithAbsences: 4,
    studentsNeedingRecovery: 0,
    averageAttendance: 97.5,
    status: 'completed',
    schedule: 'ÐŸÐ¾Ð½ÐµÐ´ÐµÐ»Ð½Ð¸Ðº Ð¸ Ð¡Ñ€ÑÐ´Ð°, 09:00 - 12:00',
    lectures: [],
    students: [],
  },
];

const getRecoveryStatusInfo = (status: RecoveryStatus) => {
  switch (status) {
    case 'not-required':
      return { label: 'ÐÐµ Ðµ Ð½ÑƒÐ¶Ð½Ð¾', color: 'gray' as const };
    case 'required':
      return { label: 'Ð˜Ð·Ð¸ÑÐºÐ²Ð° ÑÐµ', color: 'red' as const };
    case 'in-progress':
      return { label: 'Ð’ Ð¿Ñ€Ð¾Ñ†ÐµÑ', color: 'orange' as const };
    case 'completed':
      return { label: 'Ð—Ð°Ð²ÑŠÑ€ÑˆÐµÐ½Ð¾', color: 'green' as const };
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
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<TheoryGroup | null>(null);
  const [isGroupDetailOpen, setIsGroupDetailOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedLecture, setExpandedLecture] = useState<number | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceLecture, setAttendanceLecture] = useState<TheoryLecture | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<number, AttendanceStatus>>({});
  const [selectedAbsentStudent, setSelectedAbsentStudent] = useState<{
    student: TheoryStudent;
    lecture: TheoryLecture;
    group: TheoryGroup;
  } | null>(null);
  const [isAbsenceDetailOpen, setIsAbsenceDetailOpen] = useState(false);

  // Calculate summary statistics
  const activeGroups = MOCK_THEORY_GROUPS.filter(g => g.status === 'active');
  const todayLectures = MOCK_THEORY_GROUPS.flatMap(g => 
    g.lectures.filter(l => l.date === '2024-03-24' || l.date === '2026-03-24')
  );
  const totalPresentToday = todayLectures.reduce((sum, l) => sum + l.attendanceCount, 0);
  const totalAbsentToday = todayLectures.reduce((sum, l) => sum + l.absentCount, 0);
  const studentsNeedingRecovery = MOCK_THEORY_GROUPS.reduce((sum, g) => sum + g.studentsNeedingRecovery, 0);
  const messagesAutomated = MOCK_THEORY_GROUPS.flatMap(g => g.students).filter(s => s.messageStatus === 'sent').length;
  const groupsNearingCompletion = MOCK_THEORY_GROUPS.filter(g => 
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
    const initialData: Record<number, AttendanceStatus> = {};
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
    const newData: Record<number, AttendanceStatus> = {};
    selectedGroup.students.forEach(s => {
      newData[s.id] = 'present';
    });
    setAttendanceData(newData);
  };

  const handleSubmitAttendance = () => {
    console.log('Submitting attendance:', attendanceData);
    setIsAttendanceModalOpen(false);
    setAttendanceData({});
  };

  const handleViewAbsentStudent = (student: TheoryStudent, lecture: TheoryLecture, group: TheoryGroup) => {
    setSelectedAbsentStudent({ student, lecture, group });
    setIsAbsenceDetailOpen(true);
  };

  const toggleLecture = (lectureId: number) => {
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
        title="Ð¢ÐµÐ¾Ñ€Ð¸Ñ"
        description="Ð£Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ Ð½Ð° Ñ‚ÐµÐ¾Ñ€ÐµÑ‚Ð¸Ñ‡Ð½Ð¾ Ð¾Ð±ÑƒÑ‡ÐµÐ½Ð¸Ðµ, Ð³Ñ€ÑƒÐ¿Ð¸, Ð»ÐµÐºÑ†Ð¸Ð¸ Ð¸ Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ðµ"
        breadcrumbs={[
          { label: 'ÐÐ°Ñ‡Ð°Ð»Ð¾', onClick: () => navigate('/') },
          { label: 'Ð¢ÐµÐ¾Ñ€Ð¸Ñ' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<AlertTriangle size={18} />}
              onClick={() => addFilter('needs-recovery')}
            >
              ÐÑƒÐ¶Ð½Ð¾ Ð²ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ ({studentsNeedingRecovery})
            </Button>
            <Button
              variant="secondary"
              icon={<CalendarIcon size={18} />}
              onClick={() => addFilter('today')}
            >
              Ð”Ð½ÐµÑ
            </Button>
            <Button
              variant="secondary"
              icon={<Download size={18} />}
            >
              Ð•ÐºÑÐ¿Ð¾Ñ€Ñ‚
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              ÐÐ¾Ð²Ð° Ð³Ñ€ÑƒÐ¿Ð°
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="px-6 lg:px-8 py-6">
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
              ÐÐºÑ‚Ð¸Ð²Ð½Ð¸ Ð³Ñ€ÑƒÐ¿Ð¸
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
              Ð›ÐµÐºÑ†Ð¸Ð¸ Ð´Ð½ÐµÑ
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
              ÐŸÑ€Ð¸ÑÑŠÑÑ‚Ð²Ð°Ñ‰Ð¸ Ð´Ð½ÐµÑ
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
              ÐžÑ‚ÑÑŠÑÑ‚Ð²Ð°Ñ‰Ð¸ Ð´Ð½ÐµÑ
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
              Ð˜Ð·Ð¿Ñ€Ð°Ñ‚ÐµÐ½Ð¸ ÑÑŠÐ¾Ð±Ñ‰ÐµÐ½Ð¸Ñ
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
              ÐÑƒÐ¶Ð½Ð¾ Ð²ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ
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
              Ð‘Ð»Ð¸Ð·Ð¾ Ð´Ð¾ Ð·Ð°Ð²ÑŠÑ€ÑˆÐ²Ð°Ð½Ðµ
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
                placeholder="Ð¢ÑŠÑ€ÑÐµÐ½Ðµ Ð¿Ð¾ Ð¸Ð¼Ðµ Ð½Ð° Ð³Ñ€ÑƒÐ¿Ð° Ð¸Ð»Ð¸ ÐºÑƒÑ€ÑÐ¸ÑÑ‚..."
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
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[160px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option>Ð’ÑÐ¸Ñ‡ÐºÐ¸ ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸</option>
              <option>ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ñ A</option>
              <option>ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ñ B</option>
              <option>ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ñ C</option>
            </select>

            {/* Status Filter */}
            <select
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[160px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option>Ð’ÑÐ¸Ñ‡ÐºÐ¸ Ð³Ñ€ÑƒÐ¿Ð¸</option>
              <option>ÐÐºÑ‚Ð¸Ð²Ð½Ð¸</option>
              <option>Ð—Ð°Ð²ÑŠÑ€ÑˆÐµÐ½Ð¸</option>
              <option>ÐŸÑ€ÐµÐ´ÑÑ‚Ð¾ÑÑ‰Ð¸</option>
            </select>

            {/* Date Filter */}
            <select
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[160px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option>Ð’ÑÐ¸Ñ‡ÐºÐ¸ Ð´Ð°Ñ‚Ð¸</option>
              <option>Ð”Ð½ÐµÑ</option>
              <option>Ð¢Ð°Ð·Ð¸ ÑÐµÐ´Ð¼Ð¸Ñ†Ð°</option>
              <option>Ð¢Ð¾Ð·Ð¸ Ð¼ÐµÑÐµÑ†</option>
            </select>

            {/* More Filters Button */}
            <Button variant="secondary" icon={<Filter size={16} />}>
              Ð¤Ð¸Ð»Ñ‚Ñ€Ð¸
            </Button>
          </div>

          {/* Active Filters Pills */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                ÐÐºÑ‚Ð¸Ð²Ð½Ð¸ Ñ„Ð¸Ð»Ñ‚Ñ€Ð¸:
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
                Ð˜Ð·Ñ‡Ð¸ÑÑ‚Ð¸ Ð²ÑÐ¸Ñ‡ÐºÐ¸
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Theory Groups List */}
      <div className="px-6 lg:px-8 pb-8">
        {MOCK_THEORY_GROUPS.length === 0 ? (
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
              ÐÑÐ¼Ð° Ñ‚ÐµÐ¾Ñ€ÐµÑ‚Ð¸Ñ‡Ð½Ð¸ Ð³Ñ€ÑƒÐ¿Ð¸
            </h3>
            <p
              className="mb-8 max-w-md mx-auto"
              style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}
            >
              Ð¡ÑŠÐ·Ð´Ð°Ð¹Ñ‚Ðµ Ð¿ÑŠÑ€Ð²Ð°Ñ‚Ð° Ñ‚ÐµÐ¾Ñ€ÐµÑ‚Ð¸Ñ‡Ð½Ð° Ð³Ñ€ÑƒÐ¿Ð°, Ð·Ð° Ð´Ð° Ð·Ð°Ð¿Ð¾Ñ‡Ð½ÐµÑ‚Ðµ ÑƒÐ¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸ÐµÑ‚Ð¾ Ð½Ð° Ð»ÐµÐºÑ†Ð¸Ð¸ Ð¸ Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ðµ
            </p>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Ð¡ÑŠÐ·Ð´Ð°Ð¹ Ð¿ÑŠÑ€Ð²Ð° Ð³Ñ€ÑƒÐ¿Ð°
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_THEORY_GROUPS.map((group) => {
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
                          ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ñ {group.category}
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
                            {group.studentCount} ÐºÑƒÑ€ÑÐ¸ÑÑ‚Ð¸
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {group.completedLectures} / {group.totalLectures} Ð»ÐµÐºÑ†Ð¸Ð¸
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {group.averageAttendance.toFixed(1)}% Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ðµ
                          </span>
                        </div>
                        {group.studentsWithAbsences > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} style={{ color: '#fb923c' }} />
                            <span style={{ color: '#fb923c', fontSize: '0.9375rem' }}>
                              {group.studentsWithAbsences} Ñ Ð¾Ñ‚ÑÑŠÑÑ‚Ð²Ð¸Ñ
                            </span>
                          </div>
                        )}
                        {group.studentsNeedingRecovery > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                            <span style={{ color: '#ef4444', fontSize: '0.9375rem', fontWeight: 500 }}>
                              {group.studentsNeedingRecovery} Ð½ÑƒÐ¶Ð½Ð¾ Ð²ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ
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
                          ÐŸÑ€Ð¾Ð³Ñ€ÐµÑ
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
                      ÐšÑƒÑ€ÑÐ¸ÑÑ‚Ð¸
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
                      Ð›ÐµÐºÑ†Ð¸Ð¸
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
                      Ð¡Ñ€ÐµÐ´Ð½Ð¾ Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ðµ
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
                  Ð›ÐµÐºÑ†Ð¸Ð¸
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
                                  Ð›ÐµÐºÑ†Ð¸Ñ {lecture.number}: {lecture.title}
                                </span>
                                {lecture.status === 'completed' && (
                                  <CheckCircle size={16} style={{ color: '#22c55e' }} />
                                )}
                                {lecture.status === 'scheduled' && isToday && (
                                  <Badge variant="purple">Ð”Ð½ÐµÑ</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                  {new Date(lecture.date).toLocaleDateString('bg-BG', {
                                    day: 'numeric',
                                    month: 'short',
                                  })} â€¢ {lecture.time} - {lecture.endTime}
                                </span>
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                  {lecture.instructor}
                                </span>
                                {lecture.status === 'completed' && (
                                  <>
                                    <span style={{ color: '#22c55e', fontSize: '0.875rem' }}>
                                      {lecture.attendanceCount} Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð°Ñ‰Ð¸
                                    </span>
                                    {lecture.absentCount > 0 && (
                                      <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                                        {lecture.absentCount} Ð¾Ñ‚ÑÑŠÑÑ‚Ð²Ð°Ñ‰Ð¸
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
                                  ÐœÐ°Ñ€ÐºÐ¸Ñ€Ð°Ð¹ Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ðµ
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
                                  ÐŸÑ€ÐµÐ³Ð»ÐµÐ´
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
                              ÐŸÑ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ðµ
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
                    ÐšÑƒÑ€ÑÐ¸ÑÑ‚Ð¸ ({selectedGroup.students.length})
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
                                    {student.attendanceCount} Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ñ
                                  </span>
                                  {student.absenceCount > 0 && (
                                    <span style={{ color: '#fb923c', fontSize: '0.8125rem' }}>
                                      {student.absenceCount} Ð¾Ñ‚ÑÑŠÑÑ‚Ð²Ð¸Ñ
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
                                  title="Ð¡ÑŠÐ¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ Ð¸Ð·Ð¿Ñ€Ð°Ñ‚ÐµÐ½Ð¾"
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

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="primary" icon={<Edit2 size={18} />} fullWidth>
                  Ð ÐµÐ´Ð°ÐºÑ‚Ð¸Ñ€Ð°Ð½Ðµ Ð½Ð° Ð³Ñ€ÑƒÐ¿Ð°
                </Button>
                <Button variant="secondary" icon={<FileText size={18} />}>
                  ÐžÑ‚Ñ‡ÐµÑ‚
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
          title="ÐÐ¾Ð²Ð° Ñ‚ÐµÐ¾Ñ€ÐµÑ‚Ð¸Ñ‡Ð½Ð° Ð³Ñ€ÑƒÐ¿Ð°"
          maxWidth="2xl"
        >
          <div className="space-y-6 p-6">
            <div
              className="rounded-xl p-12 text-center"
              style={{ background: 'var(--bg-primary)' }}
            >
              <p style={{ color: 'var(--text-tertiary)' }}>
                Ð¤Ð¾Ñ€Ð¼Ð° Ð·Ð° ÑÑŠÐ·Ð´Ð°Ð²Ð°Ð½Ðµ Ð½Ð° Ð½Ð¾Ð²Ð° Ð³Ñ€ÑƒÐ¿Ð° Ñ‰Ðµ Ð±ÑŠÐ´Ðµ Ð´Ð¾Ð±Ð°Ð²ÐµÐ½Ð°
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                ÐžÑ‚ÐºÐ°Ð·
              </Button>
              <Button variant="primary">
                Ð¡ÑŠÐ·Ð´Ð°Ð¹ Ð³Ñ€ÑƒÐ¿Ð°
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
          title={`ÐœÐ°Ñ€ÐºÐ¸Ñ€Ð°Ð½Ðµ Ð½Ð° Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ðµ`}
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
                    Ð›ÐµÐºÑ†Ð¸Ñ {attendanceLecture.number}: {attendanceLecture.title}
                  </h3>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                    {new Date(attendanceLecture.date).toLocaleDateString('bg-BG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })} â€¢ {attendanceLecture.time} - {attendanceLecture.endTime} â€¢ {attendanceLecture.instructor}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                ÐšÑƒÑ€ÑÐ¸ÑÑ‚Ð¸: {selectedGroup.students.length}
              </p>
              <Button
                variant="secondary"
                icon={<UserCheck size={16} />}
                onClick={handleMarkAllPresent}
              >
                ÐœÐ°Ñ€ÐºÐ¸Ñ€Ð°Ð¹ Ð²ÑÐ¸Ñ‡ÐºÐ¸ ÐºÐ°Ñ‚Ð¾ Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð°Ñ‰Ð¸
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
                              {student.attendanceCount} Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ñ
                            </span>
                            {student.absenceCount > 0 && (
                              <span style={{ color: '#fb923c', fontSize: '0.875rem' }}>
                                {student.absenceCount} Ð¾Ñ‚ÑÑŠÑÑ‚Ð²Ð¸Ñ
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
                          ÐŸÑ€Ð¸ÑÑŠÑÑ‚Ð²Ð°
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
                          Ð—Ð°ÐºÑŠÑÐ½ÑÐ»
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
                          ÐžÑ‚ÑÑŠÑÑ‚Ð²Ð°
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
                          ÐžÐ¿Ñ€Ð°Ð²Ð´Ð°Ð½
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <Button
                variant="secondary"
                onClick={() => setIsAttendanceModalOpen(false)}
                fullWidth
              >
                ÐžÑ‚ÐºÐ°Ð·
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitAttendance}
                fullWidth
              >
                Ð—Ð°Ð¿Ð°Ð·Ð¸ Ð¿Ñ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ðµ
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
                  Ð”ÐµÑ‚Ð°Ð¹Ð»Ð¸ Ð·Ð° Ð¾Ñ‚ÑÑŠÑÑ‚Ð²Ð¸Ðµ
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="red">ÐžÑ‚ÑÑŠÑÑ‚Ð²Ð°</Badge>
                  {selectedAbsentStudent.student.messageStatus === 'sent' && (
                    <Badge variant="blue">Ð˜Ð·Ð¿Ñ€Ð°Ñ‚ÐµÐ½Ð¾ ÑÑŠÐ¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ</Badge>
                  )}
                  {selectedAbsentStudent.student.recoveryStatus === 'required' && (
                    <Badge variant="red">ÐÑƒÐ¶Ð½Ð¾ Ð²ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ</Badge>
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
                      {selectedAbsentStudent.group.name} â€¢ ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ñ {selectedAbsentStudent.student.category}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '4px' }}>
                      ÐŸÑ€Ð¸ÑÑŠÑÑ‚Ð²Ð¸Ñ
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
                      ÐžÑ‚ÑÑŠÑÑ‚Ð²Ð¸Ñ
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
                  ÐŸÑ€Ð¾Ð¿ÑƒÑÐ½Ð°Ñ‚Ð° Ð»ÐµÐºÑ†Ð¸Ñ
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
                      Ð›ÐµÐºÑ†Ð¸Ñ {selectedAbsentStudent.lecture.number}: {selectedAbsentStudent.lecture.title}
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
                  Ð¡Ñ‚Ð°Ñ‚ÑƒÑ Ð¸ Ð¿Ð¾ÑÐ»ÐµÐ´Ð²Ð°Ñ‰Ð¸ Ð´ÐµÐ¹ÑÑ‚Ð²Ð¸Ñ
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
                            Ð’ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ Ð½Ð° Ñ‡Ð°ÑÐ¾Ð²Ðµ
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            {selectedAbsentStudent.student.recoveryStatus === 'required'
                              ? 'ÐšÑƒÑ€ÑÐ¸ÑÑ‚ÑŠÑ‚ Ñ‚Ñ€ÑÐ±Ð²Ð° Ð´Ð° Ð¿Ð¾ÑÐµÑ‚Ð¸ Ð´Ð¾Ð¿ÑŠÐ»Ð½Ð¸Ñ‚ÐµÐ»Ð½Ð° Ð»ÐµÐºÑ†Ð¸Ñ'
                              : 'ÐÐµ ÑÐµ Ð¸Ð·Ð¸ÑÐºÐ²Ð° Ð²ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ'}
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
                            ÐÐ²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ñ‡Ð½Ð¾ ÑÑŠÐ¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            {selectedAbsentStudent.student.messageStatus === 'sent'
                              ? 'SMS Ð¸Ð·Ð¿Ñ€Ð°Ñ‚ÐµÐ½Ð¾ Ð´Ð¾ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ» Ð·Ð° Ð¾Ñ‚ÑÑŠÑÑ‚Ð²Ð¸ÐµÑ‚Ð¾'
                              : 'Ð¡ÑŠÐ¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ Ð½Ðµ Ðµ Ð¸Ð·Ð¿Ñ€Ð°Ñ‰Ð°Ð½Ð¾'}
                          </p>
                        </div>
                      </div>
                      {selectedAbsentStudent.student.messageStatus === 'sent' && (
                        <Badge variant="blue">Ð˜Ð·Ð¿Ñ€Ð°Ñ‚ÐµÐ½Ð¾</Badge>
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
                              Ð¢Ð°ÐºÑÐ° Ð·Ð° Ð²ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                              Ð”ÑŠÐ»Ð¶Ð¸Ð¼Ð° ÑÑƒÐ¼Ð° Ð·Ð° Ð´Ð¾Ð¿ÑŠÐ»Ð½Ð¸Ñ‚ÐµÐ»Ð½Ð° Ð»ÐµÐºÑ†Ð¸Ñ
                            </p>
                          </div>
                        </div>
                        <span
                          className="font-semibold"
                          style={{ color: '#fb923c', fontSize: '1.125rem' }}
                        >
                          {selectedAbsentStudent.student.dueAmount} Ð»Ð²
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
                  Ð˜ÑÑ‚Ð¾Ñ€Ð¸Ñ Ð½Ð° Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¾ÑÑ‚
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
                        ÐžÑ‚ÑÑŠÑÑ‚Ð²Ð¸Ðµ Ñ€ÐµÐ³Ð¸ÑÑ‚Ñ€Ð¸Ñ€Ð°Ð½Ð¾
                      </p>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '6px' }}>
                        ÐšÑƒÑ€ÑÐ¸ÑÑ‚ÑŠÑ‚ Ð½Ðµ ÑÐµ ÑÐ²Ð¸ Ð½Ð° Ð»ÐµÐºÑ†Ð¸ÑÑ‚Ð°
                      </p>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                        {new Date(selectedAbsentStudent.lecture.date).toLocaleDateString('bg-BG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })} â€¢ 12:05
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
                          SMS Ð¸Ð·Ð¿Ñ€Ð°Ñ‚ÐµÐ½Ð¾ Ð´Ð¾ Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '6px' }}>
                          ÐÐ²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ñ‡Ð½Ð¾ ÑƒÐ²ÐµÐ´Ð¾Ð¼Ð»ÐµÐ½Ð¸Ðµ Ð·Ð° Ð¿Ñ€Ð¾Ð¿ÑƒÑÐ½Ð°Ñ‚Ð°Ñ‚Ð° Ð»ÐµÐºÑ†Ð¸Ñ
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                          {new Date(selectedAbsentStudent.lecture.date).toLocaleDateString('bg-BG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })} â€¢ 12:10
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
                          ÐœÐ°Ñ€ÐºÐ¸Ñ€Ð°Ð½Ð¾ Ð·Ð° Ð²ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '6px' }}>
                          ÐšÑƒÑ€ÑÐ¸ÑÑ‚ÑŠÑ‚ Ñ‚Ñ€ÑÐ±Ð²Ð° Ð´Ð° Ð¿Ð¾ÑÐµÑ‚Ð¸ Ð´Ð¾Ð¿ÑŠÐ»Ð½Ð¸Ñ‚ÐµÐ»Ð½Ð° Ð»ÐµÐºÑ†Ð¸Ñ
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                          {new Date(selectedAbsentStudent.lecture.date).toLocaleDateString('bg-BG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })} â€¢ 12:15
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
                  Ð¡Ð¸ÑÑ‚ÐµÐ¼Ð½Ð° Ð¸Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸Ñ
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Ð¡ÑŠÐ·Ð´Ð°Ð´ÐµÐ½Ð¾ Ð¾Ñ‚:
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Ð¡Ð¸ÑÑ‚ÐµÐ¼Ð° (Ð°Ð²Ñ‚Ð¾Ð¼Ð°Ñ‚Ð¸Ñ‡Ð½Ð¾)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      ÐŸÐ¾ÑÐ»ÐµÐ´Ð½Ð° Ð¿Ñ€Ð¾Ð¼ÑÐ½Ð°:
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(selectedAbsentStudent.lecture.date).toLocaleDateString('bg-BG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })} â€¢ 12:15
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Button variant="secondary" icon={<Mail size={18} />} fullWidth>
                  Ð˜Ð·Ð¿Ñ€Ð°Ñ‚Ð¸ Ð½Ð°Ð¿Ð¾Ð¼Ð½ÑÐ½Ðµ
                </Button>
                <Button variant="primary" icon={<CalendarIcon size={18} />} fullWidth>
                  ÐŸÐ»Ð°Ð½Ð¸Ñ€Ð°Ð¹ Ð²ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
