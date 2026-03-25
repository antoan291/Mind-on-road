import { PageHeader } from '../components/ui-system/PageHeader';
import { FilterBar } from '../components/ui-system/FilterBar';
import { Button } from '../components/ui-system/Button';
import { Plus, Download } from 'lucide-react';

export function PaymentsPage() {
  return (
    <div>
      <PageHeader
        title="Плащания"
        description="Управление на плащания и такси"
        breadcrumbs={[{ label: 'Начало' }, { label: 'Плащания' }]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />}>
              Ново плащане
            </Button>
          </>
        }
      />
      <FilterBar searchPlaceholder="Търсене по курсист, сума или дата..." />
      <div className="p-6 lg:p-8">
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Страницата е в процес на разработка</p>
        </div>
      </div>
    </div>
  );
}

export function PracticalLessonsPage() {
  return (
    <div>
      <PageHeader
        title="Практика"
        description="Управление на практически часове"
        breadcrumbs={[{ label: 'Начало' }, { label: 'Практика' }]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />}>
              Нов час
            </Button>
          </>
        }
      />
      <FilterBar searchPlaceholder="Търсене по курсист, инструктор или дата..." />
      <div className="p-6 lg:p-8">
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Страницата е в процес на разработка</p>
        </div>
      </div>
    </div>
  );
}

export function TheoryPage() {
  return (
    <div>
      <PageHeader
        title="Теория"
        description="Управление на теоретично обучение"
        breadcrumbs={[{ label: 'Начало' }, { label: 'Теория' }]}
        actions={
          <Button variant="primary" icon={<Plus size={18} />}>
            Нов курс
          </Button>
        }
      />
      <FilterBar searchPlaceholder="Търсене по курс или група..." />
      <div className="p-6 lg:p-8">
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Страницата е в процес на разработка</p>
        </div>
      </div>
    </div>
  );
}

export function InstructorsPage() {
  return (
    <div>
      <PageHeader
        title="Инструктори"
        description="Управление на инструктори"
        breadcrumbs={[{ label: 'Начало' }, { label: 'Инструктори' }]}
        actions={
          <Button variant="primary" icon={<Plus size={18} />}>
            Добави инструктор
          </Button>
        }
      />
      <FilterBar searchPlaceholder="Търсене по име или специализация..." />
      <div className="p-6 lg:p-8">
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Страницата е в процес на разработка</p>
        </div>
      </div>
    </div>
  );
}

export function VehiclesPage() {
  return (
    <div>
      <PageHeader
        title="Автомобили"
        description="Управление на автомобилен парк"
        breadcrumbs={[{ label: 'Начало' }, { label: 'Автомобили' }]}
        actions={
          <Button variant="primary" icon={<Plus size={18} />}>
            Добави автомобил
          </Button>
        }
      />
      <FilterBar searchPlaceholder="Търсене по марка, модел или регистрационен номер..." />
      <div className="p-6 lg:p-8">
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Страницата е в процес на разработка</p>
        </div>
      </div>
    </div>
  );
}

export function RoadSheetsPage() {
  return (
    <div>
      <PageHeader
        title="Пътни листове"
        description="Управление на пътни листове"
        breadcrumbs={[{ label: 'Начало' }, { label: 'Пътни листове' }]}
        actions={
          <Button variant="primary" icon={<Plus size={18} />}>
            Нов пътен лист
          </Button>
        }
      />
      <FilterBar searchPlaceholder="Търсене по автомобил, инструктор или дата..." />
      <div className="p-6 lg:p-8">
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Страницата е в процес на разработка</p>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Известия"
        description="Преглед на известия и съобщения"
        breadcrumbs={[{ label: 'Начало' }, { label: 'Известия' }]}
      />
      <div className="p-6 lg:p-8">
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Страницата е в процес на разработка</p>
        </div>
      </div>
    </div>
  );
}

export function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Отчети"
        description="Статистики и анализи"
        breadcrumbs={[{ label: 'Начало' }, { label: 'Отчети' }]}
        actions={
          <Button variant="secondary" icon={<Download size={18} />}>
            Експорт отчет
          </Button>
        }
      />
      <div className="p-6 lg:p-8">
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Страницата е в процес на разработка</p>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Настройки"
        description="Конфигурация на системата"
        breadcrumbs={[{ label: 'Начало' }, { label: 'Настройки' }]}
      />
      <div className="p-6 lg:p-8">
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Страницата е в процес на разработка</p>
        </div>
      </div>
    </div>
  );
}