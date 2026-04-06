import type { StudentOperationalRecord } from '../content/studentOperations';
import { apiClient } from './apiClient';

type BackendStudentEnrollmentSummary = {
  id: string;
  categoryCode: string;
  status: 'ACTIVE' | 'FAILED_EXAM' | 'COMPLETED' | 'PAUSED' | 'WITHDRAWN';
  trainingMode: 'STANDARD_PACKAGE' | 'LICENSED_MANUAL_HOURS';
  registerMode: 'ELECTRONIC' | 'PAPER' | 'HYBRID';
  instructorName: string | null;
  theoryGroupNumber: string | null;
  enrollmentDate: string;
  expectedArrivalDate: string | null;
  previousLicenseCategory: string | null;
  packageHours: number;
  additionalHours: number;
  completedHours: number;
  remainingHours: number;
  maxHours: number;
  failedExamAttempts: number;
  lastPracticeAt: string | null;
};

type BackendStudentListItem = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  nationalId: string;
  status: 'ACTIVE' | 'PAUSED' | 'WITHDRAWN' | 'COMPLETED';
  parentContactEnabled: boolean;
  enrollment: BackendStudentEnrollmentSummary | null;
};

export type BackendStudentDetail = BackendStudentListItem & {
  firstName: string;
  lastName: string;
  birthDate: string | null;
  address: string | null;
  educationLevel: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  enrollments: Array<
    BackendStudentEnrollmentSummary & {
      assignedInstructorName: string | null;
      notes: string | null;
    }
  >;
  portalAccess?: {
    loginIdentifier: string;
    temporaryPassword: string | null;
    mustChangePassword: boolean;
    status:
      | 'created'
      | 'linked_existing'
      | 'already_linked'
      | 'updated_existing';
  } | null;
};

export async function fetchStudentOperations() {
  const response = await apiClient.get<{ items: BackendStudentListItem[] }>(
    '/students',
  );

  return response.items.map((student) =>
    mapStudentSummaryToOperationalRecord(student),
  );
}

export async function fetchStudentOperationalDetail(studentId: string) {
  const student = await apiClient.get<BackendStudentDetail>(
    `/students/${studentId}`,
  );

  const record = mapStudentSummaryToOperationalRecord(student);

  return {
    ...record,
    firstName: student.firstName,
    lastName: student.lastName,
    birthDate: student.birthDate,
    address: student.address,
    educationLevel: student.educationLevel ?? record.educationLevel,
    parentName: student.parentName ?? '',
    parentPhone: student.parentPhone ?? '',
    parentEmail: student.parentEmail ?? '',
  };
}

export type StudentMutationPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  nationalId: string | null;
  birthDate: string | null;
  address: string | null;
  educationLevel: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  parentContactStatus: 'ENABLED' | 'DISABLED';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'WITHDRAWN';
  enrollment: {
    categoryCode: string;
    status: 'ACTIVE' | 'FAILED_EXAM' | 'PASSED' | 'PAUSED' | 'WITHDRAWN';
    trainingMode: 'STANDARD_PACKAGE' | 'LICENSED_MANUAL_HOURS';
    registerMode: 'ELECTRONIC' | 'PAPER' | 'HYBRID';
    theoryGroupNumber: string | null;
    assignedInstructorName: string | null;
    enrollmentDate: string;
    expectedArrivalDate: string | null;
    previousLicenseCategory: string | null;
    packageHours: number;
    additionalHours: number;
    completedHours: number;
    failedExamAttempts: number;
    lastPracticeAt: string | null;
    notes: string | null;
  };
};

export async function createStudentRecord(
  payload: StudentMutationPayload,
  csrfToken: string,
) {
  return apiClient.post<BackendStudentDetail>('/students', payload, csrfToken);
}

export async function updateStudentRecord(
  studentId: string,
  payload: StudentMutationPayload,
  csrfToken: string,
) {
  return apiClient.put<BackendStudentDetail>(
    `/students/${studentId}`,
    payload,
    csrfToken,
  );
}

