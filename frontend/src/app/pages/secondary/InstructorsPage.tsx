import { ChevronRight, Download, Plus, TriangleAlert, UserCircle, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui-system/Button';
import { FilterBar } from '../../components/ui-system/FilterBar';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { instructors } from './secondaryData';
import { InfoLine, MetricCard, MetricGrid, PageSection, Panel } from './secondaryShared';

export function InstructorsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const filteredInstructors = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return instructors;

    return instructors.filter((item) =>
      [item.name, item.role, item.vehicle, item.theoryGroup].some((field) => field.toLowerCase().includes(query)),
    );
  }, [searchValue]);

  return (
    <div>
      <PageHeader
        title="Инструктори"
        description="Преглед на всички инструктори и бърз достъп до детайлна страница с техните курсисти и оставащи часове."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Инструктори' }]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />}>
              Добави инструктор
            </Button>
          </>
        }
      />

      <FilterBar
        searchPlaceholder="Търсене по име, автомобил или група..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={false}
      />

      <PageSection>
        <MetricGrid>
          <MetricCard icon={<UserCircle size={18} />} label="Активни инструктори" value="12" detail="9 практика · 3 теория" />
          <MetricCard icon={<Users size={18} />} label="Активни курсисти" value="186" detail="Средно 15.5 на инструктор" />
          <MetricCard icon={<TriangleAlert size={18} />} label="Платежни сигнали" value="6" detail="Курсисти с нужда от напомняне" tone="warning" />
          <MetricCard icon={<TriangleAlert size={18} />} label="Документи за преглед" value="2" detail="Изтичащи документи" tone="warning" />
        </MetricGrid>

        <Panel
          title="Екип инструктори"
          subtitle="Натиснете върху карта, за да отворите отделна страница за избрания инструктор."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredInstructors.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/instructors/${item.id}`)}
                className="group h-full rounded-[28px] p-5 text-left transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(180deg, rgba(18, 27, 50, 0.96) 0%, rgba(14, 22, 42, 0.98) 100%)',
                  border: '1px solid var(--ghost-border)',
                  boxShadow: '0 20px 50px rgba(2, 6, 23, 0.18)',
                }}
              >
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(99, 102, 241, 0.14)', color: 'var(--primary-accent)' }}>
                        <UserCircle size={24} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</h3>
                        <p className="mt-1 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{item.role}</p>
                      </div>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:translate-x-1" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.025)' }}>
                    <InfoLine label="Автомобил" value={item.vehicle} />
                    <InfoLine label="Следващ час" value={item.nextLesson} />
                    <InfoLine label="Теория" value={item.theoryGroup} />
                    <InfoLine label="Натоварване" value={item.workload} />
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl p-4" style={{ background: item.documentStatus === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)', border: item.documentStatus === 'warning' ? '1px solid rgba(245, 158, 11, 0.22)' : '1px solid rgba(34, 197, 94, 0.22)' }}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Документи</span>
                        <StatusBadge status={item.documentStatus}>{item.documentStatus === 'warning' ? 'Изисква внимание' : 'Изрядни'}</StatusBadge>
                      </div>
                      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                        {item.documentStatus === 'warning' ? 'Има документ, който изтича скоро и трябва да се поднови.' : 'Няма проблеми с документите на инструктора.'}
                      </p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: item.paymentAlerts > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: item.paymentAlerts > 0 ? '1px solid rgba(245, 158, 11, 0.22)' : '1px solid rgba(59, 130, 246, 0.22)' }}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Плащания</span>
                        <StatusBadge status={item.paymentAlerts > 0 ? 'warning' : 'info'}>{item.paymentAlerts > 0 ? `${item.paymentAlerts} сигнала` : 'Няма сигнали'}</StatusBadge>
                      </div>
                      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                        {item.paymentAlerts > 0 ? 'Има курсисти с проследяване за плащания, които засягат този инструктор.' : 'Няма текущи платежни сигнали по курсистите на този инструктор.'}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </PageSection>
    </div>
  );
}
