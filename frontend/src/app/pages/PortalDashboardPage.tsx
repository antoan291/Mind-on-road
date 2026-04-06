import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  MessageSquareText,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  PageHeader,
  StatCard,
} from '../components/shared';
import { useAuthSession } from '../services/authSession';
import {
  fetchDocumentRecords,
  type DocumentRecordView,
} from '../services/documentsApi';
import {
  fetchInvoiceRecords,
  type InvoiceRecordView,
} from '../services/invoicesApi';
import {
  fetchNotificationRecords,
  type NotificationRecordView,
} from '../services/notificationsApi';
import {
  fetchPaymentRecords,
  type PaymentRecordView,
} from '../services/paymentsApi';
import {
  fetchPracticalLessonRecords,
  type PracticalLessonView,
} from '../services/practicalLessonsApi';
import {
  fetchStudentOperations,
  type StudentOperationalRecord,
} from '../services/studentsApi';

export function PortalDashboardPage() {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const isParentPortal = Boolean(session?.user.roleKeys.includes('parent'));
  const [students, setStudents] = useState<StudentOperationalRecord[]>([]);
  const [lessons, setLessons] = useState<PracticalLessonView[]>([]);
  const [documents, setDocuments] = useState<DocumentRecordView[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecordView[]>(
    [],
  );
  const [payments, setPayments] = useState<PaymentRecordView[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecordView[]>([]);
  const [sourceStatus, setSourceStatus] = useState<
    'loading' | 'backend' | 'fallback'
  >('loading');

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchStudentOperations(),
      fetchPracticalLessonRecords(),
      fetchDocumentRecords(),
      fetchNotificationRecords(),
      isParentPortal ? Promise.resolve([]) : fetchPaymentRecords(),
      isParentPortal ? Promise.resolve([]) : fetchInvoiceRecords(),
    ])
      .then(
        ([
          studentRows,
          practicalLessonRows,
          documentRows,
          notificationRows,
          paymentRows,
          invoiceRows,
        ]) => {
          if (!isMounted) {
            return;
          }

          setStudents(studentRows);
          setLessons(practicalLessonRows);
          setDocuments(documentRows);
          setNotifications(notificationRows);
          setPayments(paymentRows);
          setInvoices(invoiceRows);
          setSourceStatus('backend');
        },
      )
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setStudents([]);
        setLessons([]);
        setDocuments([]);
        setNotifications([]);
        setPayments([]);
        setInvoices([]);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, [isParentPortal]);

  const primaryStudent = students[0] ?? null;
  const upcomingLessons = useMemo(
    () =>
      lessons
        .filter((lesson) =>
          ['scheduled', 'in-progress', 'late'].includes(lesson.status),
        )
        .sort((left, right) =>
          `${left.date} ${left.time}`.localeCompare(
            `${right.date} ${right.time}`,
          ),
        )
        .slice(0, 3),
    [lessons],
  );
  const recentLessons = useMemo(
    () =>
      lessons
        .filter((lesson) => lesson.status === 'completed')
        .slice(0, 3),
    [lessons],
  );
  const expiringDocuments = useMemo(
    () =>
      documents
        .filter((document) =>
          ['expiring-soon', 'expired', 'missing'].includes(document.status),
        )
        .slice(0, 4),
    [documents],
  );
  const dueNotifications = useMemo(
    () => notifications.slice(0, 4),
    [notifications],
  );
  const paidAmount = payments.reduce(
    (sum, payment) => sum + payment.paidAmount,
    0,
  );
  const dueAmount = payments.reduce(
    (sum, payment) => sum + payment.remainingAmount,
    0,
  );

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: 'var(--bg-primary)' }}>
      <PageHeader
        title={`Добре дошли, ${session?.user.displayName || 'портал'}`}
        subtitle={
          isParentPortal
            ? `Родителски портал с достъп само до информацията на свързания курсист · ${sourceStatus === 'backend' ? 'PostgreSQL + Redis' : 'зареждане'}`
            : `Ученически портал за график, плащания, документи и обратна връзка · ${sourceStatus === 'backend' ? 'PostgreSQL + Redis' : 'зареждане'}`
        }
        badge={{
          label: isParentPortal ? 'Родителски портал' : 'Ученически портал',
          variant: 'info',
        }}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={<CalendarDays size={18} />}
              onClick={() => navigate('/practical-lessons')}
            >
              Уроци
            </Button>
            <Button
              variant="secondary"
              icon={<FileText size={18} />}
              onClick={() => navigate('/documents')}
            >
              Документи
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Оставащи часове"
          value={primaryStudent?.remainingHours ?? 0}
          trend={primaryStudent?.name ?? 'Няма свързан курсист'}
          icon={<CalendarDays size={20} />}
          color="var(--primary-accent)"
        />
        <StatCard
          label="Предстоящи часове"
          value={upcomingLessons.length}
          trend={upcomingLessons[0] ? `${upcomingLessons[0].date} · ${upcomingLessons[0].time}` : 'Няма планиран час'}
          icon={<ShieldCheck size={20} />}
          color="var(--ai-accent)"
        />
        <StatCard
          label={isParentPortal ? 'Известия' : 'Платено'}
          value={
            isParentPortal
              ? dueNotifications.length
              : `${paidAmount.toLocaleString('bg-BG')} €`
          }
          trend={isParentPortal ? 'Последни съобщения' : `${payments.length} плащания`}
          icon={isParentPortal ? <Bell size={20} /> : <Wallet size={20} />}
          color="var(--status-success)"
        />
        <StatCard
          label={isParentPortal ? 'Документи за преглед' : 'Оставащо за плащане'}
          value={
            isParentPortal
              ? expiringDocuments.length
              : `${dueAmount.toLocaleString('bg-BG')} €`
          }
          trend={
            isParentPortal
              ? 'Изтичащи или липсващи'
              : `${invoices.length} фактури`
          }
          icon={isParentPortal ? <FileText size={20} /> : <ReceiptText size={20} />}
          color={isParentPortal ? 'var(--status-warning)' : 'var(--status-error)'}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card>
          <CardHeader
            title="Предстоящи часове"
            subtitle="Най-близките учебни часове от реалния график в базата."
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight size={16} />}
                iconPosition="right"
                onClick={() => navigate('/schedule')}
              >
                Виж всички
              </Button>
            }
          />

          <div className="space-y-3">
            {upcomingLessons.length > 0 ? (
              upcomingLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate('/practical-lessons')}
                  className="w-full rounded-xl p-4 text-left transition-all hover:bg-white/[0.03]"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {lesson.date} · {lesson.time}-{lesson.endTime}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {lesson.instructor} · {lesson.vehicle}
                      </p>
                      {lesson.route && (
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          {lesson.route}
                        </p>
                      )}
                    </div>
                    <Badge variant={lesson.status === 'in-progress' ? 'purple' : lesson.status === 'late' ? 'orange' : 'blue'}>
                      {lesson.status === 'in-progress'
                        ? 'В ход'
                        : lesson.status === 'late'
                          ? 'Закъснение'
                          : 'Планиран'}
                    </Badge>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Няма предстоящи часове в момента.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Известия"
            subtitle="Последни operational и parent/student известия."
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight size={16} />}
                iconPosition="right"
                onClick={() => navigate('/notifications')}
              >
                Отвори
              </Button>
            }
          />

          <div className="space-y-3">
            {dueNotifications.length > 0 ? (
              dueNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-xl p-4"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {notification.title}
                    </p>
                    <Badge
                      variant={
                        notification.severity === 'error'
                          ? 'red'
                          : notification.severity === 'warning'
                            ? 'orange'
                            : notification.severity === 'success'
                              ? 'green'
                              : 'blue'
                      }
                    >
                      {notification.eventTimeLabel}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                    {notification.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Няма активни известия към момента.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Card>
          <CardHeader
            title="Документи"
            subtitle="Лични документи и файлове, достъпни за портала."
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight size={16} />}
                iconPosition="right"
                onClick={() => navigate('/documents')}
              >
                Всички
              </Button>
            }
          />

          <div className="space-y-3">
            {(expiringDocuments.length > 0 ? expiringDocuments : documents.slice(0, 4)).map(
              (document) => (
                <div
                  key={document.id}
                  className="rounded-xl p-4"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {document.name}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {document.expiryDate === 'Без срок'
                          ? 'Без срок на валидност'
                          : `Валиден до ${document.expiryDate}`}
                      </p>
                    </div>
                    <Badge
                      variant={
                        document.status === 'valid'
                          ? 'green'
                          : document.status === 'expiring-soon'
                            ? 'orange'
                            : 'red'
                      }
                    >
                      {document.statusLabel}
                    </Badge>
                  </div>
                </div>
              ),
            )}
            {documents.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Няма качени документи.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Последни завършени уроци"
            subtitle="От тук може бързо да отвориш формата за обратна връзка."
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={<MessageSquareText size={16} />}
                onClick={() => navigate('/practical-lessons')}
              >
                Feedback
              </Button>
            }
          />

          <div className="space-y-3">
            {recentLessons.length > 0 ? (
              recentLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate('/practical-lessons')}
                  className="w-full rounded-xl p-4 text-left transition-all hover:bg-white/[0.03]"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {lesson.date} · {lesson.instructor}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {lesson.route || 'Практически урок'} · {lesson.vehicle}
                      </p>
                      <p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        {isParentPortal
                          ? lesson.parentFeedbackComment ||
                            lesson.parentPerformanceSummary ||
                            'Няма родителски коментар още.'
                          : lesson.studentFeedbackComment ||
                            lesson.parentPerformanceSummary ||
                            'Няма въведена ученическа обратна връзка още.'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        isParentPortal
                          ? lesson.parentFeedbackRating
                            ? 'green'
                            : 'gray'
                          : lesson.studentFeedbackRating
                            ? 'green'
                            : 'gray'
                      }
                    >
                      {(isParentPortal
                        ? lesson.parentFeedbackRating
                        : lesson.studentFeedbackRating) || '—'}
                      /5
                    </Badge>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Няма завършени уроци за показване.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
