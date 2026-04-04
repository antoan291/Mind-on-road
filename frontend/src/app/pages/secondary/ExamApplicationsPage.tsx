import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  History,
  RefreshCw,
  Send,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { Button } from '../../components/ui-system/Button';
import { FilterBar } from '../../components/ui-system/FilterBar';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import {
  fetchStudentOperations,
  type StudentOperationalRecord,
} from '../../services/studentsApi';
import {
  fetchExamApplicationRecords,
  generateExamApplicationRecord,
  updateExamApplicationStatus,
  type ExamApplicationStatus,
  type ExamApplicationView,
} from '../../services/examApplicationsApi';
import { useAuthSession } from '../../services/authSession';

const STATUS_OPTIONS: Array<{
  value: ExamApplicationStatus;
  label: string;
}> = [
  { value: 'DRAFT', label: 'Чернова' },
  { value: 'READY_FOR_REVIEW', label: 'Готово за преглед' },
  { value: 'SENT', label: 'Изпратено' },
  { value: 'RECEIVED', label: 'Получено' },
  { value: 'APPROVED', label: 'Одобрено' },
  { value: 'REJECTED', label: 'Отхвърлено' },
];

export function ExamApplicationsPage() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [applications, setApplications] = useState<ExamApplicationView[]>([]);
  const [students, setStudents] = useState<StudentOperationalRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ExamApplicationStatus>(
    'all',
  );
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [statusDraft, setStatusDraft] = useState<ExamApplicationStatus>('DRAFT');
  const [statusNote, setStatusNote] = useState('');
  const [actionState, setActionState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchExamApplicationRecords(), fetchStudentOperations()])
      .then(([applicationRows, studentRows]) => {
        if (!isMounted) return;

        setApplications(applicationRows);
        setStudents(studentRows);
        setSelectedStudentId((current) => current || studentRows[0]?.id || '');
        setSelectedApplicationId((current) =>
          current || applicationRows[0]?.id || '',
        );
      })
      .catch(() => {
        if (!isMounted) return;

        setApplications([]);
        setStudents([]);
        setActionState('error');
        setActionMessage('Неуспешно зареждане на заявленията.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredApplications = useMemo(
    () =>
      applications.filter((application) => {
        const matchesStatus =
          statusFilter === 'all' || application.status === statusFilter;
        const matchesSearch = [
          application.studentName,
          application.applicationNumber,
          application.categoryCode,
          application.examOfficeName,
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchValue.trim().toLowerCase());

        return matchesStatus && matchesSearch;
      }),
    [applications, searchValue, statusFilter],
  );

  const selectedApplication =
    filteredApplications.find(
      (application) => application.id === selectedApplicationId,
    ) ||
    applications.find((application) => application.id === selectedApplicationId) ||
    filteredApplications[0] ||
    applications[0] ||
    null;

  useEffect(() => {
    if (!selectedApplication) return;

    setSelectedApplicationId(selectedApplication.id);
    setStatusDraft(selectedApplication.status);
    setStatusNote(selectedApplication.statusNote ?? '');
  }, [selectedApplication?.id, selectedApplication?.status, selectedApplication?.statusNote]);

  const readyCount = applications.filter(
    (application) => application.status === 'READY_FOR_REVIEW',
  ).length;
  const blockedCount = applications.filter(
    (application) => application.missingRequirements.length > 0,
  ).length;
  const approvedCount = applications.filter(
    (application) => application.status === 'APPROVED',
  ).length;

  return (
    <div>
      <PageHeader
        title="Заявления за изпит"
        description="Автоматично генериране, валидация на липсващи данни и история на промените за всяко заявление."
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Заявления за изпит' },
        ]}
        actions={
          <Button
            variant="secondary"
            icon={<RefreshCw size={18} />}
            onClick={async () => {
              const [applicationRows, studentRows] = await Promise.all([
                fetchExamApplicationRecords(),
                fetchStudentOperations(),
              ]);

              setApplications(applicationRows);
              setStudents(studentRows);
              setSelectedStudentId((current) =>
                current || studentRows[0]?.id || '',
              );
              setActionState('success');
              setActionMessage('Списъкът със заявления е обновен.');
            }}
          >
            Обнови
          </Button>
        }
      />

      <div className="p-6 lg:p-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <SummaryCard
            icon={<FileCheck2 size={22} />}
            label="Готови за преглед"
            value={readyCount}
            tone="info"
          />
          <SummaryCard
            icon={<ShieldAlert size={22} />}
            label="С липсващи данни"
            value={blockedCount}
            tone="warning"
          />
          <SummaryCard
            icon={<CheckCircle2 size={22} />}
            label="Одобрени"
            value={approvedCount}
            tone="success"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(420px,1.2fr)_minmax(380px,0.8fr)]">
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto]">
              <select
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                className="h-12 rounded-xl px-4 text-sm outline-none"
                style={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} · {student.category}
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                icon={<FileCheck2 size={18} />}
                disabled={!selectedStudentId || actionState === 'loading'}
                onClick={async () => {
                  if (!selectedStudentId) return;

                  setActionState('loading');
                  setActionMessage('Генериране на заявление...');

                  try {
                    const generatedApplication =
                      await generateExamApplicationRecord(
                        selectedStudentId,
                        session?.csrfToken ?? '',
                      );

                    setApplications((current) => {
                      const exists = current.some(
                        (item) => item.id === generatedApplication.id,
                      );

                      return exists
                        ? current.map((item) =>
                            item.id === generatedApplication.id
                              ? generatedApplication
                              : item,
                          )
                        : [generatedApplication, ...current];
                    });
                    setSelectedApplicationId(generatedApplication.id);
                    setActionState('success');
                    setActionMessage(
                      `Заявлението ${generatedApplication.applicationNumber} е генерирано.`,
                    );
                  } catch (error) {
                    setActionState('error');
                    setActionMessage(
                      error instanceof Error
                        ? error.message
                        : 'Неуспешно генериране на заявление.',
                    );
                  }
                }}
              >
                Генерирай
              </Button>
            </div>

            <div className="mt-5">
              <FilterBar
                searchPlaceholder="Търсене по курсист, номер, категория, ДАИ..."
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                showFilterButton={false}
                filters={[
                  {
                    label: 'Статус',
                    value: statusFilter,
                    options: [
                      { value: 'all', label: 'Всички' },
                      ...STATUS_OPTIONS,
                    ],
                    onChange: (value) =>
                      setStatusFilter(value as 'all' | ExamApplicationStatus),
                  },
                ]}
              />
            </div>

            <div className="mt-5 space-y-3">
              {filteredApplications.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Няма намерени заявления.
                </p>
              ) : (
                filteredApplications.map((application) => (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() => setSelectedApplicationId(application.id)}
                    className="w-full rounded-xl p-4 text-left transition-all"
                    style={{
                      background:
                        selectedApplication?.id === application.id
                          ? 'rgba(99, 102, 241, 0.08)'
                          : 'var(--bg-panel)',
                      border:
                        selectedApplication?.id === application.id
                          ? '1px solid rgba(99, 102, 241, 0.35)'
                          : '1px solid var(--border-color)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className="font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {application.studentName}
                        </p>
                        <p
                          className="mt-1 text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {application.applicationNumber} · Кат.{' '}
                          {application.categoryCode} · {application.examOfficeName}
                        </p>
                      </div>
                      <StatusBadge status={application.statusTone} size="small">
                        {application.statusLabel}
                      </StatusBadge>
                    </div>

                    {application.missingRequirements.length > 0 && (
                      <div
                        className="mt-3 rounded-lg px-3 py-2 text-xs"
                        style={{
                          background: 'var(--status-warning-bg)',
                          color: 'var(--status-warning)',
                        }}
                      >
                        Липсва: {application.missingRequirements.join(', ')}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}
          >
            {selectedApplication ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-xs uppercase tracking-[0.18em]"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Активно заявление
                    </p>
                    <h2
                      className="mt-2 text-2xl font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {selectedApplication.applicationNumber}
                    </h2>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {selectedApplication.studentName} · Кат.{' '}
                      {selectedApplication.categoryCode}
                    </p>
                  </div>
                  <StatusBadge
                    status={selectedApplication.statusTone}
                    size="small"
                  >
                    {selectedApplication.statusLabel}
                  </StatusBadge>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <DetailTile
                    label="ДАИ офис"
                    value={selectedApplication.examOfficeName}
                  />
                  <DetailTile
                    label="Предпочитана дата"
                    value={selectedApplication.preferredExamDate ?? 'Не е зададена'}
                  />
                  <DetailTile
                    label="Обновено на"
                    value={selectedApplication.updatedAt.slice(0, 10)}
                  />
                  <DetailTile
                    label="Изпратено на"
                    value={selectedApplication.submittedAt?.slice(0, 10) ?? '—'}
                  />
                </div>

                <div className="mt-6 grid gap-3">
                  <select
                    value={statusDraft}
                    onChange={(event) =>
                      setStatusDraft(event.target.value as ExamApplicationStatus)
                    }
                    className="h-12 rounded-xl px-4 text-sm outline-none"
                    style={{
                      background: 'var(--bg-panel)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option
                        key={statusOption.value}
                        value={statusOption.value}
                      >
                        {statusOption.label}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={statusNote}
                    onChange={(event) => setStatusNote(event.target.value)}
                    placeholder="Бележка към промяната..."
                    className="min-h-24 rounded-xl p-4 text-sm outline-none"
                    style={{
                      background: 'var(--bg-panel)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />

                  <Button
                    variant="secondary"
                    icon={<Send size={18} />}
                    disabled={actionState === 'loading'}
                    onClick={async () => {
                      setActionState('loading');
                      setActionMessage('Записване на статус...');

                      try {
                        const updatedApplication =
                          await updateExamApplicationStatus(
                            selectedApplication.id,
                            {
                              status: statusDraft,
                              statusNote: statusNote.trim() || null,
                            },
                            session?.csrfToken ?? '',
                          );

                        setApplications((current) =>
                          current.map((item) =>
                            item.id === updatedApplication.id
                              ? updatedApplication
                              : item,
                          ),
                        );
                        setSelectedApplicationId(updatedApplication.id);
                        setActionState('success');
                        setActionMessage(
                          `Статусът е обновен на "${updatedApplication.statusLabel}".`,
                        );
                      } catch (error) {
                        setActionState('error');
                        setActionMessage(
                          error instanceof Error
                            ? error.message
                            : 'Неуспешно обновяване на статуса.',
                        );
                      }
                    }}
                  >
                    Запази статус
                  </Button>
                </div>

                {selectedApplication.missingRequirements.length > 0 && (
                  <div
                    className="mt-6 rounded-xl p-4"
                    style={{
                      background: 'var(--status-warning-bg)',
                      border: '1px solid var(--status-warning-border)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        size={18}
                        style={{ color: 'var(--status-warning)' }}
                      />
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--status-warning)' }}
                      >
                        Заявлението не може да се изпрати
                      </p>
                    </div>
                    <ul
                      className="mt-3 list-disc space-y-1 pl-5 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {selectedApplication.missingRequirements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8">
                  <div className="flex items-center gap-2">
                    <History
                      size={18}
                      style={{ color: 'var(--primary-accent)' }}
                    />
                    <h3
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      История на промените
                    </h3>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedApplication.revisionHistory.length === 0 ? (
                      <p
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Няма записани промени.
                      </p>
                    ) : (
                      selectedApplication.revisionHistory.map((revision) => (
                        <div
                          key={revision.id}
                          className="rounded-xl p-4"
                          style={{
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {revision.changeSummary}
                          </p>
                          <p
                            className="mt-1 text-xs"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {revision.actorName} ·{' '}
                            {new Date(revision.changedAt).toLocaleString('bg-BG')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <UserRound
                  size={32}
                  style={{ color: 'var(--text-tertiary)' }}
                  className="mx-auto"
                />
                <p
                  className="mt-3 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Избери курсист и генерирай заявление.
                </p>
              </div>
            )}
          </div>
        </div>

        {actionMessage && (
          <p
            className="mt-4 text-sm"
            style={{
              color:
                actionState === 'error'
                  ? 'var(--status-error)'
                  : actionState === 'success'
                    ? 'var(--status-success)'
                    : 'var(--text-secondary)',
            }}
          >
            {actionMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'info' | 'warning' | 'success';
}) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          background:
            tone === 'warning'
              ? 'var(--status-warning-bg)'
              : tone === 'success'
                ? 'var(--status-success-bg)'
                : 'rgba(99, 102, 241, 0.12)',
          color:
            tone === 'warning'
              ? 'var(--status-warning)'
              : tone === 'success'
                ? 'var(--status-success)'
                : 'var(--primary-accent)',
        }}
      >
        {icon}
      </div>
      <p
        className="mt-4 text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </p>
      <p
        className="mt-2 text-3xl font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
      }}
    >
      <p
        className="text-xs uppercase tracking-[0.14em]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </p>
      <p
        className="mt-2 text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}
