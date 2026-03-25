import { useMemo, useState } from 'react';
import {
  Bell,
  Bot,
  Car,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  Gauge,
  MessageSquare,
  Plus,
  Settings2,
  ShieldCheck,
  TriangleAlert,
  UserCircle,
  Users,
  Wrench,
} from 'lucide-react';
import { PageHeader } from '../components/ui-system/PageHeader';
import { FilterBar } from '../components/ui-system/FilterBar';
import { Button } from '../components/ui-system/Button';
import { StatusBadge } from '../components/ui-system/StatusBadge';

type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'overdue';

type InstructorRow = {
  name: string;
  role: string;
  students: number;
  vehicle: string;
  nextLesson: string;
  theoryGroup: string;
  paymentAlerts: number;
  documentStatus: StatusTone;
  workload: string;
};

type VehicleRow = {
  vehicle: string;
  instructor: string;
  category: string;
  status: StatusTone;
  nextInspection: string;
  activeLessons: number;
  issue: string;
};

type RoadSheetRow = {
  sheetNumber: string;
  date: string;
  instructor: string;
  vehicle: string;
  students: string;
  distance: string;
  status: StatusTone;
};

type NotificationRow = {
  time: string;
  title: string;
  audience: string;
  channel: string;
  type: string;
  status: StatusTone;
};

type ReportRow = {
  report: string;
  period: string;
  owner: string;
  freshness: string;
  status: StatusTone;
};

const instructors: InstructorRow[] = [
  {
    name: 'Иван Стоянов',
    role: 'Старши инструктор · Категория B',
    students: 24,
    vehicle: 'Toyota Corolla · CA 1234 AB',
    nextLesson: 'Днес · 15:30',
    theoryGroup: 'B-2024-03-Утро',
    paymentAlerts: 3,
    documentStatus: 'success',
    workload: '88% запълване',
  },
  {
    name: 'Мария Георгиева',
    role: 'Инструктор теория и практика',
    students: 19,
    vehicle: 'Skoda Octavia · CA 5678 BC',
    nextLesson: 'Днес · 17:10',
    theoryGroup: 'B-2024-03-Вечер',
    paymentAlerts: 1,
    documentStatus: 'warning',
    workload: '79% запълване',
  },
  {
    name: 'Стефан Николов',
    role: 'Категория A · Практика',
    students: 11,
    vehicle: 'Yamaha MT-07 · CA 9012 KT',
    nextLesson: 'Утре · 09:00',
    theoryGroup: 'A-2024-02-Събота',
    paymentAlerts: 2,
    documentStatus: 'success',
    workload: '71% запълване',
  },
];

const vehicles: VehicleRow[] = [
  {
    vehicle: 'Toyota Corolla · CA 1234 AB',
    instructor: 'Иван Стоянов',
    category: 'B',
    status: 'success',
    nextInspection: '12.04.2026',
    activeLessons: 6,
    issue: 'Няма активни проблеми',
  },
  {
    vehicle: 'Skoda Octavia · CA 5678 BC',
    instructor: 'Мария Георгиева',
    category: 'B',
    status: 'warning',
    nextInspection: '29.03.2026',
    activeLessons: 5,
    issue: 'Гражданска отговорност изтича скоро',
  },
  {
    vehicle: 'Yamaha MT-07 · CA 9012 KT',
    instructor: 'Стефан Николов',
    category: 'A',
    status: 'info',
    nextInspection: '18.05.2026',
    activeLessons: 3,
    issue: 'Планирана профилактика в петък',
  },
];

const roadSheets: RoadSheetRow[] = [
  {
    sheetNumber: 'PL-2026-0318',
    date: '25.03.2026',
    instructor: 'Иван Стоянов',
    vehicle: 'Toyota Corolla · CA 1234 AB',
    students: 'Петър Георгиев, Мила Костова',
    distance: '68 км',
    status: 'success',
  },
  {
    sheetNumber: 'PL-2026-0319',
    date: '25.03.2026',
    instructor: 'Мария Георгиева',
    vehicle: 'Skoda Octavia · CA 5678 BC',
    students: 'Елена Димитрова',
    distance: '41 км',
    status: 'warning',
  },
  {
    sheetNumber: 'PL-2026-0320',
    date: '24.03.2026',
    instructor: 'Стефан Николов',
    vehicle: 'Yamaha MT-07 · CA 9012 KT',
    students: 'Мартин Иванов',
    distance: '36 км',
    status: 'info',
  },
];

