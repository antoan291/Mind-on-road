import { useMemo, useState } from 'react';
import { Bot, Car, Download, Plus, ShieldCheck, TriangleAlert, UserCircle, Users } from 'lucide-react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { FilterBar } from '../../components/ui-system/FilterBar';
import { Button } from '../../components/ui-system/Button';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { instructors } from './secondaryData';
import { InfoLine, InsightCard, MetricCard, MetricGrid, PageSection, Panel, TwoColumnGrid } from './secondaryShared';

export function InstructorsPage() {
  const [searchValue, setSearchValue] = useState('');

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return instructors;
    return instructors.filter((item) =>
      [item.name, item.role, item.vehicle, item.theoryGroup].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }, [searchValue]);

  return (
    <div>
      <PageHeader
        title="Инструктори"
        description="Пълен оперативен преглед на инструкторите, техните ученици, график, автомобил и рискови сигнали."
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
          <MetricCard icon={<Users size={18} />} label="Активни ученици" value="186" detail="Средно 15.5 на инструктор" />
          <MetricCard icon={<TriangleAlert size={18} />} label="Платежни сигнали" value="6" detail="Към ученици на 4 инструктори" tone="warning" />
          <MetricCard icon={<ShieldCheck size={18} />} label="Документи за преглед" value="2" detail="1 медицинско · 1 лиценз" tone="warning" />
        </MetricGrid>

        <TwoColumnGrid>
          <Panel
            title="Оперативен списък"
            subtitle="Администрацията трябва да вижда всичко за инструкторите, а инструкторът само разрешеното за своите ученици и автомобил."
          >
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl p-4"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-11 w-11 rounded-xl flex items-center justify-center"
                          style={{ background: 'var(--bg-card-elevated)', color: 'var(--primary-accent)' }}
                        >
                          <UserCircle size={22} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {item.name}
                          </h3>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {item.role}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm md:grid-cols-2" style={{ color: 'var(--text-secondary)' }}>
                        <InfoLine label="Ученици" value={`${item.students} активни`} />
                        <InfoLine label="Автомобил" value={item.vehicle} />
                        <InfoLine label="Следващ час" value={item.nextLesson} />
                        <InfoLine label="Теория" value={item.theoryGroup} />
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <StatusBadge status={item.documentStatus}>
                        {item.documentStatus === 'warning' ? 'Документ изтича скоро' : 'Документи изрядни'}
                      </StatusBadge>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {item.workload}
                      </p>
                      <p className="text-sm" style={{ color: item.paymentAlerts > 0 ? 'var(--status-warning)' : 'var(--text-secondary)' }}>
                        {item.paymentAlerts > 0 ? `${item.paymentAlerts} ученици с липсващо плащане` : 'Няма платежни сигнали'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="AI оперативен фокус" subtitle="Прогнози и препоръки за собственика и администрацията.">
            <div className="space-y-3">
              <InsightCard
                icon={<Bot size={18} />}
                title="Натоварване и качество"
                body="Иван Стоянов е с най-висока заетост и стабилни оценки от учениците. Препоръчително е новите записвания да се разпределят към Мария Георгиева за следващите 7 дни."
              />
              <InsightCard
                icon={<TriangleAlert size={18} />}
                title="Финансов риск"
                body="При 3-ма ученици на Стефан Николов има риск от забавяне на следващите практически часове заради непълно плащане. Добре е администрацията да задейства напомняния днес."
                tone="warning"
              />
              <InsightCard
                icon={<Car size={18} />}
                title="Автомобилна готовност"
                body="Skoda Octavia има най-много предстоящи часове, но документ изтича след 4 дни. Ако не се поднови навреме, графикът на вечерната група ще се натовари."
                tone="info"
              />
            </div>
          </Panel>
        </TwoColumnGrid>
      </PageSection>
    </div>
  );
}
