export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'overdue';

export type InstructorRow = {
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

export type VehicleRow = {
  vehicle: string;
  instructor: string;
  category: string;
  status: StatusTone;
  nextInspection: string;
  activeLessons: number;
  issue: string;
};

export type RoadSheetRow = {
  sheetNumber: string;
  date: string;
  instructor: string;
  vehicle: string;
  students: string;
  distance: string;
  status: StatusTone;
};

export type NotificationRow = {
  time: string;
  title: string;
  audience: string;
  channel: string;
  type: string;
  status: StatusTone;
};

export type ReportRow = {
  report: string;
  period: string;
  owner: string;
  freshness: string;
  status: StatusTone;
};

export const instructors: InstructorRow[] = [
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

export const vehicles: VehicleRow[] = [
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

export const roadSheets: RoadSheetRow[] = [
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

export const notifications: NotificationRow[] = [
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

export const reports: ReportRow[] = [
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
