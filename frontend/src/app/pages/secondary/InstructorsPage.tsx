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
            title="Инструкторски карти"
            subtitle="Всеки инструктор е показан като отделна карта с ключова информация, натоварване и оперативни сигнали за документи и плащания."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <article
                  key={item.name}
                  className="h-full rounded-3xl p-5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                    border: '1px solid var(--ghost-border)',
                    boxShadow: '0 20px 50px rgba(2, 6, 23, 0.16)',
                  }}
                >
                  <div className="flex h-full flex-col gap-5">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: 'var(--bg-card-elevated)', color: 'var(--primary-accent)' }}
                      >
                        <UserCircle size={24} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {item.role}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <InfoLine label="Автомобил" value={item.vehicle} />
                      <InfoLine label="Следващ час" value={item.nextLesson} />
                      <InfoLine label="Теория" value={item.theoryGroup} />
                      <InfoLine label="Натоварване" value={item.workload} />
                    </div>

                    <div className="grid gap-3">
                      <div
                        className="rounded-2xl p-3"
                        style={{
                          background:
                            item.documentStatus === 'warning' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                          border:
                            item.documentStatus === 'warning'
                              ? '1px solid rgba(245, 158, 11, 0.24)'
                              : '1px solid rgba(34, 197, 94, 0.24)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Документи
                          </p>
                          <StatusBadge status={item.documentStatus}>
                            {item.documentStatus === 'warning' ? 'Изтичат скоро' : 'Изрядни'}
                          </StatusBadge>
                        </div>
                        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {item.documentStatus === 'warning'
                            ? 'Има документ, който трябва да бъде подновен навреме, за да не блокира графика.'
                            : 'Няма блокиращи проблеми с документите на инструктора.'}
                        </p>
                      </div>

                      <div
                        className="rounded-2xl p-3"
                        style={{
                          background: item.paymentAlerts > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                          border:
                            item.paymentAlerts > 0
                              ? '1px solid rgba(245, 158, 11, 0.24)'
                              : '1px solid rgba(59, 130, 246, 0.24)',
                        }}
                      >
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Платежен статус
                        </p>
                        <p
                          className="mt-2 text-sm"
                          style={{ color: item.paymentAlerts > 0 ? 'var(--status-warning)' : 'var(--text-secondary)' }}
                        >
                          {item.paymentAlerts > 0
                            ? `${item.paymentAlerts} ученици с липсващо плащане`
                            : 'Няма платежни сигнали към учениците на този инструктор.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
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
