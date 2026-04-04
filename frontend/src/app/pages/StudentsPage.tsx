import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../components/ui-system/PageHeader';
import { FilterBar } from '../components/ui-system/FilterBar';
import { DataTable } from '../components/ui-system/DataTable';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import { Button } from '../components/ui-system/Button';
import { Plus, Download, Eye, Edit, TriangleAlert, FileClock, UserCheck, X, CalendarDays, ChevronRight } from 'lucide-react';
import {
  StudentOperationalRecord,
  studentOperationalRecords,
} from '../content/studentOperations';
import { fetchStudentOperations } from '../services/studentsApi';

export function StudentsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | number | null>(null);
  const [studentRecords, setStudentRecords] = useState<StudentOperationalRecord[]>(
    studentOperationalRecords,
  );
  const [recordsStatus, setRecordsStatus] = useState<'loading' | 'ready' | 'fallback'>(
    'loading',
  );

  useEffect(() => {
    let isMounted = true;

    fetchStudentOperations()
      .then((records) => {
        if (!isMounted) {
          return;
        }

        setStudentRecords(records);
        setSelectedStudentId((currentStudentId) =>
          currentStudentId ?? records[0]?.id ?? null,
        );
        setRecordsStatus('ready');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setStudentRecords(studentOperationalRecords);
        setSelectedStudentId((currentStudentId) =>
          currentStudentId ?? studentOperationalRecords[0]?.id ?? null,
        );
        setRecordsStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const students = studentRecords.filter((student) => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      student.name.toLowerCase().includes(normalizedSearch) ||
      student.phone.toLowerCase().includes(normalizedSearch) ||
      student.email.toLowerCase().includes(normalizedSearch);
    const matchesCategory = selectedCategory === 'all' || student.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'manual' && student.trainingMode === 'licensed-manual-hours') ||
      (selectedStatus === 'failed' && student.examOutcome === 'failed') ||
      (selectedStatus === 'inactive' && student.inactivityAlert) ||
      (selectedStatus === 'early-booking' && student.adminReminderDue) ||
      student.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatLegacyDate = (value?: string) => {
    if (!value) return 'Няма';
    return value;
  };

  const maskNationalId = (value?: string) => {
    if (!value) return 'Няма';
    return `${value.slice(0, 2)}******${value.slice(-2)}`;
  };

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? students[0] ?? null,
    [selectedStudentId, students],
  );

  const columns = [
    {
      key: 'name',
      label: 'Курсист',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            }}
          >
            {value.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {value}
            </div>
            <div className="truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {row.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Категория',
      render: (value: string) => (
        <span 
          className="px-2.5 py-1 rounded-md text-sm font-medium"
          style={{
            background: 'var(--bg-panel)',
            color: 'var(--text-primary)',
          }}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'instructor',
      label: 'Инструктор',
    },
    {
      key: 'remaining',
      label: 'Часове',
      render: (value: number, row: any) => (
        <div className="min-w-[110px]">
          <div className="font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
            {value} ч остават
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {row.used} / {row.total} проведени
          </div>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Напредък',
      render: (value: number) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${value}%`,
                background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              }}
            />
          </div>
          <span className="text-xs font-medium w-10 text-right" style={{ color: 'var(--text-secondary)' }}>
            {value}%
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (value: string, row: any) => (
        <div className="space-y-2 min-w-[140px]">
          <StatusBadge status={value as any}>
            {row.statusLabel}
          </StatusBadge>
          <div className="flex items-center gap-1 text-xs" style={{ color: row.examOutcome === 'failed' ? 'var(--status-error)' : 'var(--text-tertiary)' }}>
            {row.trainingMode === 'licensed-manual-hours' ? <UserCheck size={12} /> : <FileClock size={12} />}
            {row.examOutcome === 'failed' ? 'Скъсан' : row.trainingMode === 'licensed-manual-hours' ? 'С книжка' : 'Стандартен'}
          </div>
          {row.inactivityAlert && (
            <div className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--status-warning)' }}>
              <TriangleAlert size={12} />
              {row.daysWithoutPractice} дни без практика
            </div>
          )}
          {row.adminReminderDue && (
            <div className="text-xs font-medium" style={{ color: 'var(--primary-accent)' }}>
              Ранно записване · идва на {row.expectedArrivalDate}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStudentId(row.id);
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
            style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/students/${row.id}/edit`);
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
            style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
          >
            <Edit size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Курсисти"
        description="Управление на курсисти и техния напредък"
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Курсисти' },
        ]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/students/new')}>
              Добави курсист
            </Button>
          </>
        }
      />

      <FilterBar
        searchPlaceholder="Търсене по име, телефон или email..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={true}
        activeFiltersCount={selectedCategory !== 'all' || selectedStatus !== 'all' ? 1 : 0}
        onFilterClick={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <div className="px-6 lg:px-8 pt-6">
          <div 
            className="p-4 rounded-xl"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Категория
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">Всички категории</option>
                  <option value="A">Категория A</option>
                  <option value="B">Категория B</option>
                  <option value="C">Категория C</option>
                  <option value="D">Категория D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Статус
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">Всички статуси</option>
                  <option value="info">Нов / начинаещ</option>
                  <option value="warning">В процес / изисква внимание</option>
                  <option value="success">Напреднал / финален етап</option>
                  <option value="manual">С книжка / ръчни часове</option>
                  <option value="failed">Скъсани</option>
                  <option value="inactive">Над 30 дни без каране</option>
                  <option value="early-booking">Ранно записване</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-end gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  }}
                >
                  Изчисти филтри
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Показани {students.length} курсисти
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {recordsStatus === 'loading'
              ? 'Зареждане от backend...'
              : recordsStatus === 'ready'
                ? 'Данни от PostgreSQL'
                : 'Fallback към локални mock данни'}
          </p>
          <p className="hidden text-sm lg:block" style={{ color: 'var(--text-tertiary)' }}>
            Клик на ред отваря детайли вдясно
          </p>
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <DataTable
              columns={columns}
              data={students}
              onRowClick={(row) => setSelectedStudentId(row.id)}
            />
          </div>

          {selectedStudent && (
            <aside
              className="rounded-[28px] p-5"
              style={{
                background: 'linear-gradient(180deg, rgba(18, 27, 50, 0.96), rgba(14, 22, 42, 0.98))',
                border: '1px solid var(--ghost-border)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                      color: '#ffffff',
                    }}
                  >
                    {selectedStudent.name.split(' ').map((part) => part[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {selectedStudent.name}
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Кат. {selectedStudent.category} · {selectedStudent.instructor}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentId(null)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <StudentDetailTile label="Телефон" value={selectedStudent.phone} />
                <StudentDetailTile label="ЕГН" value={maskNationalId(selectedStudent.nationalId)} />
                <StudentDetailTile label="Група" value={selectedStudent.groupNumber || 'Индивидуална'} />
                <StudentDetailTile label="Старт" value={selectedStudent.trainingStartDate || selectedStudent.startDate} />
                <StudentDetailTile label="Тип курсист" value={selectedStudent.studentTypeLabel} />
                <StudentDetailTile label="Максимум часове" value={`${selectedStudent.total} ч`} />
                <StudentDetailTile label="Проведени" value={`${selectedStudent.used} ч`} />
                <StudentDetailTile label="Остават" value={`${selectedStudent.remaining} ч`} />
              </div>

              <div className="mt-5 rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Напредък</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedStudent.progress}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${selectedStudent.progress}%`,
                      background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                    }}
                  />
                </div>
                <p className="mt-4 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  {selectedStudent.hoursEntryPolicy}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <StudentSignalRow icon={<CalendarDays size={16} />} label="Теория" value={formatLegacyDate(selectedStudent.theoryCompletedAt)} />
                <StudentSignalRow icon={<CalendarDays size={16} />} label="Практика" value={formatLegacyDate(selectedStudent.practicalCompletedAt)} />
                <StudentSignalRow icon={<FileClock size={16} />} label="Изход" value={selectedStudent.examOutcomeLabel} />
                {selectedStudent.failedExamAttempts > 0 && (
                  <StudentSignalRow
                    icon={<TriangleAlert size={16} />}
                    label="Скъсан"
                    value={`${selectedStudent.failedExamAttempts} път(и) · ${selectedStudent.extraHours} доп. часа`}
                    tone="var(--status-error)"
                  />
                )}
                {selectedStudent.inactivityAlert && (
                  <StudentSignalRow
                    icon={<TriangleAlert size={16} />}
                    label="Без практика"
                    value={`${selectedStudent.daysWithoutPractice} дни · последно ${selectedStudent.lastPracticeDate}`}
                    tone="var(--status-warning)"
                  />
                )}
                {selectedStudent.adminReminderDue && (
                  <StudentSignalRow
                    icon={<CalendarDays size={16} />}
                    label="Ранно записване"
                    value={`Идва на ${selectedStudent.expectedArrivalDate}`}
                    tone="var(--primary-accent)"
                  />
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="secondary" icon={<ChevronRight size={18} />} onClick={() => navigate(`/students/${selectedStudent.id}`)}>
                  Досие
                </Button>
                <Button variant="primary" icon={<Edit size={18} />} onClick={() => navigate(`/students/${selectedStudent.id}/edit`)}>
                  Редакция
                </Button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentDetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className="mt-2 truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function StudentSignalRow({
  icon,
  label,
  value,
  tone = 'var(--text-primary)',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span style={{ color: tone }}>{icon}</span>
        {label}
      </div>
      <span className="text-right text-sm font-medium" style={{ color: tone }}>
        {value}
      </span>
    </div>
  );
}
