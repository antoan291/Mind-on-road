import { useEffect, useMemo, useState } from 'react';
import { Car, CheckCircle2, Gauge, Plus, TriangleAlert, Wrench } from 'lucide-react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { FilterBar } from '../../components/ui-system/FilterBar';
import { Button } from '../../components/ui-system/Button';
import { Modal } from '../../components/ui-system/Modal';
import {
  createVehicleRow,
  fetchVehicleRows,
  updateVehicleRow,
} from '../../services/vehiclesApi';
import type { VehicleRow } from './secondaryData';
import { VehicleCards } from './components/VehicleCards';
import { ChecklistItem, MetricCard, MetricGrid, PageSection, Panel, ProgressRow, TwoColumnGrid } from './secondaryShared';
import { useAuthSession } from '../../services/authSession';

export function VehiclesPage() {
  const { session } = useAuthSession();
  const [searchValue, setSearchValue] = useState('');
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [sourceStatus, setSourceStatus] = useState<
    'loading' | 'backend' | 'fallback'
  >('loading');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRow | null>(
    null,
  );
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [serviceDraft, setServiceDraft] = useState({
    vehicle: '',
    nextInspection: '2026-04-10',
  });
  const [vehicleDraft, setVehicleDraft] = useState({
    vehicle: 'Toyota Corolla · CA 1234 AB',
    instructor: 'Георги Петров',
    category: 'B',
    nextInspection: '2026-05-01',
  });
  const [actionMessage, setActionMessage] = useState(
    'Натисни върху карта на автомобил, за да отвориш всички детайли, документи и оперативни бележки.',
  );

  useEffect(() => {
    let isMounted = true;

    fetchVehicleRows()
      .then((records) => {
        if (!isMounted) return;
        setVehicles(records);
        setServiceDraft((current) => ({
          ...current,
          vehicle: records[0]?.vehicle ?? current.vehicle,
        }));
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) return;
        setVehicles([]);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return vehicles;

    return vehicles.filter((item) =>
      [item.vehicle, item.instructor, item.category, item.issue].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }, [searchValue, vehicles]);

  return (
    <div>
      <PageHeader
        title="Автомобили"
        description={`Преглед на автомобилния парк, свързаните инструктори, документи, натоварване и наличност за графика. ${
          sourceStatus === 'backend'
            ? 'Данни от PostgreSQL.'
            : sourceStatus === 'fallback'
              ? 'Fallback към локални тестови данни.'
              : 'Зареждане...'
        }`}
        breadcrumbs={[{ label: 'Начало' }, { label: 'Автомобили' }]}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Wrench size={18} />}
              onClick={() => setIsServiceModalOpen(true)}
            >
              Планирай сервиз
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => setIsAddVehicleModalOpen(true)}
            >
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
          <MetricCard
            icon={<Car size={18} />}
            label="Активни автомобили"
            value={String(vehicles.length)}
            detail={`${vehicles.filter((item) => item.category === 'B').length} категория B`}
          />
          <MetricCard
            icon={<Gauge size={18} />}
            label="Часове днес"
            value={String(
              vehicles.reduce((sum, item) => sum + item.activeLessons, 0),
            )}
            detail="По активни автомобили"
            tone="info"
          />
          <MetricCard
            icon={<TriangleAlert size={18} />}
            label="Документи за подновяване"
            value={String(vehicles.filter((item) => item.status === 'warning').length)}
            detail="Следи следващия преглед"
            tone="warning"
          />
          <MetricCard
            icon={<CheckCircle2 size={18} />}
            label="Оперативна готовност"
            value={`${Math.round(
              (vehicles.filter((item) => item.status !== 'error').length /
                Math.max(vehicles.length, 1)) *
                100,
            )}%`}
            detail="Изчислено от статуса"
            tone="success"
          />
        </MetricGrid>

        <Panel
          title="Автомобилни карти"
          subtitle="Всеки автомобил е показан като отделна карта с основния статус, активните часове и важната оперативна бележка."
        >
          <VehicleCards
            vehicles={filtered}
            onVehicleClick={(vehicle) => {
              setSelectedVehicle(vehicle);
              setActionMessage(
                `Отворени са детайлите за ${vehicle.vehicle}.`,
              );
            }}
          />
        </Panel>

        <div
          className="rounded-3xl p-4 text-sm"
          style={{
            background: 'var(--bg-card-elevated)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--ghost-border)',
          }}
        >
          {actionMessage}
        </div>

        <TwoColumnGrid>
          <Panel title="Контрол на документи" subtitle="Критичните ограничения трябва да блокират графика навреме.">
            {vehicles.slice(0, 3).map((vehicle) => (
              <ChecklistItem
                key={`${vehicle.vehicle}-checklist`}
                title={`${vehicle.vehicle} · следващ преглед ${vehicle.nextInspection}`}
                description={vehicle.issue}
                tone={
                  vehicle.status === 'warning'
                    ? 'warning'
                    : vehicle.status === 'error'
                      ? 'error'
                      : 'success'
                }
              />
            ))}
          </Panel>

          <Panel title="Разпределение по инструктори" subtitle="Кой автомобил обслужва кого и къде има риск от претоварване.">
            {vehicles.slice(0, 4).map((vehicle) => (
              <ProgressRow
                key={`${vehicle.vehicle}-load`}
                label={vehicle.instructor}
                value={`${Math.min(vehicle.activeLessons * 25, 100)}%`}
                tone={vehicle.activeLessons >= 4 ? 'warning' : 'info'}
              />
            ))}
          </Panel>
        </TwoColumnGrid>
      </PageSection>

      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="Планиране на сервиз"
      >
        <div className="space-y-5">
          <p className="text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
            Избери автомобил и дата за сервизен прозорец. Промените се записват директно в PostgreSQL.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="h-12 rounded-xl border px-4"
              value={serviceDraft.vehicle}
              onChange={(event) =>
                setServiceDraft((current) => ({
                  ...current,
                  vehicle: event.target.value,
                }))
              }
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--ghost-border)',
                color: 'var(--text-primary)',
              }}
            />
            <input
              type="date"
              className="h-12 rounded-xl border px-4"
              value={serviceDraft.nextInspection}
              onChange={(event) =>
                setServiceDraft((current) => ({
                  ...current,
                  nextInspection: event.target.value,
                }))
              }
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--ghost-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsServiceModalOpen(false)}>
              Затвори
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const vehicleToUpdate = vehicles.find(
                  (vehicle) => vehicle.vehicle === serviceDraft.vehicle,
                );

                if (!vehicleToUpdate) {
                  setActionMessage(
                    'Избери съществуващ автомобил от списъка преди запис на сервизен план.',
                  );
                  return;
                }

                void updateVehicleRow(
                  vehicleToUpdate.id,
                  {
                    status: 'SERVICE_SOON',
                    nextInspection: serviceDraft.nextInspection,
                    operationalNote: `Сервизен прозорец е планиран за ${serviceDraft.nextInspection}.`,
                  },
                  session?.csrfToken ?? '',
                ).then((savedVehicle) => {
                  setVehicles((current) =>
                    current.map((vehicle) =>
                      vehicle.id === savedVehicle.id ? savedVehicle : vehicle,
                    ),
                  );
                  setSelectedVehicle((current) =>
                    current?.id === savedVehicle.id ? savedVehicle : current,
                  );
                  setActionMessage(
                    `Сервизният план за ${savedVehicle.vehicle} е записан в PostgreSQL.`,
                  );
                  setIsServiceModalOpen(false);
                }).catch((error) => {
                  setActionMessage(
                    error instanceof Error
                      ? error.message
                      : 'Сервизният план не беше записан в базата.',
                  );
                });
              }}
            >
              Запази плана
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        title="Добавяне на автомобил"
      >
        <div className="space-y-5">
          <p className="text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
            Формата вече записва новия автомобил директно в PostgreSQL и го добавя към текущия списък.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="h-12 rounded-xl border px-4"
              value={vehicleDraft.vehicle}
              onChange={(event) =>
                setVehicleDraft((current) => ({
                  ...current,
                  vehicle: event.target.value,
                }))
              }
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--ghost-border)',
                color: 'var(--text-primary)',
              }}
            />
            <input
              className="h-12 rounded-xl border px-4"
              value={vehicleDraft.instructor}
              onChange={(event) =>
                setVehicleDraft((current) => ({
                  ...current,
                  instructor: event.target.value,
                }))
              }
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--ghost-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsAddVehicleModalOpen(false)}>
              Отказ
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                void createVehicleRow(
                  {
                    vehicleLabel: vehicleDraft.vehicle,
                    instructorName: vehicleDraft.instructor,
                    categoryCode: vehicleDraft.category,
                    status: 'ACTIVE',
                    nextInspection: vehicleDraft.nextInspection,
                    activeLessons: 0,
                    operationalNote:
                      'Нов автомобил е добавен ръчно през UI формата.',
                  },
                  session?.csrfToken ?? '',
                ).then((savedVehicle) => {
                  setVehicles((current) => [savedVehicle, ...current]);
                  setActionMessage(
                    `Добавен е автомобил ${savedVehicle.vehicle} в PostgreSQL.`,
                  );
                  setIsAddVehicleModalOpen(false);
                }).catch((error) => {
                  setActionMessage(
                    error instanceof Error
                      ? error.message
                      : 'Автомобилът не беше записан в базата.',
                  );
                });
              }}
            >
              Запази автомобила
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
        title={selectedVehicle?.vehicle ?? 'Детайли за автомобил'}
        size="large"
      >
        {selectedVehicle && (
          <div className="space-y-5">
            <div
              className="rounded-3xl p-5"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--ghost-border)',
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ChecklistItem
                  title="Инструктор"
                  description={selectedVehicle.instructor}
                  tone="info"
                />
                <ChecklistItem
                  title="Категория"
                  description={`Категория ${selectedVehicle.category}`}
                  tone="success"
                />
                <ChecklistItem
                  title="Следващ технически преглед"
                  description={selectedVehicle.nextInspection}
                  tone={
                    selectedVehicle.status === 'warning'
                      ? 'warning'
                      : selectedVehicle.status === 'error'
                        ? 'error'
                        : 'success'
                  }
                />
                <ChecklistItem
                  title="Активни часове"
                  description={`${selectedVehicle.activeLessons} часа`}
                  tone="info"
                />
              </div>
            </div>

            <Panel
              title="Документи и оперативно състояние"
              subtitle="Този drill-down показва документния статус и ключовите данни за автомобила."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ChecklistItem
                  title="Технически преглед"
                  description={`Следващ срок: ${selectedVehicle.nextInspection}`}
                  tone={
                    selectedVehicle.status === 'warning'
                      ? 'warning'
                      : selectedVehicle.status === 'error'
                        ? 'error'
                        : 'success'
                  }
                />
                <ChecklistItem
                  title="Оперативна бележка"
                  description={selectedVehicle.issue}
                  tone={
                    selectedVehicle.status === 'error'
                      ? 'error'
                      : selectedVehicle.status === 'warning'
                        ? 'warning'
                        : 'success'
                  }
                />
                <ChecklistItem
                  title="Свързан инструктор"
                  description={selectedVehicle.instructor}
                  tone="info"
                />
                <ChecklistItem
                  title="Готовност за график"
                  description={
                    selectedVehicle.status === 'error'
                      ? 'Автомобилът не трябва да се разпределя в графика.'
                      : 'Автомобилът може да се използва в графика.'
                  }
                  tone={selectedVehicle.status === 'error' ? 'error' : 'success'}
                />
              </div>
            </Panel>
          </div>
        )}
      </Modal>
    </div>
  );
}