function mapStudentSummaryToOperationalRecord(
  student: BackendStudentListItem,
): StudentOperationalRecord {
  const fallback = buildNeutralStudentFallback(student);
  const enrollment = student.enrollment;
  const totalHours = enrollment?.maxHours ?? fallback.total;
  const usedHours = enrollment?.completedHours ?? fallback.used;
  const progress =
    totalHours > 0
      ? Math.min(100, Math.round((usedHours / totalHours) * 100))
      : 0;
  const lastPracticeDate = enrollment?.lastPracticeAt
    ? enrollment.lastPracticeAt.slice(0, 10)
    : fallback.lastPracticeDate;
  const daysWithoutPractice = calculateDaysWithoutPractice(
    enrollment?.lastPracticeAt,
  );
  const expectedArrivalDate =
    enrollment?.expectedArrivalDate ?? fallback.expectedArrivalDate;
  const adminReminderDue = calculateIsAdminReminderDue(expectedArrivalDate);

  return {
    ...fallback,
    id: student.id,
    name: student.name,
    phone: student.phone,
    email: student.email ?? fallback.email,
    nationalId: student.nationalId,
    category: enrollment?.categoryCode ?? fallback.category,
    groupNumber: enrollment?.theoryGroupNumber ?? fallback.groupNumber,
    instructor: enrollment?.instructorName ?? fallback.instructor,
    trainingStartDate: enrollment?.enrollmentDate ?? fallback.trainingStartDate,
    startDate: enrollment?.enrollmentDate ?? fallback.startDate,
    recordMode: mapRegisterMode(enrollment?.registerMode ?? null),
    status: mapUiStatus(student.status, enrollment?.status ?? null, progress),
    statusLabel: mapStatusLabel(student.status, enrollment?.status ?? null),
    completed: usedHours,
    total: totalHours,
    used: usedHours,
    remaining: enrollment?.remainingHours ?? Math.max(totalHours - usedHours, 0),
    progress,
    studentTypeLabel:
      enrollment?.trainingMode === 'LICENSED_MANUAL_HOURS'
        ? 'Курсист с книжка'
        : 'Стандартен курсист',
    trainingMode:
      enrollment?.trainingMode === 'LICENSED_MANUAL_HOURS'
        ? 'licensed-manual-hours'
        : 'standard-package',
    hasPreviousLicense: Boolean(enrollment?.previousLicenseCategory),
    previousLicenseCategory: enrollment?.previousLicenseCategory ?? '',
    hoursEntryPolicy:
      enrollment?.trainingMode === 'LICENSED_MANUAL_HOURS'
        ? 'Часовете се добавят ръчно от администратор или инструктор, защото курсистът вече има книжка.'
        : 'Автоматично намаляване от платен пакет след отчетен час.',
    examOutcome: mapExamOutcome(student.status, enrollment?.status ?? null),
    examOutcomeLabel: mapExamOutcomeLabel(
      student.status,
      enrollment?.status ?? null,
    ),
    failedExamAttempts: enrollment?.failedExamAttempts ?? 0,
    extraHours: enrollment?.additionalHours ?? 0,
    maxTrainingHours: totalHours,
    lastPracticeDate,
    daysWithoutPractice,
    inactivityAlert: daysWithoutPractice > 30,
    earlyEnrollment: adminReminderDue,
    expectedArrivalDate,
    adminReminderDue,
    parentFeedbackEnabled: student.parentContactEnabled,
    latestParentFeedbackStatus: student.parentContactEnabled
      ? fallback.latestParentFeedbackStatus
      : 'Няма активиран родителски контакт',
  };
}

function buildNeutralStudentFallback(
  student: BackendStudentListItem,
): StudentOperationalRecord {
  return {
    id: student.id,
    name: student.name,
    phone: student.phone,
    email: student.email ?? '',
    nationalId: student.nationalId,
    category: student.enrollment?.categoryCode ?? 'B',
    groupNumber: student.enrollment?.theoryGroupNumber ?? '',
    instructor: student.enrollment?.instructorName ?? '',
    trainingStartDate: student.enrollment?.enrollmentDate ?? '',
    theoryCompletedAt: '',
    theoryExamAt: '',
    practicalCompletedAt: '',
    practicalExamAt: '',
    extraHours: student.enrollment?.additionalHours ?? 0,
    recordMode: mapRegisterMode(student.enrollment?.registerMode ?? null),
    insuranceStatus: 'active',
    educationLevel: '',
    courseOutcome: 'active',
    completed: student.enrollment?.completedHours ?? 0,
    total: student.enrollment?.maxHours ?? 0,
    progress: 0,
    paid: student.enrollment?.packageHours ?? 0,
    used: student.enrollment?.completedHours ?? 0,
    remaining: student.enrollment?.remainingHours ?? 0,
    nextLesson: 'Няма насрочен час',
    startDate: student.enrollment?.enrollmentDate ?? '',
    status: 'info',
    statusLabel: 'Активен',
    theoryCompleted: false,
    paymentStatus: 'pending',
    studentTypeLabel: 'Стандартен курсист',
    trainingMode:
      student.enrollment?.trainingMode === 'LICENSED_MANUAL_HOURS'
        ? 'licensed-manual-hours'
        : 'standard-package',
    hasPreviousLicense: Boolean(student.enrollment?.previousLicenseCategory),
    previousLicenseCategory:
      student.enrollment?.previousLicenseCategory ?? '',
    hoursEntryPolicy:
      student.enrollment?.trainingMode === 'LICENSED_MANUAL_HOURS'
        ? 'Часовете се добавят ръчно от администратор или инструктор, защото курсистът вече има книжка.'
        : 'Автоматично намаляване от платен пакет след отчетен час.',
    examOutcome: 'active',
    examOutcomeLabel: 'Активен курс',
    failedExamAttempts: student.enrollment?.failedExamAttempts ?? 0,
    maxTrainingHours: student.enrollment?.maxHours ?? 0,
    lastPracticeDate: student.enrollment?.lastPracticeAt?.slice(0, 10) ?? '',
    daysWithoutPractice: 0,
    inactivityAlert: false,
    earlyEnrollment: false,
    expectedArrivalDate: student.enrollment?.expectedArrivalDate ?? '',
    adminReminderDue: false,
    parentFeedbackEnabled: student.parentContactEnabled,
    latestParentFeedbackStatus: student.parentContactEnabled
      ? 'Може да се изпрати ръчно след урок'
      : 'Няма активиран родителски контакт',
  };
}

