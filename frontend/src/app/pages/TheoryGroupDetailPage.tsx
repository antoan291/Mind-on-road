import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageHeader } from '../components/ui-system/PageHeader';
import { Button } from '../components/ui-system/Button';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import { 
  Edit, Download, Plus, Calendar, Users, 
  CheckCircle, XCircle, Mail, DollarSign, 
  AlertCircle, Clock, User
} from 'lucide-react';

type Student = {
  id: number;
  name: string;
  category: string;
  phone: string;
  email: string;
};

type LectureAttendance = {
  studentId: number;
  present: boolean;
  makeupRequired: boolean;
  dueAmount?: number;
  notificationSent: boolean;
};

type Lecture = {
  id: number;
  number: number;
  date: string;
  time: string;
  topic: string;
  duration: number;
  status: 'completed' | 'upcoming' | 'today';
  attendance: LectureAttendance[];
  presentCount: number;
  absentCount: number;
};

export function TheoryGroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expandedLecture, setExpandedLecture] = useState<number | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<number | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<number, boolean>>({});
  const [actionMessage, setActionMessage] = useState(
    'Групата е заредена в тестов режим само с Антоан Тест.',
  );

  // Mock data - in real app, fetch based on id
  const group = {
    id: 1,
    name: 'Група 1 - Категория B',
    daiCode: 'DAI-2024-B-001',
    category: 'B',
    schedule: 'Понеделник и Сряда 18:00',
    instructor: 'Мария Иванова',
    totalStudents: 15,
    totalLectures: 12,
    completedLectures: 8,
    averageAttendance: 93,
  };

  const students: Student[] = [
    {
      id: 1,
      name: 'Антоан Тест',
      category: 'B',
      phone: '0886612503',
      email: 'antoan.test@example.com',
    },
  ];

  const lectures: Lecture[] = [
    {
      id: 1,
      number: 1,
      date: '04.03.2024',
      time: '18:00',
      topic: 'Въведение в правилата за движение',
      duration: 90,
      status: 'completed',
      presentCount: 15,
      absentCount: 0,
      attendance: students.map(s => ({
        studentId: s.id,
        present: true,
        makeupRequired: false,
        notificationSent: false,
      })),
    },
    {
      id: 2,
      number: 2,
      date: '06.03.2024',
      time: '18:00',
      topic: 'Пътни знаци - забранителни и предупредителни',
      duration: 90,
      status: 'completed',
      presentCount: 14,
      absentCount: 1,
      attendance: students.map(s => ({
        studentId: s.id,
        present: s.id !== 3,
        makeupRequired: s.id === 3,
        dueAmount: s.id === 3 ? 30 : undefined,
        notificationSent: s.id === 3,
      })),
    },
    {
      id: 3,
      number: 3,
      date: '11.03.2024',
      time: '18:00',
      topic: 'Пътни знаци - информационни и указателни',
      duration: 90,
      status: 'completed',
      presentCount: 13,
      absentCount: 2,
      attendance: students.map(s => ({
        studentId: s.id,
        present: s.id !== 2 && s.id !== 4,
        makeupRequired: s.id === 2 || s.id === 4,
        dueAmount: s.id === 2 ? 30 : s.id === 4 ? 30 : undefined,
        notificationSent: true,
      })),
    },
    {
      id: 4,
      number: 4,
      date: '24.03.2024',
      time: '18:00',
      topic: 'Управление в специални условия',
      duration: 90,
      status: 'today',
      presentCount: 0,
      absentCount: 0,
      attendance: students.map(s => ({
        studentId: s.id,
        present: false,
        makeupRequired: false,
        notificationSent: false,
      })),
    },
    {
      id: 5,
      number: 5,
      date: '25.03.2024',
      time: '18:00',
      topic: 'Светлинна и звукова сигнализация',
      duration: 90,
      status: 'upcoming',
      presentCount: 0,
      absentCount: 0,
      attendance: students.map(s => ({
        studentId: s.id,
        present: false,
        makeupRequired: false,
        notificationSent: false,
      })),
    },
  ];

  const handleStartAttendance = (lectureId: number) => {
    setEditingAttendance(lectureId);
    // Initialize with all students as absent
    const initialData: Record<number, boolean> = {};
    students.forEach(s => {
      initialData[s.id] = false;
    });
    setAttendanceData(initialData);
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<number, boolean> = {};
    students.forEach(s => {
      allPresent[s.id] = true;
    });
    setAttendanceData(allPresent);
  };

  const handleToggleStudent = (studentId: number) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSaveAttendance = () => {
    const presentCount = Object.values(attendanceData).filter(Boolean).length;
    setActionMessage(
      `Присъствието е запазено локално: ${presentCount}/${students.length} присъстващи.`,
    );
    setEditingAttendance(null);
    setAttendanceData({});
  };

  const handleCancelAttendance = () => {
    setEditingAttendance(null);
    setAttendanceData({});
    setActionMessage('Маркирането на присъствие е отказано.');
  };

  return (
    <div>
      <PageHeader
        title={group.name}
        description={`${group.daiCode} • ${group.schedule}`}
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Теория', onClick: () => navigate('/theory') },
          { label: group.name },
        ]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт присъствия
            </Button>
            <Button variant="primary" icon={<Edit size={18} />}>
              Редактирай група
            </Button>
          </>
        }
      />

      <div className="p-6 lg:p-8">
        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--ghost-border)',
          }}
        >
          {actionMessage}
        </div>

        {/* Group Info Card */}
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-card)' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatItem
              icon={<Users size={20} style={{ color: 'var(--primary-accent)' }} />}
              label="Курсисти"
              value={group.totalStudents.toString()}
            />
            <StatItem
              icon={<Calendar size={20} style={{ color: 'var(--ai-accent)' }} />}
              label="Занятия"
              value={`${group.completedLectures}/${group.totalLectures}`}
            />
            <StatItem
              icon={<CheckCircle size={20} style={{ color: 'var(--status-success)' }} />}
              label="Средно присъствие"
              value={`${group.averageAttendance}%`}
            />
            <StatItem
              icon={<User size={20} style={{ color: 'var(--text-secondary)' }} />}
              label="Инструктор"
              value={group.instructor}
            />
          </div>
        </div>

        {/* Lectures List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: 'var(--text-primary)' }}>
              Занятия
            </h3>
          </div>

          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--bg-card)' }}
            >
              {/* Lecture Header */}
              <button
                onClick={() => setExpandedLecture(expandedLecture === lecture.id ? null : lecture.id)}
                className="w-full p-6 transition-all text-left"
                style={{
                  background: lecture.status === 'today' 
                    ? 'rgba(99, 102, 241, 0.08)' 
                    : 'transparent',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span 
                        className="px-2.5 py-1 rounded-lg text-sm font-semibold"
                        style={{
                          background: 'var(--bg-panel)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Занятие {lecture.number}
                      </span>
                      {lecture.status === 'today' && (
                        <StatusBadge status="warning" size="small">
                          Днес
                        </StatusBadge>
                      )}
                      {lecture.status === 'completed' && (
                        <StatusBadge status="success" size="small">
                          Завършено
                        </StatusBadge>
                      )}
                      {lecture.status === 'upcoming' && (
                        <StatusBadge status="info" size="small">
                          Предстоящо
                        </StatusBadge>
                      )}
                    </div>

                    <h4 className="mb-2" style={{ color: 'var(--text-primary)' }}>
                      {lecture.topic}
                    </h4>

                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {lecture.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {lecture.time} • {lecture.duration} мин
                      </span>
                      {lecture.status === 'completed' && (
                        <>
                          <span className="flex items-center gap-1.5" style={{ color: 'var(--status-success)' }}>
                            <CheckCircle size={14} />
                            {lecture.presentCount} присъствали
                          </span>
                          {lecture.absentCount > 0 && (
                            <span className="flex items-center gap-1.5" style={{ color: 'var(--status-error)' }}>
                              <XCircle size={14} />
                              {lecture.absentCount} отсъствали
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {lecture.status === 'today' && editingAttendance !== lecture.id && (
                    <Button
                      variant="primary"
                      icon={<CheckCircle size={18} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartAttendance(lecture.id);
                      }}
                    >
                      Отбележи присъствие
                    </Button>
                  )}
                </div>
              </button>

              {/* Attendance Marking (for today's lecture) */}
              {lecture.status === 'today' && editingAttendance === lecture.id && (
                <div 
                  className="px-6 pb-6"
                  style={{ borderTop: '1px solid var(--ghost-border)' }}
                >
                  <div className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 style={{ color: 'var(--text-primary)' }}>
                        Отбележете присъствие
                      </h4>
                      <Button
                        variant="secondary"
                        onClick={handleMarkAllPresent}
                      >
                        Маркирай всички като присъствали
                      </Button>
                    </div>

                    <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-panel)' }}>
                      <div className="space-y-2">
                        {students.map((student) => (
                          <label
                            key={student.id}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:shadow-[var(--glow-indigo)]"
                            style={{ 
                              background: attendanceData[student.id] 
                                ? 'var(--status-success-bg)' 
                                : 'var(--bg-card)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={attendanceData[student.id] || false}
                              onChange={() => handleToggleStudent(student.id)}
                              className="w-5 h-5 rounded"
                              style={{
                                accentColor: 'var(--primary-accent)',
                                cursor: 'pointer',
                              }}
                            />
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0"
                              style={{
                                background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                                color: '#ffffff',
                              }}
                            >
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {student.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="primary"
                        icon={<CheckCircle size={18} />}
                        onClick={handleSaveAttendance}
                      >
                        Запази присъствие
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCancelAttendance}
                      >
                        Отказ
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded Attendance Details (for completed lectures) */}
              {expandedLecture === lecture.id && lecture.status === 'completed' && (
                <div 
                  className="px-6 pb-6"
                  style={{ borderTop: '1px solid var(--ghost-border)' }}
                >
                  <div className="pt-6">
                    <h4 className="mb-4" style={{ color: 'var(--text-primary)' }}>
                      Присъствие ({lecture.presentCount}/{students.length})
                    </h4>

                    {/* Present Students */}
                    {lecture.attendance.filter(a => a.present).length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--status-success)' }}>
                          <CheckCircle size={16} />
                          Присъствали ({lecture.attendance.filter(a => a.present).length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {lecture.attendance
                            .filter(a => a.present)
                            .map(att => {
                              const student = students.find(s => s.id === att.studentId)!;
                              return (
                                <div
                                  key={student.id}
                                  className="p-3 rounded-lg flex items-center gap-3"
                                  style={{ background: 'var(--status-success-bg)' }}
                                >
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
                                    style={{
                                      background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                                      color: '#ffffff',
                                    }}
                                  >
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    {student.name}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Absent Students */}
                    {lecture.attendance.filter(a => !a.present).length > 0 && (
                      <div>
                        <p className="text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--status-error)' }}>
                          <XCircle size={16} />
                          Отсъствали ({lecture.attendance.filter(a => !a.present).length})
                        </p>
                        <div className="space-y-3">
                          {lecture.attendance
                            .filter(a => !a.present)
                            .map(att => {
                              const student = students.find(s => s.id === att.studentId)!;
                              return (
                                <div
                                  key={student.id}
                                  className="p-4 rounded-lg"
                                  style={{ 
                                    background: 'var(--status-error-bg)',
                                    border: '1px solid var(--status-error-border)',
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                      <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
                                        style={{
                                          background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                                          color: '#ffffff',
                                        }}
                                      >
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                          {student.name}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                          {att.makeupRequired && (
                                            <span className="flex items-center gap-1" style={{ color: 'var(--status-warning)' }}>
                                              <AlertCircle size={12} />
                                              Трябва да наваксва
                                            </span>
                                          )}
                                          {att.dueAmount && (
                                            <span className="flex items-center gap-1" style={{ color: 'var(--status-error)' }}>
                                              <DollarSign size={12} />
                                              Дължи {att.dueAmount} €
                                            </span>
                                          )}
                                          {att.notificationSent && (
                                            <span className="flex items-center gap-1" style={{ color: 'var(--status-info)' }}>
                                              <Mail size={12} />
                                              Изпратено известие
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {!att.notificationSent && (
                                      <Button
                                        variant="ghost"
                                        icon={<Mail size={16} />}
                                        onClick={() =>
                                          setActionMessage(
                                            `Известието за ${student.name} е маркирано като изпратено в UI режим.`,
                                          )
                                        }
                                      >
                                        Изпрати известие
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stat Item Component
function StatItem({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--bg-panel)' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </p>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
