import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronLeft, Phone, Mail, MapPin, Calendar,
  CheckCircle, Clock, AlertCircle, CreditCard,
  FileText, User, ChevronRight, Plus
} from 'lucide-react';
import type { StudentOperationalRecord } from '../../content/studentOperations';
import { fetchStudentOperationalDetail } from '../../services/studentsApi';
import {
  fetchPaymentRecords,
  type PaymentRecordView,
} from '../../services/paymentsApi';

export function MobileStudentProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const routeStudentId = id ?? '';
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'payments' | 'documents'>('overview');
  const [studentRecord, setStudentRecord] =
    useState<StudentOperationalRecord | null>(null);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecordView[]>([]);
  const [studentSourceStatus, setStudentSourceStatus] = useState<'loading' | 'backend' | 'fallback' | 'invalid'>('loading');

  useEffect(() => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeStudentId)) {
      setStudentRecord(null);
      setStudentSourceStatus('invalid');
      return;
    }

    let isMounted = true;
    setStudentSourceStatus('loading');

    Promise.allSettled([
      fetchStudentOperationalDetail(routeStudentId),
      fetchPaymentRecords(),
    ])
      .then(([recordResult, paymentsResult]) => {
        if (!isMounted) {
          return;
        }

        if (recordResult.status !== 'fulfilled') {
          setStudentRecord(null);
          setPaymentRecords([]);
          setStudentSourceStatus('fallback');
          return;
        }

        setStudentRecord(recordResult.value);
        setPaymentRecords(
          paymentsResult.status === 'fulfilled'
            ? paymentsResult.value.filter(
                (payment) => String(payment.studentId) === routeStudentId,
              )
            : [],
        );
        setStudentSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setStudentRecord(null);
        setPaymentRecords([]);
        setStudentSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, [routeStudentId]);

  if (!studentRecord) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div
          className="sticky top-0 z-10 px-4 py-3 border-b"
          style={{
            background: 'var(--bg-panel)',
            borderColor: 'var(--ghost-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/students')}
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h1
                className="text-base font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {studentSourceStatus === 'loading'
                  ? 'Зареждане на курсист'
                  : 'Курсистът не е намерен'}
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {studentSourceStatus === 'loading'
                  ? 'PostgreSQL'
                  : 'Отвори курсиста от обновения списък'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {studentSourceStatus === 'loading'
                ? 'Моля, изчакай...'
                : studentSourceStatus === 'fallback'
                  ? 'Неуспешно зареждане на курсиста от базата.'
                  : 'Невалиден стар локален идентификатор.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const student = {
    id: studentRecord.id,
    name: studentRecord.name,
    email: studentRecord.email,
    phone: studentRecord.phone,
    address: studentRecord.address ?? 'Няма въведен адрес',
    category: studentRecord.category,
    status: studentRecord.status,
    statusLabel: studentRecord.statusLabel,
    enrollmentDate: studentRecord.trainingStartDate || studentRecord.startDate,
    progress: studentRecord.progress,
  };

  const stats = [
    {
      label: 'Практика',
      value: `${studentRecord.used}/${studentRecord.total}`,
      subtitle: `${studentRecord.progress}% завършени`,
      color: 'var(--primary-accent)',
    },
    { label: 'Теория', value: '0/0', subtitle: 'Няма занятия', color: 'var(--ai-accent)' },
    { label: 'Изпити', value: '0/0', subtitle: 'Няма явявания', color: 'var(--status-success)' },
    { label: 'Остатък', value: '0 €', subtitle: 'Няма данни', color: 'var(--status-warning)' },
  ];

  const recentLessons: Array<{
    id: number;
    date: string;
    time: string;
    instructor: string;
    type: string;
    status: string;
    statusLabel: string;
    duration?: string;
  }> = [];

  const upcomingLessons: Array<{
    id: number;
    date: string;
    time: string;
    instructor: string;
    type: string;
    status: string;
    statusLabel: string;
  }> = [];

  const payments = paymentRecords.map((payment) => ({
    id: payment.id,
    date: payment.date,
    amount: `${payment.paidAmount.toFixed(0)} €`,
    type: payment.paymentReason || 'Плащане',
    status: payment.paymentStatus,
    statusLabel: mapMobilePaymentStatusLabel(payment.paymentStatus),
  }));
  const remainingAmount = paymentRecords.reduce(
    (sum, payment) => sum + payment.remainingAmount,
    0,
  );

  const documents: Array<{
    id: number;
    name: string;
    date: string;
    status: string;
    statusLabel: string;
  }> = [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{ 
          background: 'var(--bg-panel)',
          borderColor: 'var(--ghost-border)'
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/students')}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {student.name}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Категория {student.category} • {
                studentSourceStatus === 'backend'
                  ? 'PostgreSQL'
                  : 'Недостъпен backend'
              }
            </p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary-accent)',
            }}
          >
            {student.statusLabel}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div 
        className="sticky top-[57px] z-10 flex border-b overflow-x-auto"
        style={{ 
          background: 'var(--bg-panel)',
          borderColor: 'var(--ghost-border)'
        }}
      >
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          label="Преглед"
        />
        <TabButton
          active={activeTab === 'lessons'}
          onClick={() => setActiveTab('lessons')}
          label="Часове"
        />
        <TabButton
          active={activeTab === 'payments'}
          onClick={() => setActiveTab('payments')}
          label="Плащания"
        />
        <TabButton
          active={activeTab === 'documents'}
          onClick={() => setActiveTab('documents')}
          label="Документи"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Contact Info */}
            <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-card)' }}>
              <ContactRow icon={<Phone size={16} />} label="Телефон" value={student.phone} href={`tel:${student.phone}`} />
              <ContactRow icon={<Mail size={16} />} label="Имейл" value={student.email} href={`mailto:${student.email}`} />
              <ContactRow icon={<MapPin size={16} />} label="Адрес" value={student.address} />
              <ContactRow icon={<Calendar size={16} />} label="Записан на" value={student.enrollmentDate} />
            </div>

            {/* Progress */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Обща прогрес
                </span>
                <span className="text-lg font-semibold" style={{ color: 'var(--primary-accent)' }}>
                  {student.progress}%
                </span>
              </div>
              <div 
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-panel)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${student.progress}%`,
                    background: 'linear-gradient(90deg, var(--primary-accent), var(--ai-accent))',
                  }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                  <div className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </div>
                  <div className="text-xs font-medium" style={{ color: stat.color }}>
                    {stat.subtitle}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/schedule')}
                className="h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition-all active:scale-95"
                style={{
                  background: 'var(--primary-accent)',
                  color: '#ffffff',
                }}
              >
                <Plus size={18} />
                Нов час
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition-all active:scale-95"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                }}
              >
                <CreditCard size={18} />
                Плащане
              </button>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {/* Upcoming */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Предстоящи часове
              </h3>
              {upcomingLessons.length === 0 ? (
                <EmptyMobileState message="Няма насрочени практически часове." />
              ) : (
                <div className="space-y-2">
                  {upcomingLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Последни часове
              </h3>
              {recentLessons.length === 0 ? (
                <EmptyMobileState message="Няма проведени практически часове." />
              ) : (
                <div className="space-y-2">
                  {recentLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            {/* Balance Card */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
              <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Остатък за плащане
              </div>
              <div className="text-3xl font-semibold mb-3" style={{ color: 'var(--status-warning)' }}>
                {remainingAmount.toFixed(0)} €
              </div>
              <button
                className="w-full h-12 rounded-xl font-medium transition-all active:scale-95"
                style={{
                  background: 'var(--primary-accent)',
                  color: '#ffffff',
                }}
              >
                Добави плащане
              </button>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                История на плащанията
              </h3>
              {payments.length === 0 ? (
                <EmptyMobileState message="Няма плащания за този курсист." />
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-xl"
                      style={{ background: 'var(--bg-card)' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            {payment.type}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {payment.date}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {payment.amount}
                          </div>
                          <div
                            className="text-xs px-2 py-0.5 rounded inline-block"
                            style={{
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: 'var(--status-success)',
                            }}
                          >
                            {payment.statusLabel}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-2">
            {documents.length === 0 ? (
              <EmptyMobileState message="Няма качени документи за този курсист." />
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl flex items-center gap-3"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <CheckCircle size={18} style={{ color: 'var(--status-success)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                      {doc.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      Качен на {doc.date}
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ))
            )}

            <button
              className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition-all active:scale-95"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--primary-accent)',
                border: '1px dashed rgba(99, 102, 241, 0.3)',
              }}
            >
              <Plus size={18} />
              Качи документ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function mapMobilePaymentStatusLabel(status: PaymentRecordView['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'Платено';
    case 'partial':
      return 'Частично';
    case 'overdue':
      return 'Просрочено';
    case 'canceled':
      return 'Отказано';
    default:
      return 'Очаква';
  }
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all"
      style={{
        color: active ? 'var(--primary-accent)' : 'var(--text-secondary)',
        borderBottom: active ? '2px solid var(--primary-accent)' : '2px solid transparent',
      }}
    >
      {label}
    </button>
  );
}

function ContactRow({ 
  icon, 
  label, 
  value, 
  href 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  href?: string; 
}) {
  const content = (
    <>
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className="flex items-center justify-between">
        {content}
      </a>
    );
  }

  return <div className="flex items-center justify-between">{content}</div>;
}

function EmptyMobileState({ message }: { message: string }) {
  return (
    <div className="rounded-xl p-4 text-sm text-center" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
      {message}
    </div>
  );
}

function LessonCard({ lesson }: { lesson: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--status-success)';
      case 'scheduled': return 'var(--status-info)';
      case 'confirmed': return 'var(--primary-accent)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {lesson.type}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {lesson.instructor}
          </div>
        </div>
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
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {lesson.date}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {lesson.time}
        </div>
        {lesson.duration && (
          <div className="flex items-center gap-1">
            {lesson.duration}
          </div>
        )}
      </div>
    </div>
  );
}