const notifications: NotificationRow[] = [
  {
    time: 'Преди 8 мин',
    title: 'Автоматично Viber съобщение за липсващо плащане',
    audience: 'Родител на Петър Георгиев',
    channel: 'Viber',
    type: 'Практически час',
    status: 'error',
  },
  {
    time: 'Преди 17 мин',
    title: 'Теория отсъствие · дължима сума 25 EUR',
    audience: 'Елена Стоянова',
    channel: 'Viber',
    type: 'Теория',
    status: 'warning',
  },
  {
    time: 'Преди 42 мин',
    title: 'Сигнал за 10-ти час в категория B',
    audience: 'Родител на Мила Костова',
    channel: 'Система + Viber',
    type: 'Автоматичен сигнал',
    status: 'info',
  },
  {
    time: 'Преди 1 ч',
    title: 'Приветствено съобщение за нов курсист',
    audience: 'Никола Петров',
    channel: 'Viber',
    type: 'Онбординг',
    status: 'success',
  },
];

const reports: ReportRow[] = [
  {
    report: 'Финансов обзор по школа',
    period: '01.03.2026 – 25.03.2026',
    owner: 'Администрация',
    freshness: 'Обновен преди 12 мин',
    status: 'success',
  },
  {
    report: 'Прогноза за забавени плащания',
    period: 'Следващи 14 дни',
    owner: 'AI модул',
    freshness: 'Обновен преди 27 мин',
    status: 'warning',
  },
  {
    report: 'Натоварване на инструктори и автомобили',
    period: 'Текуща седмица',
    owner: 'Оперативен панел',
    freshness: 'Обновен преди 6 мин',
    status: 'info',
  },
];

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

export function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Известия"
        description="Автоматични съобщения, Viber действия и системни сигнали, свързани с плащания, теория и практика."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Известия' }]}
        actions={
          <>
            <Button variant="secondary" icon={<MessageSquare size={18} />}>
              Шаблони
            </Button>
            <Button variant="primary" icon={<Bell size={18} />}>
              Ново известие
            </Button>
          </>
        }
      />

      <PageSection>
        <MetricGrid>
          <MetricCard icon={<Bell size={18} />} label="Изпратени днес" value="42" detail="Viber, системни и административни" />
          <MetricCard icon={<TriangleAlert size={18} />} label="Чакащи внимание" value="5" detail="2 грешки · 3 предупреждения" tone="warning" />
          <MetricCard icon={<CheckCircle2 size={18} />} label="Успешна доставка" value="93%" detail="За последните 24 часа" tone="success" />
          <MetricCard icon={<Bot size={18} />} label="Автоматични тригери" value="18" detail="Плащане, теория, 10-ти час" tone="info" />
        </MetricGrid>

        <TwoColumnGrid>
          <Panel title="Последни съобщения" subtitle="История на автоматичните и ръчните известия.">
            <div className="space-y-3">
              {notifications.map((item) => (
                <div key={`${item.time}-${item.title}`} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={item.status}>{statusLabel(item.status)}</StatusBadge>
                        <span className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--text-tertiary)' }}>{item.time}</span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{item.audience} · {item.channel} · {item.type}</p>
                    </div>
                    <button className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--primary-accent)' }}>
                      Детайли <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Ключови автоматизации" subtitle="Трябва да са ясни още на ниво дизайн и работа на администрацията.">
            <ChecklistItem title="Липсва плащане за практически час" description="Автоматично съобщение към родител и видим червен сигнал в системата." tone="error" />
            <ChecklistItem title="Отсъствие от теория" description="Съобщение с дата на пропуска, дължима сума 25 EUR и условие за наваксване." tone="warning" />
            <ChecklistItem title="10-ти час за категория B" description="Автоматично Viber известие към родителя и сигнал в системата." tone="info" />
            <ChecklistItem title="Приветствено съобщение" description="Изпраща се при успешно записване и активиране на курсиста." tone="success" />
          </Panel>
        </TwoColumnGrid>
      </PageSection>
    </div>
  );
}

