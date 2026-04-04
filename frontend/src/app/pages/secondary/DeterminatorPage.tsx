import { Activity, Gauge, Hash, Plus, ShieldCheck, Timer, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui-system/Button';
import { PageHeader } from '../../components/ui-system/PageHeader';
import {
  calculateAutoTempoSuccessCoefficient,
  calculateForcedTempoSuccessCoefficient,
  determinatorSessions as initialSessions,
  studentOperationalRecords,
  type DeterminatorSession,
  type StudentOperationalRecord,
} from '../../content/studentOperations';
import { useAuthSession } from '../../services/authSession';
import {
  createDeterminatorSession,
  fetchDeterminatorSessions,
} from '../../services/determinatorApi';
import { fetchStudentOperations } from '../../services/studentsApi';
import {
  DataTableLayout,
  InfoLine,
  MetricCard,
  MetricGrid,
  PageSection,
  Panel,
} from './secondaryShared';

export function DeterminatorPage() {
  const { session } = useAuthSession();
  const [students, setStudents] = useState<StudentOperationalRecord[]>(
    studentOperationalRecords,
  );
  const [sessions, setSessions] = useState<DeterminatorSession[]>(initialSessions);
  const [selectedStudentId, setSelectedStudentId] = useState(String(studentOperationalRecords[0]?.id ?? 1));
  const [formData, setFormData] = useState({
    autoTempoCorrectReactions: '69',
    autoTempoWrongReactions: '1',
    forcedTempoCorrectReactions: '59',
    forcedTempoDelayedReactions: '1',
    forcedTempoWrongResults: '0',
    forcedTempoMissedStimuli: '0',
    overallResult: '',
    instructorNote: '',
  });
  const [sourceStatus, setSourceStatus] = useState<'loading' | 'backend' | 'fallback'>('loading');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchStudentOperations(), fetchDeterminatorSessions()])
      .then(([nextStudents, nextSessions]) => {
        if (!isMounted) {
          return;
        }

        const mappedSessions: DeterminatorSession[] = nextSessions.map((protocol) => ({
          ...protocol,
          measuredAt: new Date(protocol.measuredAt).toLocaleString('bg-BG'),
        }));

        setStudents(nextStudents);
        setSessions(mappedSessions);
        setSelectedStudentId(String(nextStudents[0]?.id ?? studentOperationalRecords[0]?.id ?? 1));
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setStudents(studentOperationalRecords);
        setSessions(initialSessions);
        setSelectedStudentId(String(studentOperationalRecords[0]?.id ?? 1));
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedStudent = useMemo(
    () =>
      students.find((student) => String(student.id) === selectedStudentId) ??
      students[0],
    [selectedStudentId, students],
  );

  const selectedStudentSessions = useMemo(
    () => sessions.filter((session) => String(session.studentId) === selectedStudentId),
    [sessions, selectedStudentId],
  );

  const latestSession = selectedStudentSessions[0] ?? null;

  const autoTempoCoefficient = calculateAutoTempoSuccessCoefficient(
    Number(formData.autoTempoCorrectReactions) || 0,
  );
  const forcedTempoCoefficient = calculateForcedTempoSuccessCoefficient(
    Number(formData.forcedTempoCorrectReactions) || 0,
    Number(formData.forcedTempoDelayedReactions) || 0,
    Number(formData.forcedTempoWrongResults) || 0,
    Number(formData.forcedTempoMissedStimuli) || 0,
  );

  const averageForcedTempo = selectedStudentSessions.length
    ? Number(
        (
          selectedStudentSessions.reduce(
            (sum, session) => sum + session.forcedTempoSuccessCoefficient,
            0,
          ) / selectedStudentSessions.length
        ).toFixed(3),
      )
    : 0;

  const handleAddSession = async () => {
    if (!selectedStudent) return;
    setSubmitError(null);
    const shouldPersistToBackend =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        String(selectedStudent.id),
      ) && Boolean(session?.csrfToken);

    const payload = {
      studentId: String(selectedStudent.id),
      registrationNumber:
        selectedStudent.groupNumber || `REG-${selectedStudent.id}`,
      autoTempoCorrectReactions:
        Number(formData.autoTempoCorrectReactions) || 0,
      autoTempoWrongReactions: Number(formData.autoTempoWrongReactions) || 0,
      forcedTempoCorrectReactions:
        Number(formData.forcedTempoCorrectReactions) || 0,
      forcedTempoDelayedReactions:
        Number(formData.forcedTempoDelayedReactions) || 0,
      forcedTempoWrongResults: Number(formData.forcedTempoWrongResults) || 0,
      forcedTempoMissedStimuli:
        Number(formData.forcedTempoMissedStimuli) || 0,
      overallResult: formData.overallResult.trim() || null,
      instructorNote: formData.instructorNote.trim() || null,
    };

    try {
      const savedSession =
        shouldPersistToBackend && session?.csrfToken
          ? await createDeterminatorSession(payload, session.csrfToken)
          : {
              id: `det-${Date.now()}`,
              ...payload,
              studentName: selectedStudent.name,
              measuredAt: new Date().toISOString(),
              autoTempoSuccessCoefficient: autoTempoCoefficient,
              forcedTempoSuccessCoefficient: forcedTempoCoefficient,
              overallResult:
                payload.overallResult ??
                `Автотемп ${autoTempoCoefficient.toFixed(3)} · Наложен темп ${forcedTempoCoefficient.toFixed(3)}.`,
              instructorNote:
                payload.instructorNote ??
                'Измерването е записано по показателите от детерминатора.',
            };

      setSessions((current) => [
        {
          ...savedSession,
          measuredAt: new Date(savedSession.measuredAt).toLocaleString('bg-BG'),
        },
        ...current,
      ]);
      setFormData((current) => ({
        ...current,
        overallResult: '',
        instructorNote: '',
      }));
      setSourceStatus(shouldPersistToBackend ? 'backend' : 'fallback');
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Неуспешен запис на детерминатор протокол.',
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Детерминатор"
        description="Запис на реалните показатели от уреда: автотемп, наложен темп, коефициенти и история по регистрационен номер."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Детерминатор' }]}
      />

      <PageSection>
        <MetricGrid>
          <MetricCard
            icon={<Activity size={18} />}
            label="Измервания"
            value={String(sessions.length)}
            detail="Всички записани протоколи"
            tone="info"
          />
          <MetricCard
            icon={<Gauge size={18} />}
            label="Автотемп коефициент"
            value={autoTempoCoefficient.toFixed(3)}
            detail="Автоматична калкулация от верни реакции"
            tone="success"
          />
          <MetricCard
            icon={<Timer size={18} />}
            label="Наложен темп коефициент"
            value={forcedTempoCoefficient.toFixed(3)}
            detail="Верни + забавени - грешни - пропуснати"
            tone="warning"
          />
          <MetricCard
            icon={<ShieldCheck size={18} />}
            label="Среден наложен темп"
            value={averageForcedTempo.toFixed(3)}
            detail={selectedStudent?.name ?? 'Избран курсист'}
            tone="neutral"
          />
        </MetricGrid>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <Panel
            title="Нов детерминатор протокол"
            subtitle="Въведи имената и регистрационния номер чрез избран курсист, после попълни двете секции от уреда."
          >
            <div className="space-y-5">
              <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {sourceStatus === 'loading'
                  ? 'Зареждане...'
                  : sourceStatus === 'backend'
                    ? 'Данни от PostgreSQL'
                    : 'Fallback към локални mock данни'}
              </div>

              {submitError && (
                <div
                  className="rounded-2xl px-4 py-3 text-sm"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: 'var(--status-error)',
                    border: '1px solid rgba(239, 68, 68, 0.18)',
                  }}
                >
                  {submitError}
                </div>
              )}

              <div
                className="rounded-3xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(25, 37, 64, 0.96))',
                  border: '1px solid rgba(99, 102, 241, 0.22)',
                }}
              >
                <label
                  className="mb-2 block text-xs uppercase tracking-[0.16em]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Студент
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(event) => setSelectedStudentId(event.target.value)}
                  className="h-12 w-full rounded-2xl px-4 text-sm outline-none"
                  style={{
                    background: 'var(--bg-card-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  {students.map((student) => (
                    <option key={student.id} value={String(student.id)}>
                      {student.name}
                    </option>
                  ))}
                </select>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <InfoLine label="Имена" value={selectedStudent?.name ?? '—'} />
                  <InfoLine
                    label="Рег. номер"
                    value={selectedStudent?.groupNumber || `REG-${selectedStudent?.id ?? ''}`}
                  />
                </div>
              </div>

              <div className="grid gap-5">
                <section
                  className="rounded-[28px] p-5"
                  style={{
                    background: 'var(--bg-card-elevated)',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  <SectionHeader
                    icon={<Gauge size={18} />}
                    title="Автотемп"
                    result={autoTempoCoefficient.toFixed(3)}
                  />
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <NumberBox
                      label="Верни реакции"
                      value={formData.autoTempoCorrectReactions}
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          autoTempoCorrectReactions: value,
                        }))
                      }
                    />
                    <NumberBox
                      label="Грешни реакции"
                      value={formData.autoTempoWrongReactions}
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          autoTempoWrongReactions: value,
                        }))
                      }
                    />
                  </div>
                  <FormulaNote text="Текуща формула по примера ти: коефициент = верни реакции / 2." />
                </section>

                <section
                  className="rounded-[28px] p-5"
                  style={{
                    background: 'var(--bg-card-elevated)',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  <SectionHeader
                    icon={<Timer size={18} />}
                    title="Наложен темп"
                    result={forcedTempoCoefficient.toFixed(3)}
                  />
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <NumberBox
                      label="Верни реакции"
                      value={formData.forcedTempoCorrectReactions}
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          forcedTempoCorrectReactions: value,
                        }))
                      }
                    />
                    <NumberBox
                      label="Забавени реакции"
                      value={formData.forcedTempoDelayedReactions}
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          forcedTempoDelayedReactions: value,
                        }))
                      }
                    />
                    <NumberBox
                      label="Грешни резултати"
                      value={formData.forcedTempoWrongResults}
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          forcedTempoWrongResults: value,
                        }))
                      }
                    />
                    <NumberBox
                      label="Пропуснати стимули"
                      value={formData.forcedTempoMissedStimuli}
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          forcedTempoMissedStimuli: value,
                        }))
                      }
                    />
                  </div>
                  <FormulaNote text="Текуща формула по примера ти: верни + забавени - грешни - пропуснати." />
                </section>
              </div>

              <textarea
                value={formData.overallResult}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    overallResult: event.target.value,
                  }))
                }
                placeholder="Обобщение..."
                rows={3}
                className="w-full resize-none rounded-3xl p-4 text-sm outline-none"
                style={{
                  background: 'var(--bg-card-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--ghost-border)',
                }}
              />

              <textarea
                value={formData.instructorNote}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    instructorNote: event.target.value,
                  }))
                }
                placeholder="Бележка..."
                rows={3}
                className="w-full resize-none rounded-3xl p-4 text-sm outline-none"
                style={{
                  background: 'var(--bg-card-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--ghost-border)',
                }}
              />

              <Button variant="primary" icon={<Plus size={18} />} onClick={handleAddSession}>
                Запиши протокол
              </Button>
            </div>
          </Panel>

          <Panel
            title="История по студент"
            subtitle="Само записите за избрания студент, с двете коефициентни стойности и регистрационен номер."
          >
            {latestSession && (
              <div
                className="mb-6 rounded-[28px] p-5"
                style={{
                  background: 'linear-gradient(180deg, rgba(18, 27, 50, 0.96), rgba(14, 22, 42, 0.98))',
                  border: '1px solid var(--ghost-border)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        background: 'rgba(99, 102, 241, 0.14)',
                        color: 'var(--primary-accent)',
                      }}
                    >
                      <User size={24} />
                    </div>
                    <div>
                      <p
                        className="text-xs uppercase tracking-[0.18em]"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Последен протокол
                      </p>
                      <h3
                        className="mt-2 text-xl font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {latestSession.studentName}
                      </h3>
                      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Рег. номер {latestSession.registrationNumber} · {latestSession.measuredAt}
                      </p>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3 text-right"
                    style={{
                      background: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    <p
                      className="text-xs uppercase tracking-[0.16em]"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Наложен темп
                    </p>
                    <p className="mt-2 text-2xl font-semibold" style={{ color: 'var(--status-success)' }}>
                      {latestSession.forcedTempoSuccessCoefficient.toFixed(3)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <InfoLine
                    label="Автотемп"
                    value={`${latestSession.autoTempoSuccessCoefficient.toFixed(3)} · ${latestSession.autoTempoCorrectReactions} верни / ${latestSession.autoTempoWrongReactions} грешни`}
                  />
                  <InfoLine
                    label="Наложен темп"
                    value={`${latestSession.forcedTempoSuccessCoefficient.toFixed(3)} · ${latestSession.forcedTempoCorrectReactions} верни, ${latestSession.forcedTempoDelayedReactions} забавени`}
                  />
                </div>

                <p className="mt-5 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  {latestSession.overallResult}
                </p>
                <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-tertiary)' }}>
                  {latestSession.instructorNote}
                </p>
              </div>
            )}

            <DataTableLayout
              columns={[
                'Дата',
                'Рег. номер',
                'Автотемп верни/грешни',
                'Автотемп коеф.',
                'Наложен темп',
                'Наложен коеф.',
              ]}
              rows={selectedStudentSessions.map((session) => [
                session.measuredAt,
                session.registrationNumber,
                `${session.autoTempoCorrectReactions}/${session.autoTempoWrongReactions}`,
                session.autoTempoSuccessCoefficient.toFixed(3),
                `${session.forcedTempoCorrectReactions} верни · ${session.forcedTempoDelayedReactions} забавени · ${session.forcedTempoWrongResults} грешни · ${session.forcedTempoMissedStimuli} пропуснати`,
                session.forcedTempoSuccessCoefficient.toFixed(3),
              ])}
            />

            {!selectedStudentSessions.length && (
              <div
                className="mt-4 flex items-center gap-3 rounded-2xl p-4 text-sm"
                style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(59, 130, 246, 0.18)',
                }}
              >
                <ShieldCheck size={18} style={{ color: 'var(--primary-accent)' }} />
                Няма записани детерминатор протоколи за този студент.
              </div>
            )}
          </Panel>
        </div>
      </PageSection>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  result,
}: {
  icon: React.ReactNode;
  title: string;
  result: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--primary-accent)',
          }}
        >
          {icon}
        </div>
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
      </div>
      <div className="text-right">
        <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>
          Коефициент
        </p>
        <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {result}
        </p>
      </div>
    </div>
  );
}

function NumberBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        className="mb-2 block text-xs uppercase tracking-[0.16em]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </label>
      <div className="relative">
        <Hash
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-tertiary)' }}
        />
        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-2xl pl-11 pr-4 text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.03)',
            color: 'var(--text-primary)',
            border: '1px solid var(--ghost-border)',
          }}
        />
      </div>
    </div>
  );
}

function FormulaNote({ text }: { text: string }) {
  return (
    <p className="mt-4 rounded-2xl px-4 py-3 text-xs leading-5" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
      {text}
    </p>
  );
}