function mapRegisterMode(
  registerMode: BackendStudentEnrollmentSummary['registerMode'] | null,
) {
  if (registerMode === 'PAPER') {
    return 'paper';
  }

  return 'electronic';
}

function mapUiStatus(
  studentStatus: BackendStudentListItem['status'],
  enrollmentStatus: BackendStudentEnrollmentSummary['status'] | null,
  progress: number,
) {
  if (studentStatus === 'WITHDRAWN' || enrollmentStatus === 'WITHDRAWN') {
    return 'warning';
  }

  if (enrollmentStatus === 'FAILED_EXAM') {
    return 'warning';
  }

  if (studentStatus === 'COMPLETED' || enrollmentStatus === 'COMPLETED') {
    return 'success';
  }

  if (progress >= 70) {
    return 'success';
  }

  return progress >= 30 ? 'warning' : 'info';
}

function mapStatusLabel(
  studentStatus: BackendStudentListItem['status'],
  enrollmentStatus: BackendStudentEnrollmentSummary['status'] | null,
) {
  if (studentStatus === 'WITHDRAWN' || enrollmentStatus === 'WITHDRAWN') {
    return 'Прекратен';
  }

  if (enrollmentStatus === 'FAILED_EXAM') {
    return 'След скъсан изпит';
  }

  if (studentStatus === 'COMPLETED' || enrollmentStatus === 'COMPLETED') {
    return 'Завършен';
  }

  return 'Активен';
}

function mapExamOutcome(
  studentStatus: BackendStudentListItem['status'],
  enrollmentStatus: BackendStudentEnrollmentSummary['status'] | null,
) {
  if (studentStatus === 'WITHDRAWN' || enrollmentStatus === 'WITHDRAWN') {
    return 'withdrawn';
  }

  if (studentStatus === 'COMPLETED' || enrollmentStatus === 'COMPLETED') {
    return 'passed';
  }

  if (enrollmentStatus === 'FAILED_EXAM') {
    return 'failed';
  }

  return 'active';
}

function mapExamOutcomeLabel(
  studentStatus: BackendStudentListItem['status'],
  enrollmentStatus: BackendStudentEnrollmentSummary['status'] | null,
) {
  if (studentStatus === 'WITHDRAWN' || enrollmentStatus === 'WITHDRAWN') {
    return 'Прекратен';
  }

  if (studentStatus === 'COMPLETED' || enrollmentStatus === 'COMPLETED') {
    return 'Изпит взет';
  }

  if (enrollmentStatus === 'FAILED_EXAM') {
    return 'Скъсан на практика';
  }

  return 'Активен курс';
}

function calculateDaysWithoutPractice(lastPracticeAt: string | null) {
  if (!lastPracticeAt) {
    return 0;
  }

  const today = new Date();
  const lastPracticeDate = new Date(lastPracticeAt);

  if (Number.isNaN(lastPracticeDate.getTime())) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (today.getTime() - lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
}

function calculateIsAdminReminderDue(expectedArrivalDate: string | null) {
  if (!expectedArrivalDate) {
    return false;
  }

  const today = new Date();
  const arrivalDate = new Date(`${expectedArrivalDate}T00:00:00`);

  if (Number.isNaN(arrivalDate.getTime())) {
    return false;
  }

  const daysUntilArrival = Math.ceil(
    (arrivalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return daysUntilArrival >= 0 && daysUntilArrival <= 10;
}
