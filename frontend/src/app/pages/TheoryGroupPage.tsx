import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { 
  PageHeader, Badge, Button 
} from '../components/shared';
import { 
  ArrowLeft, Download, Calendar as CalendarIcon, 
  Clock, Users, BookOpen, CheckCircle, 
  ChevronDown, ChevronUp, User, MessageCircle,
  AlertCircle, TrendingUp, Target, MapPin, Phone
} from 'lucide-react';
import {
  fetchTheoryGroups,
  saveTheoryLectureAttendance,
  type TheoryApiGroup,
} from '../services/theoryApi';
import { useAuthSession } from '../services/authSession';

type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late' | 'not-marked';

type Student = {
  id: string;
  name: string;
  phone: string;
  parentPhone?: string;
  category: string;
  attendanceCount: number;
  absenceCount: number;
};

type LectureAttendance = {
  studentId: string;
  status: AttendanceStatus;
  viber: boolean;
  markedAt?: string;
  markedBy?: string;
};

type Lecture = {
  id: string;
  number: number;
  title: string;
  date: string;
  time: string;
  endTime: string;
  instructor: string;
  location: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'canceled';
  attendance: LectureAttendance[];
};

type TheoryGroup = {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate?: string;
  schedule: string;
  totalLectures: number;
  completedLectures: number;
  students: Student[];
  lectures: Lecture[];
};

