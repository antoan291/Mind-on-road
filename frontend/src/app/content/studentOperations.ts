import { mockStudents } from './mockDb';

export type StudentExamOutcome = 'active' | 'failed' | 'passed' | 'withdrawn';
export type StudentTrainingMode = 'standard-package' | 'licensed-manual-hours';
export type CandidatePacketStatus = 'ready' | 'sent';

export type StudentOperationalProfile = {
  studentId: number;
  studentTypeLabel: string;
  trainingMode: StudentTrainingMode;
  hasPreviousLicense: boolean;
  previousLicenseCategory?: string;
  hoursEntryPolicy: string;
  examOutcome: StudentExamOutcome;
  examOutcomeLabel: string;
  failedExamAttempts: number;
  additionalHoursAssigned: number;
  maxTrainingHours: number;
  lastPracticeDate: string;
  daysWithoutPractice: number;
  inactivityAlert: boolean;
  earlyEnrollment: boolean;
  expectedArrivalDate: string;
  adminReminderDue: boolean;
  parentFeedbackEnabled: boolean;
  latestParentFeedbackStatus: string;
};

export type DeterminatorSession = {
  id: string;
  studentId: string | number;
  studentName: string;
  registrationNumber: string;
  measuredAt: string;
  autoTempoCorrectReactions: number;
  autoTempoWrongReactions: number;
  autoTempoSuccessCoefficient: number;
  forcedTempoCorrectReactions: number;
  forcedTempoDelayedReactions: number;
  forcedTempoWrongResults: number;
  forcedTempoMissedStimuli: number;
  forcedTempoSuccessCoefficient: number;
  overallResult: string;
  instructorNote: string;
};

export type CandidatePacket = {
  id: string;
  candidateName: string;
  phone: string;
  category: string;
  location: string;
  pdfTemplate: string;
  status: CandidatePacketStatus;
  sentAt: string;
};

const REFERENCE_DATE = new Date('2026-04-03T00:00:00');

const operationalProfiles: Record<number, StudentOperationalProfile> = {
  1: {
    studentId: 1,
    studentTypeLabel: 'Стандартен курсист',
    trainingMode: 'standard-package',
    hasPreviousLicense: false,
    hoursEntryPolicy: 'Автоматично намаляване от пакет след всеки проведен урок.',
    examOutcome: 'active',
    examOutcomeLabel: 'Активен курс',
    failedExamAttempts: 0,
    additionalHoursAssigned: 0,
    maxTrainingHours: 20,
    lastPracticeDate: '2026-03-29',
    daysWithoutPractice: 5,
    inactivityAlert: false,
    earlyEnrollment: false,
    expectedArrivalDate: '2026-03-15',
    adminReminderDue: false,
    parentFeedbackEnabled: true,
    latestParentFeedbackStatus: 'Готов за изпращане след следващия урок',
  },
};

const fallbackProfile = (studentId: number, totalHours: number, extraHours: number): StudentOperationalProfile => ({
  studentId,
  studentTypeLabel: 'Стандартен курсист',
  trainingMode: 'standard-package',
  hasPreviousLicense: false,
  hoursEntryPolicy: 'Автоматично намаляване от платен пакет след отчетен час.',
  examOutcome: 'active',
  examOutcomeLabel: 'Активен курс',
  failedExamAttempts: 0,
  additionalHoursAssigned: extraHours,
  maxTrainingHours: totalHours + extraHours,
  lastPracticeDate: '2026-03-20',
  daysWithoutPractice: 14,
  inactivityAlert: false,
  earlyEnrollment: false,
  expectedArrivalDate: '2026-03-20',
  adminReminderDue: false,
  parentFeedbackEnabled: true,
  latestParentFeedbackStatus: 'Може да се изпрати ръчно след урок',
});

export const studentOperationalRecords = mockStudents.map((student) => {
  const profile =
    operationalProfiles[student.id] ?? fallbackProfile(student.id, student.total, student.extraHours ?? 0);

  const computedTotalHours =
    profile.trainingMode === 'licensed-manual-hours'
      ? Math.max(profile.maxTrainingHours, student.used + profile.additionalHoursAssigned)
      : student.total + profile.additionalHoursAssigned;

  const computedRemainingHours = Math.max(computedTotalHours - student.used, 0);
  const computedProgress = computedTotalHours > 0 ? Math.round((student.used / computedTotalHours) * 100) : 0;

  return {
    ...student,
    studentTypeLabel: profile.studentTypeLabel,
    trainingMode: profile.trainingMode,
    hasPreviousLicense: profile.hasPreviousLicense,
    previousLicenseCategory: profile.previousLicenseCategory ?? '',
    hoursEntryPolicy: profile.hoursEntryPolicy,
    examOutcome: profile.examOutcome,
    examOutcomeLabel: profile.examOutcomeLabel,
    failedExamAttempts: profile.failedExamAttempts,
    extraHours: profile.additionalHoursAssigned,
    maxTrainingHours: computedTotalHours,
    total: computedTotalHours,
    remaining: computedRemainingHours,
    progress: computedProgress,
    lastPracticeDate: profile.lastPracticeDate,
    daysWithoutPractice: profile.daysWithoutPractice,
    inactivityAlert: profile.inactivityAlert,
    earlyEnrollment: profile.earlyEnrollment,
    expectedArrivalDate: profile.expectedArrivalDate,
    adminReminderDue: profile.adminReminderDue,
    parentFeedbackEnabled: profile.parentFeedbackEnabled,
    latestParentFeedbackStatus: profile.latestParentFeedbackStatus,
  };
});

