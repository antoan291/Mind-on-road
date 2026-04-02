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
    id: 2,
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
    id: 3,
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

export const instructorStudents: InstructorStudentRow[] = [
  { id: 101, instructorId: 1, instructorName: 'Иван Стоянов', studentName: 'Петър Георгиев', category: 'B', currentStage: 'Практика · градско каране', completedHours: 24, remainingHours: 6, maximumHours: 30, nextLesson: 'Утре · 10:00', status: 'info' },
  { id: 102, instructorId: 1, instructorName: 'Иван Стоянов', studentName: 'Мила Костова', category: 'B', currentStage: 'Финална подготовка', completedHours: 28, remainingHours: 2, maximumHours: 30, nextLesson: 'Днес · 17:20', status: 'success' },
  { id: 103, instructorId: 1, instructorName: 'Иван Стоянов', studentName: 'Йордан Христов', category: 'B', currentStage: 'Маневри и паркиране', completedHours: 18, remainingHours: 12, maximumHours: 30, nextLesson: 'Петък · 09:00', status: 'warning' },
  { id: 104, instructorId: 1, instructorName: 'Иван Стоянов', studentName: 'Кристина Василева', category: 'B', currentStage: 'Начален етап', completedHours: 6, remainingHours: 24, maximumHours: 30, nextLesson: 'Понеделник · 14:40', status: 'info' },
  { id: 201, instructorId: 2, instructorName: 'Мария Георгиева', studentName: 'Елена Димитрова', category: 'B', currentStage: 'Теория + първи практически часове', completedHours: 10, remainingHours: 20, maximumHours: 30, nextLesson: 'Днес · 16:00', status: 'warning' },
  { id: 202, instructorId: 2, instructorName: 'Мария Георгиева', studentName: 'Ана Петкова', category: 'B', currentStage: 'Начален етап', completedHours: 5, remainingHours: 25, maximumHours: 30, nextLesson: 'Утре · 11:00', status: 'info' },
  { id: 203, instructorId: 2, instructorName: 'Мария Георгиева', studentName: 'Никола Петров', category: 'B', currentStage: 'Извънградско каране', completedHours: 22, remainingHours: 8, maximumHours: 30, nextLesson: 'Събота · 08:30', status: 'success' },
  { id: 204, instructorId: 2, instructorName: 'Мария Георгиева', studentName: 'София Николова', category: 'B', currentStage: 'Практика · кръстовища и престрояване', completedHours: 14, remainingHours: 16, maximumHours: 30, nextLesson: 'Днес · 18:10', status: 'info' },
  { id: 301, instructorId: 3, instructorName: 'Стефан Николов', studentName: 'Мартин Иванов', category: 'A', currentStage: 'Финална подготовка', completedHours: 16, remainingHours: 2, maximumHours: 18, nextLesson: 'Утре · 09:00', status: 'success' },
  { id: 302, instructorId: 3, instructorName: 'Стефан Николов', studentName: 'Георги Тодоров', category: 'A', currentStage: 'Управление в трафик', completedHours: 11, remainingHours: 7, maximumHours: 18, nextLesson: 'Петък · 13:30', status: 'warning' },
  { id: 303, instructorId: 3, instructorName: 'Стефан Николов', studentName: 'Даниел Стоянов', category: 'A', currentStage: 'Начален етап', completedHours: 4, remainingHours: 14, maximumHours: 18, nextLesson: 'Понеделник · 10:20', status: 'info' },
];

export const vehicles: VehicleRow[] = [
  { vehicle: 'Toyota Corolla · CA 1234 AB', instructor: 'Иван Стоянов', category: 'B', status: 'success', nextInspection: '12.04.2026', activeLessons: 6, issue: 'Няма активни проблеми' },
  { vehicle: 'Skoda Octavia · CA 5678 BC', instructor: 'Мария Георгиева', category: 'B', status: 'warning', nextInspection: '29.03.2026', activeLessons: 5, issue: 'Гражданска отговорност изтича скоро' },
  { vehicle: 'Yamaha MT-07 · CA 9012 KT', instructor: 'Стефан Николов', category: 'A', status: 'info', nextInspection: '18.05.2026', activeLessons: 3, issue: 'Планирана профилактика в петък' },
];

export const roadSheets: RoadSheetRow[] = [
  { sheetNumber: 'PL-2026-0318', date: '25.03.2026', instructor: 'Иван Стоянов', vehicle: 'Toyota Corolla · CA 1234 AB', students: 'Петър Георгиев, Мила Костова', distance: '68 км', status: 'success' },
  { sheetNumber: 'PL-2026-0319', date: '25.03.2026', instructor: 'Мария Георгиева', vehicle: 'Skoda Octavia · CA 5678 BC', students: 'Елена Димитрова', distance: '41 км', status: 'warning' },
  { sheetNumber: 'PL-2026-0320', date: '24.03.2026', instructor: 'Стефан Николов', vehicle: 'Yamaha MT-07 · CA 9012 KT', students: 'Мартин Иванов', distance: '36 км', status: 'info' },
];

export const notifications: NotificationRow[] = [
  { time: 'Преди 8 мин', title: 'Автоматично Viber съобщение за липсващо плащане', audience: 'Родител на Петър Георгиев', channel: 'Viber', type: 'Практически час', status: 'error' },
  { time: 'Преди 17 мин', title: 'Теория отсъствие · дължима сума 25 EUR', audience: 'Елена Стоянова', channel: 'Viber', type: 'Теория', status: 'warning' },
  { time: 'Преди 42 мин', title: 'Сигнал за 10-ти час в категория B', audience: 'Родител на Мила Костова', channel: 'Система + Viber', type: 'Автоматичен сигнал', status: 'info' },
  { time: 'Преди 1 ч', title: 'Приветствено съобщение за нов курсист', audience: 'Никола Петров', channel: 'Viber', type: 'Онбординг', status: 'success' },
];

export const reports: ReportRow[] = [
  { report: 'Финансов обзор по школа', period: '01.03.2026 – 25.03.2026', owner: 'Администрация', freshness: 'Обновен преди 12 мин', status: 'success' },
  { report: 'Прогноза за забавени плащания', period: 'Следващи 14 дни', owner: 'AI модул', freshness: 'Обновен преди 27 мин', status: 'warning' },
  { report: 'Натоварване на инструктори и автомобили', period: 'Текуща седмица', owner: 'Оперативен панел', freshness: 'Обновен преди 6 мин', status: 'info' },
];
