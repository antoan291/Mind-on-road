import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Filter, Plus, Search } from 'lucide-react';
import { MobilePageHeader } from '../../components/mobile/MobilePageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import {
  studentOperationalRecords,
  type StudentOperationalRecord,
} from '../../content/studentOperations';
import { fetchStudentOperations } from '../../services/studentsApi';

export function MobileStudentsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showOnlyAttention, setShowOnlyAttention] = useState(false);
  const [students, setStudents] = useState<StudentOperationalRecord[]>(
    studentOperationalRecords,
  );
  const [sourceStatus, setSourceStatus] = useState<
    'loading' | 'backend' | 'fallback'
  >('loading');

  useEffect(() => {
    let isMounted = true;

    fetchStudentOperations()
      .then((records) => {
        if (!isMounted) {
          return;
        }

        setStudents(records);
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setStudents(studentOperationalRecords);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleStudents = useMemo(
    () =>
      students.filter((student) => {
        const searchMatch = student.name
          .toLowerCase()
          .includes(searchValue.trim().toLowerCase());
        const attentionMatch =
          !showOnlyAttention ||
          student.inactivityAlert ||
          student.examOutcome === 'failed' ||
          student.status !== 'success';

        return searchMatch && attentionMatch;
      }),
    [students, searchValue, showOnlyAttention],
  );
  const activeStudentsCount = useMemo(
    () => students.filter(isActiveTrainingStudent).length,
    [students],
  );

  return (
    <div>
      <MobilePageHeader
        title="Курсисти"
        subtitle={`${visibleStudents.length} курсисти · ${
          sourceStatus === 'backend'
            ? 'PostgreSQL'
            : sourceStatus === 'fallback'
              ? 'Fallback данни'
              : 'Зареждане...'
        }`}
        actions={
          <button
            onClick={() => navigate('/students/new')}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            }}
          >
            <Plus size={18} />
          </button>
        }
      />

      <div
        className="p-4 border-b"
        style={{
          background: 'var(--bg-panel)',
          borderColor: 'var(--ghost-border)',
        }}
      >
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              placeholder="Търсене по име..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full h-11 rounded-lg pl-10 pr-4 border-none outline-none"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            onClick={() => setShowOnlyAttention((current) => !current)}
            className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: showOnlyAttention
                ? 'var(--primary-accent)'
                : 'var(--bg-card)',
              color: showOnlyAttention ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Активни курсисти
          </p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {activeStudentsCount}
          </p>
          <p className="mt-2 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>
            Броят се само курсистите, които още не са завършили теорията или практиката.
          </p>
        </div>

        {visibleStudents.length === 0 ? (
          <div
            className="rounded-xl p-6 text-center text-sm"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
            }}
          >
            Няма курсисти по избраните критерии.
          </div>
        ) : (
          visibleStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onClick={() => navigate(`/students/${student.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function isActiveTrainingStudent(student: StudentOperationalRecord) {
  const hasCompletedTheory = student.theoryCompleted || Boolean(student.theoryCompletedAt);
  const hasCompletedPractice = Boolean(student.practicalCompletedAt);
  const isWithdrawn = student.examOutcome === 'withdrawn' || student.courseOutcome === 'withdrawn';

  return !isWithdrawn && (!hasCompletedTheory || !hasCompletedPractice);
}

function StudentCard({
  student,
  onClick,
}: {
  student: StudentOperationalRecord;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl p-4 transition-all text-left"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0"
          style={{
            background:
              'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
            color: '#ffffff',
          }}
        >
          {student.name
            .split(' ')
            .map((namePart) => namePart[0])
            .join('')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <p
                className="font-semibold text-sm truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {student.name}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Категория {student.category}
              </p>
            </div>
            <StatusBadge status={student.status as any} size="small">
              {student.statusLabel}
            </StatusBadge>
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Напредък
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {student.progress}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-panel)' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${student.progress}%`,
                  background:
                    'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Инструктор: {student.instructor}
            </p>
            <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} />
          </div>
        </div>
      </div>
    </button>
  );
}