export function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Отчети"
        description="Финансови, оперативни и AI отчети за собственика, администрацията и бъдещото SaaS наблюдение."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Отчети' }]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт отчет
            </Button>
            <Button variant="primary" icon={<Bot size={18} />}>
              AI обзор
            </Button>
          </>
        }
      />

      <PageSection>
        <MetricGrid>
          <MetricCard icon={<FileText size={18} />} label="Активни отчети" value="12" detail="Финанси, посещаемост, натоварване" />
          <MetricCard icon={<Bot size={18} />} label="AI прогнози" value="4" detail="Просрочия, отпадане, допълнителни часове" tone="info" />
          <MetricCard icon={<Users size={18} />} label="Средна посещаемост" value="93.4%" detail="Всички активни групи" tone="success" />
          <MetricCard icon={<TriangleAlert size={18} />} label="Оперативни рискове" value="7" detail="Изискват проследяване тази седмица" tone="warning" />
        </MetricGrid>

        <TwoColumnGrid>
          <Panel title="Ключови индикатори" subtitle="Собственикът трябва да вижда бързо най-важното без да отваря детайлни модули.">
            <ProgressRow label="Събрани такси за месеца" value="78%" />
            <ProgressRow label="Планирани практически часове" value="84%" tone="info" />
            <ProgressRow label="Риск от просрочени плащания" value="41%" tone="warning" />
            <ProgressRow label="Готовност за изпити" value="66%" />
          </Panel>

          <Panel title="AI резюме за собственика" subtitle="Основата за бъдещ собственически чат и предиктивен модул.">
            <InsightCard icon={<Bot size={18} />} title="Вероятни забавяния" body="5 курсиста са с повишен риск от забавено плащане през следващите 10 дни." tone="warning" />
            <InsightCard icon={<Users size={18} />} title="Риск от отпадане" body="2 курсиста комбинират чести отсъствия от теория и дълги интервали без практика." />
            <InsightCard icon={<ClipboardList size={18} />} title="Нужда от допълнителни часове" body="7 курсиста имат ниска последна оценка след практика и моделът препоръчва още часове." tone="info" />
          </Panel>
        </TwoColumnGrid>

        <Panel title="Регистър на отчетите" subtitle="Статичен модел на списъчния изглед за първа версия.">
          <DataTableLayout
            columns={['Отчет', 'Период', 'Собственик', 'Последно обновяване', 'Статус']}
            rows={reports.map((item) => [
              item.report,
              item.period,
              item.owner,
              item.freshness,
              <StatusBadge key={`${item.report}-status`} status={item.status}>{statusLabel(item.status)}</StatusBadge>,
            ])}
          />
        </Panel>
      </PageSection>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Настройки"
        description="Конфигурация на школата, автоматизациите, сигурността, AI модула и документния контрол."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Настройки' }]}
        actions={
          <>
            <Button variant="secondary" icon={<ShieldCheck size={18} />}>
              Политики
            </Button>
            <Button variant="primary" icon={<Settings2 size={18} />}>
              Запази промени
            </Button>
          </>
        }
      />

      <PageSection>
        <TwoColumnGrid>
          <Panel title="Профил на школата" subtitle="Базови настройки, които влияят на всички модули.">
            <InfoStack items={[
              ['Име на школа', 'Mind on Road · София'],
              ['Основна категория', 'B, A, AM'],
              ['Работно време', '08:00 – 24:00'],
              ['Основен канал за известия', 'Viber'],
              ['Формат на валута', 'BGN + EUR при теория отсъствие'],
            ]} />
          </Panel>

          <Panel title="AI и OCR" subtitle="Тук се контролира какво е автоматично и къде остава човешкият преглед.">
            <ChecklistItem title="OCR на лични карти и книжки" description="Имената и номерата се извличат автоматично, но попадането в официален документ минава през човешки преглед." tone="success" />
            <ChecklistItem title="AI прогнози" description="Включени са риск от забавено плащане, отпадане и нужда от допълнителни часове." tone="info" />
            <ChecklistItem title="Owner chat" description="Работи само с tenant-scoped данни и не вижда информация от други школи." tone="success" />
            <ChecklistItem title="Автоматично презаписване" description="Забранено е за чувствителни официални данни без потвърждение от администрация." tone="warning" />
          </Panel>
        </TwoColumnGrid>

        <ThreeColumnGrid>
          <Panel title="Известия и автоматика" subtitle="Кои тригери са активни.">
            <ToggleLine label="Липсва плащане за практически час" state="Активно" />
            <ToggleLine label="Отсъствие от теория" state="Активно" />
            <ToggleLine label="10-ти час категория B" state="Активно" />
            <ToggleLine label="Приветствено съобщение" state="Активно" />
          </Panel>

          <Panel title="Сигурност" subtitle="Минимални настройки за първа версия.">
            <ToggleLine label="MFA за администратори" state="Задължително" tone="success" />
            <ToggleLine label="Достъп до документи със signed URLs" state="Активно" tone="success" />
            <ToggleLine label="Audit log за критични действия" state="Активно" tone="success" />
            <ToggleLine label="Role-based достъп по tenant" state="Активно" tone="success" />
          </Panel>

          <Panel title="Backup и възстановяване" subtitle="Ключовите контроли според архитектурните документи.">
            <ToggleLine label="Hetzner daily backups" state="18:00" />
            <ToggleLine label="Object Lock за критични документи" state="Включено" tone="success" />
            <ToggleLine label="Offsite копие" state="Активно" tone="success" />
            <ToggleLine label="Локален emergency backup" state="Админ лаптоп" tone="info" />
          </Panel>
        </ThreeColumnGrid>
      </PageSection>
    </div>
  );
}

function PageSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 p-6 lg:space-y-8 lg:p-8">{children}</div>;
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function TwoColumnGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">{children}</div>;
}

function ThreeColumnGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 xl:grid-cols-3">{children}</div>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-3xl p-5 lg:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}><div className="mb-5"><h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p></div>{children}</section>;
}

function MetricCard({ icon, label, value, detail, tone = 'neutral' }: { icon: React.ReactNode; label: string; value: string; detail: string; tone?: StatusTone }) {
  const accent = tone === 'warning' ? 'var(--status-warning)' : tone === 'error' ? 'var(--status-error)' : tone === 'success' ? 'var(--status-success)' : tone === 'info' ? 'var(--status-info)' : 'var(--primary-accent)';
  return <div className="rounded-3xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-card-elevated)', color: accent }}>{icon}</div><span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-tertiary)' }}>Обзор</span></div><p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p><p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p><p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>{detail}</p></div>;
}

function InsightCard({ icon, title, body, tone = 'neutral' }: { icon: React.ReactNode; title: string; body: string; tone?: StatusTone }) {
  const color = tone === 'warning' ? 'var(--status-warning)' : tone === 'error' ? 'var(--status-error)' : tone === 'info' ? 'var(--ai-accent)' : 'var(--primary-accent)';
  return <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(25, 37, 64, 0.92))', border: '1px solid var(--ghost-border)' }}><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', color }}>{icon}</div><h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3></div><p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{body}</p></div>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>{label}</p><p className="mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p></div>;
}

function DataTableLayout({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  return <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid var(--ghost-border)' }}><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead style={{ background: 'var(--bg-card-elevated)' }}><tr>{columns.map((column) => <th key={column} className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-medium" style={{ color: 'var(--text-tertiary)' }}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} style={{ background: index % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-elevated)' }}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-4 align-top" style={{ color: cellIndex === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{cell}</td>)}</tr>)}</tbody></table></div></div>;
}

function ChecklistItem({ title, description, tone = 'neutral' }: { title: string; description: string; tone?: StatusTone }) {
  return <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}><div className="flex items-center gap-3"><StatusBadge status={tone}>{statusLabel(tone)}</StatusBadge><h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3></div><p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{description}</p></div>;
}

function ProgressRow({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: StatusTone }) {
  const numeric = Number.parseInt(value, 10);
  const barColor = tone === 'warning' ? 'var(--status-warning)' : tone === 'info' ? 'var(--ai-accent)' : 'var(--primary-accent)';
  return <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span style={{ color: 'var(--text-primary)' }}>{label}</span><span style={{ color: 'var(--text-secondary)' }}>{value}</span></div><div className="h-2 rounded-full" style={{ background: 'var(--bg-card-elevated)' }}><div className="h-2 rounded-full" style={{ width: `${Number.isNaN(numeric) ? 0 : numeric}%`, background: barColor }} /></div></div>;
}

function InfoStack({ items }: { items: [string, string][] }) {
  return <div className="space-y-4">{items.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span><span className="text-sm text-right font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span></div>)}</div>;
}

function ToggleLine({ label, state, tone = 'neutral' }: { label: string; state: string; tone?: StatusTone }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}><span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span><StatusBadge status={tone}>{state}</StatusBadge></div>;
}

function statusLabel(status: StatusTone) {
  switch (status) {
    case 'success': return 'Изрядно';
    case 'warning': return 'Внимание';
    case 'error': return 'Критично';
    case 'info': return 'Инфо';
    case 'overdue': return 'Просрочено';
    default: return 'Нормално';
  }
}
