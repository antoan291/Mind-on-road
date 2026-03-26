import { useMemo, useState } from 'react';
import { Car, CheckCircle2, Gauge, Plus, TriangleAlert, Wrench } from 'lucide-react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { FilterBar } from '../../components/ui-system/FilterBar';
import { Button } from '../../components/ui-system/Button';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { vehicles } from './secondaryData';
import { ChecklistItem, DataTableLayout, MetricCard, MetricGrid, PageSection, Panel, ProgressRow, TwoColumnGrid, statusLabel } from './secondaryShared';

export function VehiclesPage() {
  const [searchValue, setSearchValue] = useState('');

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter((item) =>
      [item.vehicle, item.instructor, item.category, item.issue].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }, [searchValue]);

  return (
    <div>
      <PageHeader
        title="Автомобили"
        description="Преглед на автомобилния парк, свързаните инструктори, документи, натоварване и наличност за графика."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Автомобили' }]}
        actions={
          <>
            <Button variant="secondary" icon={<Wrench size={18} />}>
              Планирай сервиз
            </Button>
            <Button variant="primary" icon={<Plus size={18} />}>
              Добави автомобил
            </Button>
          </>
        }
      />

      <FilterBar
        searchPlaceholder="Търсене по автомобил, инструктор или регистрация..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={false}
      />

      <PageSection>
        <MetricGrid>
          <MetricCard icon={<Car size={18} />} label="Активни автомобили" value="9" detail="7 категория B · 2 категория A" />
          <MetricCard icon={<Gauge size={18} />} label="Часове днес" value="31" detail="4 автомобила са над 80% заетост" tone="info" />
          <MetricCard icon={<TriangleAlert size={18} />} label="Документи за подновяване" value="3" detail="ГО, винетка и технически преглед" tone="warning" />
          <MetricCard icon={<CheckCircle2 size={18} />} label="Оперативна готовност" value="89%" detail="Всички критични автомобили са налични" tone="success" />
        </MetricGrid>

        <Panel title="Автомобилен парк" subtitle="Видимост за администрацията върху всичко по автомобила и връзката му с инструкторите и часовете.">
          <DataTableLayout
            columns={['Автомобил', 'Инструктор', 'Категория', 'Статус', 'Следващ преглед', 'Активни часове', 'Бележка']}
            rows={filtered.map((item) => [
              item.vehicle,
              item.instructor,
              item.category,
              <StatusBadge key={`${item.vehicle}-status`} status={item.status}>
                {statusLabel(item.status)}
              </StatusBadge>,
              item.nextInspection,
              item.activeLessons.toString(),
              item.issue,
            ])}
          />
        </Panel>

        <TwoColumnGrid>
          <Panel title="Контрол на документи" subtitle="Критичните ограничения трябва да блокират графика навреме.">
            <ChecklistItem
              title="Skoda Octavia · GO изтича след 4 дни"
              description="При липса на подновяване автомобилът трябва автоматично да се маркира като ограничен за нови часове."
              tone="warning"
            />
            <ChecklistItem
              title="Toyota Corolla · технически преглед"
              description="Следваща проверка на 12.04.2026. Няма блокиращ риск."
              tone="success"
            />
            <ChecklistItem
              title="Yamaha MT-07 · сервизен прозорец"
              description="Планирана почивка в петък между 13:00 и 17:00 за профилактика."
              tone="info"
            />
          </Panel>

          <Panel title="Разпределение по инструктори" subtitle="Кой автомобил обслужва кого и къде има риск от претоварване.">
            <ProgressRow label="Иван Стоянов" value="76%" />
            <ProgressRow label="Мария Георгиева" value="82%" tone="warning" />
            <ProgressRow label="Стефан Николов" value="58%" />
          </Panel>
        </TwoColumnGrid>
      </PageSection>
    </div>
  );
}
