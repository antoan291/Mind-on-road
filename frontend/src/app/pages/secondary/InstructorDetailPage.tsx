import { ArrowLeft, Car, Clock3, TriangleAlert, UserCircle, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui-system/Button';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import {
  buildInstructorRows,
  buildInstructorStudentRows,
} from '../../services/instructorsApi';
import {
  type StudentOperationalRecord,
} from '../../content/studentOperations';
import { fetchStudentOperations } from '../../services/studentsApi';
import {
  type InstructorStudentRow,
} from './secondaryData';
import { DataTableLayout, InfoLine, MetricCard, MetricGrid, PageSection, Panel } from './secondaryShared';

export function InstructorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const instructorId = Number(id);
  const [instructors, setInstructors] = useState(
    [] as ReturnType<typeof buildInstructorRows>,
  );
  const [studentRecords, setStudentRecords] = useState<StudentOperationalRecord[]>(
    [],
  );
  const [sourceStatus, setSourceStatus] = useState<'loading' | 'backend' | 'fallback'>('loading');

  const instructor = useMemo(
    () => instructors.find((item) => item.id === instructorId) ?? null,
    [instructorId, instructors],
  );
  const students = useMemo<InstructorStudentRow[]>(() => {
    if (!instructor) {
      return [];
    }

    if (studentRecords.length > 0) {
      return buildInstructorStudentRows(instructor, studentRecords);
    }

    return [];
  }, [instructor, studentRecords]);

  useEffect(() => {
    let isMounted = true;

    fetchStudentOperations()
      .then((records) => {
        if (!isMounted) {
          return;
        }

        setInstructors(buildInstructorRows(records));
        setStudentRecords(records);
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setInstructors([]);
        setStudentRecords([]);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalMaximumHours = students.reduce((sum, item) => sum + item.maximumHours, 0);
  const totalCompletedHours = students.reduce((sum, item) => sum + item.completedHours, 0);
  const totalRemainingHours = students.reduce((sum, item) => sum + item.remainingHours, 0);

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
    </div>
  );
}
