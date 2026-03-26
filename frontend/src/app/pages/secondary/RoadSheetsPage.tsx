import { useMemo, useState } from 'react';
import { Car, ClipboardList, Clock3, Download, Plus, TriangleAlert } from 'lucide-react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { FilterBar } from '../../components/ui-system/FilterBar';
import { Button } from '../../components/ui-system/Button';
import { roadSheets } from './secondaryData';
import { ChecklistItem, DataTableLayout, InfoStack, MetricCard, MetricGrid, PageSection, Panel, TwoColumnGrid, statusLabel } from './secondaryShared';
import { StatusBadge } from '../../components/ui-system/StatusBadge';

export function RoadSheetsPage() {
  const [searchValue, setSearchValue] = useState('');

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return roadSheets;
    return roadSheets.filter((item) =>
      [item.sheetNumber, item.instructor, item.vehicle, item.students].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }, [searchValue]);

  return (
    <div>
      <PageHeader
        title="Пътни листове"
        description="Ежедневен контрол на пробега, проведените часове, автомобилите и съответствието с графика."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Пътни листове' }]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />}>
              Нов пътен лист
            </Button>
          </>
        }
      />

      <FilterBar
        searchPlaceholder="Търсене по номер, инструктор или автомобил..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={false}
      />

      <PageSection>
        <MetricGrid>
          <MetricCard icon={<ClipboardList size={18} />} label="Отворени листове" value="7" detail="5 за днес · 2 чакащи приключване" />
          <MetricCard icon={<Car size={18} />} label="Общ пробег" value="145 км" detail="За текущия ден" tone="info" />
          <MetricCard icon={<Clock3 size={18} />} label="Часове в движение" value="18 ч" detail="Съгласувани с графика" />
          <MetricCard icon={<TriangleAlert size={18} />} label="Отклонения" value="1" detail="Лист с липсващ краен километраж" tone="warning" />
        </MetricGrid>

        <Panel title="Дневен регистър" subtitle="Статична версия на работния изглед за администрацията и отчет на инструкторите.">
          <DataTableLayout
            columns={['Номер', 'Дата', 'Инструктор', 'Автомобил', 'Курсисти', 'Пробег', 'Статус']}
            rows={filtered.map((item) => [
              item.sheetNumber,
              item.date,
              item.instructor,
              item.vehicle,
              item.students,
              item.distance,
              <StatusBadge key={`${item.sheetNumber}-status`} status={item.status}>
                {statusLabel(item.status)}
              </StatusBadge>,
            ])}
          />
        </Panel>

        <TwoColumnGrid>
          <Panel title="Контролни правила" subtitle="Тези точки трябва да са видими за администрацията още в първата версия.">
            <ChecklistItem
              title="Съпоставка с графика"
              description="Всеки лист трябва да съвпада с планираните практически часове, инструктор и автомобил."
              tone="success"
            />
            <ChecklistItem
              title="Липсващ краен километраж"
              description="PL-2026-0319 трябва да се маркира за преглед от администрацията."
              tone="warning"
            />
            <ChecklistItem
              title="Свързаност с плащания и практика"
              description="Всеки проведен час трябва да може да бъде проследен обратно към урок, курсист и платежен статус."
              tone="info"
            />
          </Panel>

          <Panel title="Резюме за деня" subtitle="Бърза ориентация без да се отварят отделни записи.">
            <InfoStack
              items={[
                ['Най-натоварен автомобил', 'Toyota Corolla · 68 км'],
                ['Най-много часове', 'Иван Стоянов · 6 урока'],
                ['Празни интервали', '2 блока между 13:00 и 15:00'],
                ['Чакащи потвърждение', '1 лист от Мария Георгиева'],
              ]}
            />
          </Panel>
        </TwoColumnGrid>
      </PageSection>
    </div>
  );
}
