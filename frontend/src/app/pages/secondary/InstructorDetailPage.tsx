import { ArrowLeft, Car, Clock3, Plus, TriangleAlert, Upload, UserCircle, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui-system/Button';
import { DatePickerInput } from '../../components/date/DatePickerInput';
import { Modal } from '../../components/ui-system/Modal';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import {
  fetchInstructorDetailRows,
} from '../../services/instructorsApi';
import {
  createDocumentRecord,
  uploadDocumentFile,
  type DocumentRecordView,
} from '../../services/documentsApi';
import { useAuthSession } from '../../services/authSession';
import { hasFullAccessRole } from '../../services/roleUtils';
import {
  type InstructorRow,
  type InstructorStudentRow,
} from './secondaryData';
import { DataTableLayout, InfoLine, MetricCard, MetricGrid, PageSection, Panel } from './secondaryShared';

export function InstructorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = useAuthSession();
  const instructorId = id ?? '';
  const [instructor, setInstructor] = useState<InstructorRow | null>(null);
  const [students, setStudents] = useState<InstructorStudentRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRecordView[]>([]);
  const [sourceStatus, setSourceStatus] = useState<'loading' | 'backend' | 'fallback'>('loading');
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentSaveError, setDocumentSaveError] = useState<string | null>(null);
  const [documentForm, setDocumentForm] = useState({
    name: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentFileName, setDocumentFileName] = useState('');
  const canManageDocuments = Boolean(
    hasFullAccessRole(session?.user.roleKeys ?? []) ||
      session?.user.roleKeys.includes('administration'),
  );

  useEffect(() => {
    let isMounted = true;

    fetchInstructorDetailRows(instructorId)
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setInstructor(result.instructor);
        setStudents(result.students);
        setDocuments(result.documents);
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setInstructor(null);
        setStudents([]);
        setDocuments([]);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, [instructorId]);

  const totalMaximumHours = students.reduce((sum, item) => sum + item.maximumHours, 0);
  const totalCompletedHours = students.reduce((sum, item) => sum + item.completedHours, 0);
  const totalRemainingHours = students.reduce((sum, item) => sum + item.remainingHours, 0);

  const handleCreateDocument = async () => {
    if (!session?.csrfToken || !instructor) {
      return;
    }

    if (!documentFile) {
      setDocumentSaveError('Избери файл от компютъра.');
      return;
    }

    setDocumentSaveError(null);

    try {
      const uploadedFile = await uploadDocumentFile(
        documentFile,
        session.csrfToken,
      );
      const createdDocument = await createDocumentRecord(
        {
          name: documentForm.name,
          ownerType: 'INSTRUCTOR',
          ownerName: instructor.name,
          ownerRef: String(instructor.id),
          category: documentForm.name,
          issueDate: documentForm.issueDate,
          expiryDate: documentForm.expiryDate || null,
          status: documentForm.expiryDate
            ? resolveDocumentStatus(documentForm.expiryDate)
            : 'VALID',
          fileUrl: uploadedFile.fileUrl,
          notes: documentForm.notes || null,
        },
        session.csrfToken,
      );

      setDocuments((current) => [createdDocument, ...current]);
      setDocumentForm({
        name: '',
        issueDate: '',
        expiryDate: '',
        notes: '',
      });
      setDocumentFile(null);
      setDocumentFileName('');
      setIsDocumentModalOpen(false);
    } catch (error) {
      setDocumentSaveError(
        error instanceof Error
          ? error.message
          : 'Документът не беше добавен.',
      );
    }
  };

  if (!instructor && sourceStatus === 'loading') {
    return (
      <div>
        <PageHeader
          title="Зареждане на инструктор"
          description="Данните за инструктора се зареждат от PostgreSQL."
          breadcrumbs={[{ label: 'Начало' }, { label: 'Инструктори' }, { label: 'Зареждане' }]}
          actions={<Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={() => navigate('/instructors')}>Назад към инструктори</Button>}
        />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div>
        <PageHeader
          title="Инструкторът не е намерен"
          description="Избраният инструктор липсва в текущите данни от базата."
          breadcrumbs={[{ label: 'Начало' }, { label: 'Инструктори' }, { label: 'Липсващ запис' }]}
          actions={<Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={() => navigate('/instructors')}>Назад към инструктори</Button>}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={instructor.name}
        description={`Детайлен изглед на инструктора, неговите курсисти и оставащите учебни часове до завършване. ${
          sourceStatus === 'backend'
            ? 'Данните за курсистите са от PostgreSQL.'
            : sourceStatus === 'fallback'
              ? 'Backend данните не са достъпни в момента.'
              : 'Зареждане на курсисти...'
        }`}
        breadcrumbs={[{ label: 'Начало' }, { label: 'Инструктори' }, { label: instructor.name }]}
        actions={<Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={() => navigate('/instructors')}>Назад към инструктори</Button>}
      />

      <PageSection>
        <MetricGrid>
          <MetricCard icon={<Users size={18} />} label="Курсисти на инструктора" value={String(students.length)} detail="Активни в момента" />
          <MetricCard icon={<Clock3 size={18} />} label="Оставащи часове общо" value={String(totalRemainingHours)} detail={`От максимум ${totalMaximumHours} часа`} />
          <MetricCard icon={<Clock3 size={18} />} label="Изкарани часове" value={String(totalCompletedHours)} detail="Натрупани по всички курсисти" />
          <MetricCard icon={<TriangleAlert size={18} />} label="Платежни сигнали" value={String(instructor.paymentAlerts)} detail="Курсисти с нужда от напомняне" tone={instructor.paymentAlerts > 0 ? 'warning' : 'info'} />
        </MetricGrid>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
          <Panel title="Профил на инструктора" subtitle="Основната оперативна информация е събрана на едно място, за да се виждат бързо натоварването, автомобилът и текущият статус.">
            <div className="space-y-4">
              <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(180deg, rgba(18, 27, 50, 0.96) 0%, rgba(14, 22, 42, 0.98) 100%)', border: '1px solid var(--ghost-border)' }}>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'rgba(99, 102, 241, 0.14)', color: 'var(--primary-accent)' }}>
                    <UserCircle size={28} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{instructor.name}</h2>
                    <p className="mt-1 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{instructor.role}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.025)' }}>
                <InfoLine label="Автомобил" value={instructor.vehicle} />
                <InfoLine label="Следващ час" value={instructor.nextLesson} />
                <InfoLine label="Теоретична група" value={instructor.theoryGroup} />
                <InfoLine label="Натоварване" value={instructor.workload} />
              </div>
              <div className="rounded-2xl p-4" style={{ background: instructor.documentStatus === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)', border: instructor.documentStatus === 'warning' ? '1px solid rgba(245, 158, 11, 0.22)' : '1px solid rgba(34, 197, 94, 0.22)' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Документи</span>
                  <StatusBadge status={instructor.documentStatus}>{instructor.documentStatus === 'warning' ? 'Изисква внимание' : 'Изрядни'}</StatusBadge>
                </div>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  {instructor.documentStatus === 'warning' ? 'Инструкторът има документ, който изтича скоро и трябва да се поднови.' : 'Няма активни проблеми с документите на инструктора.'}
                </p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.22)' }}>
                <div className="flex items-center gap-3">
                  <Car size={18} style={{ color: 'var(--primary-accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Работен автомобил</span>
                </div>
                <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  Този инструктор е вързан към {instructor.vehicle} и графикът му се планира спрямо този автомобил.
                </p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--ghost-border)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Досие на инструктора</p>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Документите на този инструктор се поддържат отделно от персоналния регистър.
                    </p>
                  </div>
                  {canManageDocuments ? (
                    <Button
                      variant="secondary"
                      icon={<Upload size={16} />}
                      onClick={() => setIsDocumentModalOpen(true)}
                    >
                      Добави документ
                    </Button>
                  ) : null}
                </div>

                <div className="mt-4 space-y-3">
                  {documents.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Няма добавени документи в досието на инструктора.
                    </p>
                  ) : (
                    documents.map((document) => (
                      <div
                        key={String(document.id)}
                        className="rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {document.name}
                            </p>
                            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {document.category} · Валиден до {document.expiryDate}
                            </p>
                          </div>
                          <StatusBadge status={document.status === 'valid' ? 'success' : document.status === 'expiring-soon' ? 'warning' : 'error'}>
                            {document.statusLabel}
                          </StatusBadge>
                        </div>
                        {document.notes ? (
                          <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                            {document.notes}
                          </p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Panel>
          <Panel title="Курсисти на инструктора" subtitle="Списъкът показва етапа на всеки курсист, максималните часове и колко още часа остават до приключване.">
            <div className="mb-5 grid gap-3 rounded-3xl p-4 md:grid-cols-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--ghost-border)' }}>
              <div>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>Общо изкарани часове</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{totalCompletedHours} ч</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>Общо оставащи часове</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: 'var(--status-warning)' }}>{totalRemainingHours} ч</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>Максимум по всички курсисти</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{totalMaximumHours} ч</p>
              </div>
            </div>

            <DataTableLayout
              columns={['Курсист', 'Категория', 'Етап', 'Изкарани часове', 'Оставащи часове', 'Максимум', 'Следващ час']}
              rows={students.map((item) => [
                <div key={`${item.id}-name`}>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.studentName}</p>
                  <div className="mt-2">
                    <StatusBadge status={item.status}>{item.status === 'warning' ? 'Изисква внимание' : item.status === 'success' ? 'Финален етап' : 'Активен'}</StatusBadge>
                  </div>
                </div>,
                item.category,
                item.currentStage,
                String(item.completedHours) + ' ч',
                <span key={String(item.id) + '-remaining'} style={{ color: item.remainingHours > 10 ? 'var(--status-warning)' : 'var(--text-primary)' }}>{item.remainingHours} ч</span>,
                String(item.maximumHours) + ' ч',
                item.nextLesson,
              ])}
            />
          </Panel>
        </div>
      </PageSection>

      <Modal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        title="Добави документ към досието"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDocumentModalOpen(false)}>
              Отказ
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => void handleCreateDocument()}
            >
              Запази документа
            </Button>
          </>
        }
      >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Име на документа
            <input
              value={documentForm.name}
              onChange={(event) =>
                setDocumentForm((current) => ({ ...current, name: event.target.value }))
              }
              className="mt-2 h-11 w-full rounded-xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
            />
          </label>
          <label className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Дата на издаване
            <DatePickerInput
              value={documentForm.issueDate}
              onChange={(value) =>
                setDocumentForm((current) => ({ ...current, issueDate: value }))
              }
              className="mt-2 h-11 w-full rounded-xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
            />
          </label>
          <label className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Валиден до
            <DatePickerInput
              value={documentForm.expiryDate}
              onChange={(value) =>
                setDocumentForm((current) => ({ ...current, expiryDate: value }))
              }
              className="mt-2 h-11 w-full rounded-xl px-4 text-sm outline-none"
              style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
            />
          </label>
          <label className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Файл
            <input
              id="instructor-document-file"
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null;
                setDocumentFile(selectedFile);
                setDocumentFileName(selectedFile?.name ?? '');
              }}
              className="hidden"
            />
            <label
              htmlFor="instructor-document-file"
              className="mt-2 flex min-h-28 w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-all hover:shadow-[var(--glow-indigo)]"
              style={{
                background: 'var(--bg-panel)',
                borderColor: documentFileName
                  ? 'rgba(59, 130, 246, 0.32)'
                  : 'var(--ghost-border)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: documentFileName
                      ? 'rgba(59, 130, 246, 0.14)'
                      : 'rgba(148, 163, 184, 0.12)',
                    color: documentFileName
                      ? 'var(--primary-accent)'
                      : 'var(--text-secondary)',
                  }}
                >
                  <Upload size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {documentFileName ? 'Файлът е избран' : 'Избери файл от компютъра'}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {documentFileName || 'PDF, JPG, PNG и други изображения'}
                  </p>
                </div>
              </div>
              <span
                className="rounded-xl px-3 py-2 text-xs font-medium"
                style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: 'var(--primary-accent)',
                }}
              >
                Качи файл
              </span>
            </label>
            {documentFileName ? (
              <span className="mt-2 block text-xs" style={{ color: 'var(--text-secondary)' }}>
                Избран файл: {documentFileName}
              </span>
            ) : null}
          </label>
          <label className="text-sm md:col-span-2" style={{ color: 'var(--text-primary)' }}>
            Бележки
            <textarea
              value={documentForm.notes}
              onChange={(event) =>
                setDocumentForm((current) => ({ ...current, notes: event.target.value }))
              }
              rows={4}
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
            />
          </label>
        </div>
        {documentSaveError ? (
          <p className="mt-4 text-sm" style={{ color: 'var(--status-error)' }}>
            {documentSaveError}
          </p>
        ) : null}
        <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Статусът се изчислява автоматично от датата на валидност.
        </p>
      </Modal>
    </div>
  );
}

function resolveDocumentStatus(expiryDate: string) {
  const dayMs = 24 * 60 * 60 * 1000;
  const remainingDays = Math.ceil(
    (new Date(`${expiryDate}T00:00:00.000Z`).getTime() -
      new Date().setHours(0, 0, 0, 0)) /
      dayMs,
  );

  if (remainingDays < 0) {
    return 'EXPIRED' as const;
  }

  if (remainingDays <= 60) {
    return 'EXPIRING_SOON' as const;
  }

  return 'VALID' as const;
}
