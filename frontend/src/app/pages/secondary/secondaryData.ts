export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'overdue';

export type InstructorRow = {
  id: number;
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

export type InstructorStudentRow = {
  id: number;
  instructorId: number;
  instructorName: string;
  studentName: string;
  category: string;
  currentStage: string;
  completedHours: number;
  remainingHours: number;
  maximumHours: number;
  nextLesson: string;
  status: StatusTone;
};

export type VehicleRow = {
  id: string;
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
    id: 1,
    name: 'Георги Петров',
    role: 'Старши инструктор · Категория B',
    students: 1,
    vehicle: 'Toyota Corolla · CA 1234 AB',
    nextLesson: 'Днес · 15:30',
    theoryGroup: 'B-AT-001-Утро',
    paymentAlerts: 0,
    documentStatus: 'success',
    workload: '10% запълване',
  },
];

export const instructorStudents: InstructorStudentRow[] = [
  {
    id: 101,
    instructorId: 1,
    instructorName: 'Георги Петров',
    studentName: 'Антоан Тест',
    category: 'B',
    currentStage: 'Практика · градско каране',
    completedHours: 2,
    remainingHours: 18,
    maximumHours: 20,
    nextLesson: 'Днес · 09:00',
    status: 'info',
  },
];

export const vehicles: VehicleRow[] = [
  {
    id: 'vehicle-fallback-toyota-corolla',
    vehicle: 'Toyota Corolla · CA 1234 AB',
    instructor: 'Георги Петров',
    category: 'B',
    status: 'success',
    nextInspection: '12.04.2026',
    activeLessons: 1,
    issue: 'Няма активни проблеми',
  },
];

export const roadSheets: RoadSheetRow[] = [
  { sheetNumber: 'PL-2026-0318', date: '25.03.2026', instructor: 'Иван Стоянов', vehicle: 'Toyota Corolla · CA 1234 AB', students: 'Антоан Тест, Мила Костова', distance: '68 км', status: 'success' },
  { sheetNumber: 'PL-2026-0319', date: '25.03.2026', instructor: 'Мария Георгиева', vehicle: 'Skoda Octavia · CA 5678 BC', students: 'Антоан Тест', distance: '41 км', status: 'warning' },
  { sheetNumber: 'PL-2026-0320', date: '24.03.2026', instructor: 'Стефан Николов', vehicle: 'Yamaha MT-07 · CA 9012 KT', students: 'Антоан Тест', distance: '36 км', status: 'info' },
];

export const notifications: NotificationRow[] = [
  { time: 'Преди 8 мин', title: 'Автоматично Viber съобщение за липсващо плащане', audience: 'Родител на Антоан Тест', channel: 'Viber', type: 'Практически час', status: 'error' },
  { time: 'Преди 17 мин', title: 'Теория отсъствие · дължима сума 25 EUR', audience: 'Елена Стоянова', channel: 'Viber', type: 'Теория', status: 'warning' },
  { time: 'Преди 42 мин', title: 'Сигнал за 10-ти час в категория B', audience: 'Родител на Мила Костова', channel: 'Система + Viber', type: 'Автоматичен сигнал', status: 'info' },
  { time: 'Преди 1 ч', title: 'Приветствено съобщение за нов курсист', audience: 'Никола Петров', channel: 'Viber', type: 'Онбординг', status: 'success' },
];

export const reports: ReportRow[] = [
  { report: 'Финансов обзор по школа', period: '01.03.2026 – 25.03.2026', owner: 'Администрация', freshness: 'Обновен преди 12 мин', status: 'success' },
  { report: 'Прогноза за забавени плащания', period: 'Следващи 14 дни', owner: 'AI модул', freshness: 'Обновен преди 27 мин', status: 'warning' },
  { report: 'Натоварване на инструктори и автомобили', period: 'Текуща седмица', owner: 'Оперативен панел', freshness: 'Обновен преди 6 мин', status: 'info' },
];