function exportTheoryGroupAttendanceCsv(group: TheoryGroup) {
  const header = [
    'Група',
    'Лекция',
    'Дата',
    'Курсист',
    'Телефон',
    'Статус',
    'Viber',
  ];

  const rows = group.lectures.flatMap((lecture) =>
    group.students.map((student) => {
      const attendance = lecture.attendance.find(
        (record) => record.studentId === student.id,
      );

      return [
        group.name,
        `${lecture.number}. ${lecture.title}`,
        lecture.date,
        student.name,
        student.phone,
        attendance?.status ?? 'not-marked',
        attendance?.viber ? 'sent' : 'not-sent',
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    }),
  );

  const csvContent = [header.join(','), ...rows].join('\n');
  const csvBlob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const downloadUrl = URL.createObjectURL(csvBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = `theory-group-${group.name}-attendance.csv`;
  downloadLink.click();
  URL.revokeObjectURL(downloadUrl);
}

function normalizeTheoryGroupForDetails(group: TheoryApiGroup): TheoryGroup {
  return {
    ...group,
    lectures: group.lectures.map((lecture) => ({
      ...lecture,
      attendance: group.students.map((student) => {
        const persistedAttendance = lecture.students.find(
          (lectureStudent) => lectureStudent.studentId === student.id,
        );

        return {
          studentId: student.id,
          status: persistedAttendance?.status ?? 'not-marked',
          viber: persistedAttendance?.viberSent ?? false,
          markedAt: persistedAttendance?.markedAt,
          markedBy: persistedAttendance?.markedBy,
        };
      }),
    })),
  };
}

export function TheoryGroupPage() {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const { id } = useParams();
  const [expandedLecture, setExpandedLecture] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [viberSent, setViberSent] = useState<Record<string, boolean>>({});
  const [group, setGroup] = useState<TheoryGroup | null>(null);
  const [actionMessage, setActionMessage] = useState(
    'Зареждане на теория групата от PostgreSQL.',
  );

  useEffect(() => {
    let isMounted = true;

    fetchTheoryGroups()
      .then((groups) => {
        if (!isMounted) {
          return;
        }

        const matchedGroup =
          groups.find((item) => item.id === id) ?? null;

        setGroup(
          matchedGroup ? normalizeTheoryGroupForDetails(matchedGroup) : null,
        );
        setActionMessage(
          matchedGroup
            ? 'Групата е заредена от PostgreSQL.'
            : 'Тази теория група не е намерена в базата.',
        );
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setGroup(null);
        setActionMessage('Неуспешно зареждане на теория групата от базата.');
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!group) {
    return (
      <div>
        <PageHeader
          title="Теория група"
          subtitle={actionMessage}
          actions={
            <Button
              variant="secondary"
              icon={<ArrowLeft size={18} />}
              onClick={() => navigate('/theory')}
            >
              Назад към групите
            </Button>
          }
        />
        <div className="p-6 lg:p-8">
          <div
            className="rounded-3xl p-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--ghost-border)',
              color: 'var(--text-secondary)',
            }}
          >
            {actionMessage}
          </div>
        </div>
      </div>
    );
  }

  const nextLecture = group.lectures.find(l => l.status === 'scheduled');
  const remainingLectures = group.totalLectures - group.completedLectures;

  const toggleLecture = (lectureId: string) => {
    setExpandedLecture(expandedLecture === lectureId ? null : lectureId);
  };

  const handleMarkAttendance = (
    lectureId: string,
    studentId: string,
    status: AttendanceStatus,
  ) => {
    setAttendanceData(prev => ({
      ...prev,
      [lectureId]: {
        ...(prev[lectureId] || {}),
        [studentId]: status,
      },
    }));
  };

  const handleSendViber = async (lectureId: string, studentId: string) => {
    const key = `${lectureId}-${studentId}`;
    const nextViberSent = {
      ...viberSent,
      [key]: true,
    };

    setViberSent(nextViberSent);

    await persistLectureAttendance(
      lectureId,
      attendanceData[lectureId] ?? {},
      nextViberSent,
    );
  };

  const getAttendanceStatus = (
    lectureId: string,
    studentId: string,
  ): AttendanceStatus => {
    // Check if manually marked
    if (attendanceData[lectureId]?.[studentId]) {
      return attendanceData[lectureId][studentId];
    }
    
    // Check saved attendance
    const lecture = group.lectures.find(l => l.id === lectureId);
    const saved = lecture?.attendance.find(a => a.studentId === studentId);
    if (saved) {
      return saved.status;
    }
    
    return 'not-marked';
  };

  const isViberSent = (lectureId: string, studentId: string): boolean => {
    const key = `${lectureId}-${studentId}`;
    if (viberSent[key]) return true;
    
    const lecture = group.lectures.find(l => l.id === lectureId);
    const saved = lecture?.attendance.find(a => a.studentId === studentId);
    return saved?.viber || false;
  };

  const getAttendanceSummary = (lectureId: string) => {
    const lecture = group.lectures.find(l => l.id === lectureId);
    let present = 0;
    let absent = 0;
    let late = 0;
    let notMarked = 0;

    group.students.forEach(student => {
      const status = getAttendanceStatus(lectureId, student.id);
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else notMarked++;
    });

    return { present, absent, late, notMarked, total: group.students.length };
  };

  const persistLectureAttendance = async (
    lectureId: string,
    nextLectureAttendance: Record<string, AttendanceStatus>,
    nextViberSent: Record<string, boolean> = viberSent,
  ) => {
    try {
      const updatedGroup = await saveTheoryLectureAttendance(
        group.id,
        lectureId,
        group.students
          .map((student) => ({
            studentId: student.id,
            status:
              nextLectureAttendance[student.id] ??
              getAttendanceStatus(lectureId, student.id),
            viberSent:
              nextViberSent[`${lectureId}-${student.id}`] ||
              isViberSent(lectureId, student.id),
          }))
          .filter(
            (attendanceRecord) => attendanceRecord.status !== 'not-marked',
          )
          .map((attendanceRecord) => ({
            studentId: attendanceRecord.studentId,
            status: attendanceRecord.status as
              | 'present'
              | 'absent'
              | 'excused'
              | 'late',
            viberSent: attendanceRecord.viberSent,
          })),
        session?.csrfToken ?? '',
      );

      setGroup(normalizeTheoryGroupForDetails(updatedGroup));
      setAttendanceData((current) => ({
        ...current,
        [lectureId]: {},
      }));
      setActionMessage(
        'Присъствието за лекцията е записано в PostgreSQL. Viber статусите са синхронизирани в системата.',
      );
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? `Неуспешен запис на присъствие: ${error.message}`
          : 'Неуспешен запис на присъствие в базата.',
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Page Header */}
      <PageHeader
        title={group.name}
        description={`Категория ${group.category} • ${group.schedule}`}
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Теория', onClick: () => navigate('/theory') },
          { label: group.name }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<ArrowLeft size={18} />}
              onClick={() => navigate('/theory')}
            >
              Назад към групи
            </Button>
            <Button
              variant="secondary"
              icon={<Download size={18} />}
              onClick={() => {
                exportTheoryGroupAttendanceCsv(group);
                setActionMessage(
                  `Експортирано е присъствието за ${group.lectures.length} лекции и ${group.students.length} курсисти в CSV файл.`,
                );
              }}
            >
              Експорт присъствие
            </Button>
          </div>
        }
      />

      {/* Group Summary */}
      <div className="px-6 lg:px-8 py-6">
        <div
          className="mb-6 rounded-xl p-4 text-sm"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'var(--text-secondary)',
          }}
        >
          {actionMessage}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Total Students */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--bg-card)' }}
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
                {group.students.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Курсисти
            </p>
          </div>

          {/* Completed Lectures */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(34, 197, 94, 0.1)' }}
              >
                <CheckCircle size={20} style={{ color: '#22c55e' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {group.completedLectures}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Проведени лекции
            </p>
          </div>

          {/* Remaining Lectures */}
          <div
            className="rounded-xl p-6"
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
                {remainingLectures}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Оставащи лекции
            </p>
          </div>

          {/* Progress */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(99, 102, 241, 0.1)' }}
              >
                <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {Math.round((group.completedLectures / group.totalLectures) * 100)}%
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Прогрес
            </p>
          </div>

          {/* Next Lecture */}
          <div
            className="rounded-xl p-6"
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
                <CalendarIcon size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <span
                className="text-xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {nextLecture ? new Date(nextLecture.date).toLocaleDateString('bg-BG', {
                  day: 'numeric',
                  month: 'short',
                }) : '-'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              {nextLecture ? `Следваща: ${nextLecture.time}` : 'Няма планирани'}
            </p>
          </div>
        </div>
      </div>

      {/* Lectures List - Main Workspace */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="mb-6">
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Лекции и присъствие
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
            Кликнете върху лекция, за да маркирате присъствие за всички курсисти
          </p>
        </div>

        <div className="space-y-4">
          {group.lectures.map((lecture) => {
            const isExpanded = expandedLecture === lecture.id;
            const isToday = lecture.date === new Date().toISOString().slice(0, 10);
            const summary = getAttendanceSummary(lecture.id);

            return (
              <div
                key={lecture.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  border: isToday ? '2px solid rgba(99, 102, 241, 0.3)' : 'none',
                }}
              >
                {/* Lecture Header */}
                <button
                  onClick={() => toggleLecture(lecture.id)}
                  className="w-full p-6 text-left transition-all hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3
                          className="text-xl font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Лекция {lecture.number}: {lecture.title}
                        </h3>
                        {lecture.status === 'completed' && (
                          <Badge variant="green">Проведена</Badge>
                        )}
                        {lecture.status === 'scheduled' && isToday && (
                          <Badge variant="purple">Днес</Badge>
                        )}
                        {lecture.status === 'scheduled' && !isToday && (
                          <Badge variant="blue">Планирана</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {new Date(lecture.date).toLocaleDateString('bg-BG', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {lecture.time} - {lecture.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {lecture.instructor}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {lecture.location}
                          </span>
                        </div>
                      </div>

                      {/* Attendance Summary */}
                      <div className="flex items-center gap-4">
                        {summary.present > 0 && (
                          <span style={{ color: '#22c55e', fontSize: '0.9375rem', fontWeight: 500 }}>
                            {summary.present} присъстващи
                          </span>
                        )}
                        {summary.absent > 0 && (
                          <span style={{ color: '#ef4444', fontSize: '0.9375rem', fontWeight: 500 }}>
                            {summary.absent} отсъстващи
                          </span>
                        )}
                        {summary.late > 0 && (
                          <span style={{ color: '#fb923c', fontSize: '0.9375rem', fontWeight: 500 }}>
                            {summary.late} закъснели
                          </span>
                        )}
                        {summary.notMarked > 0 && (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                            {summary.notMarked} немаркирани
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronUp size={24} style={{ color: 'var(--text-tertiary)' }} />
                      ) : (
                        <ChevronDown size={24} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                    </div>
                  </div>
                </button>

                {/* Attendance Workspace - Expanded */}
                {isExpanded && (
                  <div
                    className="px-6 pb-6"
                    style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
                  >
                    {/* Progress Bar */}
                    <div className="pt-6 pb-5">
                      <div className="flex items-center justify-between mb-3">
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                          {lecture.status === 'scheduled' 
                            ? 'Маркирайте присъствие за всеки курсист:'
                            : 'Присъствие за лекцията:'}
                        </p>
                        {lecture.status === 'scheduled' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const newData: Record<string, AttendanceStatus> = {};
                              group.students.forEach(s => {
                                newData[s.id] = 'present';
                              });
                              setAttendanceData(prev => ({
                                ...prev,
                                [lecture.id]: newData,
                              }));
                            }}
                          >
                            Маркирай всички като присъстващи
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-6 p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            Присъстващи: <span style={{ color: '#22c55e', fontWeight: 600 }}>{summary.present}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            Отсъстващи: <span style={{ color: '#ef4444', fontWeight: 600 }}>{summary.absent}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: '#fb923c' }} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            Закъснели: <span style={{ color: '#fb923c', fontWeight: 600 }}>{summary.late}</span>
                          </span>
                        </div>
                        {summary.notMarked > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertCircle size={14} style={{ color: 'var(--text-tertiary)' }} />
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                              Немаркирани: {summary.notMarked}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 space-y-3">
                      {group.students.map((student) => {
                        const status = getAttendanceStatus(lecture.id, student.id);
                        const viberSentStatus = isViberSent(lecture.id, student.id);
                        const isAbsent = status === 'absent';

                        return (
                          <div
                            key={student.id}
                            className="rounded-xl p-5"
                            style={{
                              background: isAbsent 
                                ? 'rgba(239, 68, 68, 0.03)'
                                : 'var(--bg-primary)',
                              border: isAbsent
                                ? '1px solid rgba(239, 68, 68, 0.15)'
                                : '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                          >
                            <div className="flex items-center justify-between gap-6">
                              {/* Student Info */}
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div
                                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                                >
                                  <User size={20} style={{ color: 'var(--accent-primary)' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="font-semibold mb-1 truncate"
                                    style={{ color: 'var(--text-primary)', fontSize: '1.0625rem' }}
                                  >
                                    {student.name}
                                  </p>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <Phone size={14} style={{ color: 'var(--text-tertiary)' }} />
                                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                        {student.phone}
                                      </span>
                                    </div>
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

                              {/* Attendance Actions */}
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {/* Present Button */}
                                <button
                                  onClick={() => handleMarkAttendance(lecture.id, student.id, 'present')}
                                  className="px-8 py-3.5 rounded-xl transition-all font-semibold"
                                  style={{
                                    background: status === 'present' 
                                      ? '#22c55e' 
                                      : 'rgba(34, 197, 94, 0.1)',
                                    color: status === 'present' 
                                      ? '#ffffff' 
                                      : '#22c55e',
                                    border: status === 'present'
                                      ? '2px solid #22c55e'
                                      : '2px solid rgba(34, 197, 94, 0.3)',
                                    fontSize: '1rem',
                                    minWidth: '140px',
                                  }}
                                >
                                  Присъства
                                </button>

                                {/* Absent Button */}
                                <button
                                  onClick={() => handleMarkAttendance(lecture.id, student.id, 'absent')}
                                  className="px-8 py-3.5 rounded-xl transition-all font-semibold"
                                  style={{
                                    background: status === 'absent' 
                                      ? '#ef4444' 
                                      : 'rgba(239, 68, 68, 0.1)',
                                    color: status === 'absent' 
                                      ? '#ffffff' 
                                      : '#ef4444',
                                    border: status === 'absent'
                                      ? '2px solid #ef4444'
                                      : '2px solid rgba(239, 68, 68, 0.3)',
                                    fontSize: '1rem',
                                    minWidth: '140px',
                                  }}
                                >
                                  Отсъства
                                </button>

                                {/* Late Button */}
                                <button
                                  onClick={() => handleMarkAttendance(lecture.id, student.id, 'late')}
                                  className="px-6 py-3.5 rounded-xl transition-all font-semibold"
                                  style={{
                                    background: status === 'late' 
                                      ? '#fb923c' 
                                      : 'rgba(251, 146, 60, 0.1)',
                                    color: status === 'late' 
                                      ? '#ffffff' 
                                      : '#fb923c',
                                    border: status === 'late'
                                      ? '2px solid #fb923c'
                                      : '2px solid rgba(251, 146, 60, 0.3)',
                                    fontSize: '0.9375rem',
                                    minWidth: '120px',
                                  }}
                                >
                                  Закъснял
                                </button>

                                {/* Viber Message Button */}
                                <button
                                  onClick={() =>
                                    void handleSendViber(lecture.id, student.id)
                                  }
                                  disabled={viberSentStatus || status !== 'absent'}
                                  className="px-6 py-3.5 rounded-xl transition-all font-semibold flex items-center gap-2"
                                  style={{
                                    background: viberSentStatus
                                      ? 'rgba(99, 102, 241, 0.15)'
                                      : status === 'absent'
                                      ? 'rgba(99, 102, 241, 0.1)'
                                      : 'rgba(255, 255, 255, 0.03)',
                                    color: viberSentStatus || status === 'absent'
                                      ? 'var(--accent-primary)'
                                      : 'var(--text-tertiary)',
                                    border: viberSentStatus
                                      ? '2px solid var(--accent-primary)'
                                      : status === 'absent'
                                      ? '2px solid rgba(99, 102, 241, 0.3)'
                                      : '2px solid rgba(255, 255, 255, 0.06)',
                                    fontSize: '0.9375rem',
                                    minWidth: '160px',
                                    opacity: status !== 'absent' && !viberSentStatus ? 0.4 : 1,
                                    cursor: status !== 'absent' && !viberSentStatus ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  <MessageCircle size={18} />
                                  {viberSentStatus ? 'Viber изпратен' : 'Viber съобщение'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Save Actions */}
                    {lecture.status === 'scheduled' && (
                      <div className="flex gap-3 mt-6 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <Button
                          variant="secondary"
                          fullWidth
                          onClick={() => setExpandedLecture(null)}
                        >
                          Отказ
                        </Button>
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={() => {
                            void persistLectureAttendance(
                              lecture.id,
                              attendanceData[lecture.id] ?? {},
                            );
                            setExpandedLecture(null);
                          }}
                        >
                          Запази присъствие
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Roster - Bottom Section */}
      <div className="px-6 lg:px-8 pb-8">
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-card)' }}
        >
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Курсисти в групата ({group.students.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {group.students.map((student) => (
              <div
                key={student.id}
                className="rounded-xl p-5"
                style={{ background: 'var(--bg-primary)' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                  >
                    <User size={20} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold mb-1"
                      style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                    >
                      {student.name}
                    </p>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Phone size={14} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                          {student.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