type StaticStudentOperationalRecord = (typeof studentOperationalRecords)[number];

export type StudentOperationalRecord = Omit<StaticStudentOperationalRecord, 'id'> & {
  id: string | number;
  firstName?: string;
  lastName?: string;
  birthDate?: string | null;
  address?: string | null;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
};

export const inactivePracticeAlerts = studentOperationalRecords
  .filter((student) => student.inactivityAlert)
  .map((student) => ({
    studentId: student.id,
    studentName: student.name,
    daysWithoutPractice: student.daysWithoutPractice,
    lastPracticeDate: student.lastPracticeDate,
    message: `${student.name} не е карал ${student.daysWithoutPractice} дни. Последен час: ${student.lastPracticeDate}.`,
  }));

export const earlyEnrollmentReminders = studentOperationalRecords
  .filter((student) => student.adminReminderDue)
  .map((student) => ({
    studentId: student.id,
    studentName: student.name,
    expectedArrivalDate: student.expectedArrivalDate,
    daysUntilArrival: Math.max(
      0,
      Math.ceil(
        (new Date(`${student.expectedArrivalDate}T00:00:00`).getTime() - REFERENCE_DATE.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    ),
    message: `Ранно записване: ${student.name} трябва да бъде потърсен преди ${student.expectedArrivalDate}.`,
  }));

export const determinatorSessions: DeterminatorSession[] = [
  {
    id: 'det-001',
    studentId: 1,
    studentName: 'Антоан Тест',
    registrationNumber: 'AT-001',
    measuredAt: '2026-04-03 09:40',
    autoTempoCorrectReactions: 69,
    autoTempoWrongReactions: 1,
    autoTempoSuccessCoefficient: 34.5,
    forcedTempoCorrectReactions: 59,
    forcedTempoDelayedReactions: 1,
    forcedTempoWrongResults: 0,
    forcedTempoMissedStimuli: 0,
    forcedTempoSuccessCoefficient: 60,
    overallResult: 'Стабилно тестово представяне при автотемп и много добър резултат при наложен темп.',
    instructorNote: 'Да се запази текущото темпо и да се следи за грешни реакции при автотемп.',
  },
];

export function calculateAutoTempoSuccessCoefficient(correctReactions: number) {
  return Number((correctReactions / 2).toFixed(3));
}

export function calculateForcedTempoSuccessCoefficient(
  correctReactions: number,
  delayedReactions: number,
  wrongResults: number,
  missedStimuli: number,
) {
  return Number(
    (correctReactions + delayedReactions - wrongResults - missedStimuli).toFixed(3),
  );
}

export const candidatePackets: CandidatePacket[] = [
  {
    id: 'cand-test-1',
    candidateName: 'Антоан Тест',
    phone: '0886612503',
    category: 'B',
    location: 'София - Младост',
    pdfTemplate: 'mindonroad-category-b-sofia-mladost.pdf',
    status: 'ready',
    sentAt: '—',
  },
];

export function getStudentOperationalRecord(studentId: string | number) {
  const normalizedStudentId =
    typeof studentId === 'string' && /^\d+$/.test(studentId)
      ? Number(studentId)
      : studentId;

  return (
    studentOperationalRecords.find(
      (student) => student.id === normalizedStudentId,
    ) ?? studentOperationalRecords[0]
  );
}

export function getInstructorStudents(
  instructorName: string,
  sourceRecords: StudentOperationalRecord[] = studentOperationalRecords,
) {
  return sourceRecords
    .filter((student) => student.instructor === instructorName)
    .map((student) => ({
      id: student.id,
      studentName: student.name,
      category: student.category,
      status: student.status,
      currentStage:
        student.examOutcome === 'failed'
          ? `След скъсан изпит · ${student.extraHours} доп. часа`
          : student.progress >= 90
            ? 'Финална подготовка'
            : student.trainingMode === 'licensed-manual-hours'
              ? 'Ръчно добавяни часове · курсист с книжка'
              : 'Активна практика',
      completedHours: student.used,
      remainingHours: student.remaining,
      maximumHours: student.maxTrainingHours,
      nextLesson: student.nextLesson,
      inactiveFlag: student.inactivityAlert,
    }));
}

export function buildCandidatePacketPdfContent(packet: CandidatePacket) {
  return [
    'MindOnRoad кандидатски пакет',
    `Име: ${packet.candidateName}`,
    `Телефон: ${packet.phone}`,
    `Категория: ${packet.category}`,
    `Локация: ${packet.location}`,
    `PDF шаблон: ${packet.pdfTemplate}`,
    'Съдържание: документи, условия, график на обучение и инструкции за записване.',
  ].join('\n');
}
