import { apiClient } from './apiClient';

type BackendPracticalLesson = {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  instructorName: string;
  vehicleLabel: string;
  categoryCode: string;
  lessonDate: string;
  startTimeLabel: string;
  endTimeLabel: string;
  durationMinutes: number;
  status:
    | 'SCHEDULED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELED'
    | 'NO_SHOW'
    | 'LATE';
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'NOT_REQUIRED';
  evaluationStatus: 'PENDING' | 'COMPLETED' | 'NOT_REQUIRED';
  routeLabel: string | null;
  startLocation: string | null;
  endLocation: string | null;
  notes: string | null;
  kmDriven: number | null;
  rating: number | null;
  parentNotificationSent: boolean;
  parentPerformanceSummary: string | null;
  parentFeedbackRating: number | null;
  parentFeedbackComment: string | null;
  parentFeedbackSubmittedAt: string | null;
  studentFeedbackRating: number | null;
  studentFeedbackComment: string | null;
  studentFeedbackSubmittedAt: string | null;
  revisionHistory: BackendPracticalLessonRevision[];
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendPracticalLessonRevision = {
  id: string;
  actorName: string;
  changeSummary: string;
  previousSnapshot: Record<string, unknown>;
  nextSnapshot: Record<string, unknown>;
  changedAt: string;
};

export type PracticalLessonRevisionView = {
  id: string;
  actorName: string;
  changeSummary: string;
  previousSnapshot: Record<string, unknown>;
  nextSnapshot: Record<string, unknown>;
  changedAt: string;
};

export type PracticalLessonView = {
  id: string;
  date: string;
  time: string;
  endTime: string;
  student: string;
  studentId: string;
  studentPhone: string;
  instructor: string;
  instructorId: number;
  vehicle: string;
  vehicleReg: string;
  category: string;
  duration: number;
  status:
    | 'scheduled'
    | 'in-progress'
    | 'completed'
    | 'canceled'
    | 'no-show'
    | 'late';
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'not-required';
  evaluationStatus: 'pending' | 'completed' | 'not-required';
  route?: string;
  notes?: string;
  startLocation?: string;
  endLocation?: string;
  kmDriven?: number;
  skills?: string[];
  rating?: number;
  parentNotificationSent?: boolean;
  parentPerformanceSummary?: string;
  parentFeedbackRating?: number;
  parentFeedbackComment?: string;
  parentFeedbackSubmittedAt?: string;
  studentFeedbackRating?: number;
  studentFeedbackComment?: string;
  studentFeedbackSubmittedAt?: string;
  revisionHistory: PracticalLessonRevisionView[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PracticalLessonUpdatePayload = {
  studentName?: string;
  instructorName?: string;
  vehicleLabel?: string;
  categoryCode?: string;
  lessonDate?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  durationMinutes?: number;
  status?:
    | 'SCHEDULED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELED'
    | 'NO_SHOW'
    | 'LATE';
  paymentStatus?: 'PAID' | 'PENDING' | 'OVERDUE' | 'NOT_REQUIRED';
  evaluationStatus?: 'PENDING' | 'COMPLETED' | 'NOT_REQUIRED';
  routeLabel?: string | null;
  startLocation?: string | null;
  endLocation?: string | null;
  notes?: string | null;
  kmDriven?: number | null;
  rating?: number | null;
  parentNotificationSent?: boolean;
  parentPerformanceSummary?: string | null;
  parentFeedbackRating?: number | null;
  parentFeedbackComment?: string | null;
  parentFeedbackSubmittedAt?: string | null;
  studentFeedbackRating?: number | null;
  studentFeedbackComment?: string | null;
  studentFeedbackSubmittedAt?: string | null;
};

export type PracticalLessonCreatePayload = {
  studentId: string;
  studentName: string;
  instructorName: string;
  vehicleLabel: string;
  categoryCode: string;
  lessonDate: string;
  startTimeLabel: string;
  endTimeLabel: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW' | 'LATE';
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'NOT_REQUIRED';
  evaluationStatus: 'PENDING' | 'COMPLETED' | 'NOT_REQUIRED';
  routeLabel?: string | null;
  startLocation?: string | null;
  endLocation?: string | null;
  notes?: string | null;
  kmDriven?: number | null;
  rating?: number | null;
  parentNotificationSent?: boolean;
  parentPerformanceSummary?: string | null;
};

export async function fetchPracticalLessonRecords() {
  const response = await apiClient.get<{ items: BackendPracticalLesson[] }>(
    '/practical-lessons',
  );

  return response.items.map((lesson, index) =>
    mapPracticalLesson(lesson, index),
  );
}

export async function updatePracticalLessonRecord(
  lessonId: string,
  payload: PracticalLessonUpdatePayload,
  csrfToken: string,
) {
  const response = await apiClient.put<BackendPracticalLesson>(
    `/practical-lessons/${lessonId}`,
    payload,
    csrfToken,
  );

  return mapPracticalLesson(response, 0);
}

export async function createPracticalLessonRecord(
  payload: PracticalLessonCreatePayload,
  csrfToken: string,
) {
  const response = await apiClient.post<BackendPracticalLesson>(
    '/practical-lessons',
    payload,
    csrfToken,
  );

  return mapPracticalLesson(response, 0);
}

export async function deletePracticalLessonRecord(
  lessonId: string,
  csrfToken: string,
) {
  await apiClient.delete<void>(`/practical-lessons/${lessonId}`, csrfToken);
}

export async function submitPracticalLessonStudentFeedback(
  lessonId: string,
  payload: {
    studentFeedbackRating: number;
    studentFeedbackComment: string;
  },
  csrfToken: string,
) {
  const response = await apiClient.post<BackendPracticalLesson>(
    `/practical-lessons/${lessonId}/student-feedback`,
    payload,
    csrfToken,
  );

  return mapPracticalLesson(response, 0);
}

export async function submitPracticalLessonParentFeedback(
  lessonId: string,
  payload: {
    parentFeedbackRating: number;
    parentFeedbackComment: string;
  },
  csrfToken: string,
) {
  const response = await apiClient.post<BackendPracticalLesson>(
    `/practical-lessons/${lessonId}/parent-feedback`,
    payload,
    csrfToken,
  );

  return mapPracticalLesson(response, 0);
}

function mapPracticalLesson(
  lesson: BackendPracticalLesson,
  index: number,
): PracticalLessonView {
  return {
    id: lesson.id,
    date: lesson.lessonDate,
    time: lesson.startTimeLabel,
    endTime: lesson.endTimeLabel,
    student: lesson.studentName,
    studentId: lesson.studentId,
    studentPhone: lesson.studentPhone,
    instructor: lesson.instructorName,
    instructorId: index + 1,
    vehicle: lesson.vehicleLabel,
    vehicleReg: lesson.vehicleLabel,
    category: lesson.categoryCode,
    duration: lesson.durationMinutes,
    status: mapLessonStatus(lesson.status),
    paymentStatus: mapPaymentStatus(lesson.paymentStatus),
    evaluationStatus: mapEvaluationStatus(lesson.evaluationStatus),
    route: lesson.routeLabel ?? undefined,
    notes: lesson.notes ?? undefined,
    startLocation: lesson.startLocation ?? undefined,
    endLocation: lesson.endLocation ?? undefined,
    kmDriven: lesson.kmDriven ?? undefined,
    skills: lesson.routeLabel ? [lesson.routeLabel] : undefined,
    rating: lesson.rating ?? undefined,
    parentNotificationSent: lesson.parentNotificationSent,
    parentPerformanceSummary:
      lesson.parentPerformanceSummary ?? undefined,
    parentFeedbackRating: lesson.parentFeedbackRating ?? undefined,
    parentFeedbackComment:
      lesson.parentFeedbackComment ?? undefined,
    parentFeedbackSubmittedAt:
      lesson.parentFeedbackSubmittedAt ?? undefined,
    studentFeedbackRating: lesson.studentFeedbackRating ?? undefined,
    studentFeedbackComment:
      lesson.studentFeedbackComment ?? undefined,
    studentFeedbackSubmittedAt:
      lesson.studentFeedbackSubmittedAt ?? undefined,
    revisionHistory: lesson.revisionHistory.map((revision) => ({
      id: revision.id,
      actorName: revision.actorName,
      changeSummary: revision.changeSummary,
      previousSnapshot: revision.previousSnapshot,
      nextSnapshot: revision.nextSnapshot,
      changedAt: revision.changedAt,
    })),
    createdBy: lesson.createdBy ?? undefined,
    updatedBy: lesson.updatedBy ?? undefined,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
}

function mapLessonStatus(status: BackendPracticalLesson['status']) {
  if (status === 'IN_PROGRESS') return 'in-progress';
  if (status === 'COMPLETED') return 'completed';
  if (status === 'CANCELED') return 'canceled';
  if (status === 'NO_SHOW') return 'no-show';
  if (status === 'LATE') return 'late';
  return 'scheduled';
}

function mapPaymentStatus(
  status: BackendPracticalLesson['paymentStatus'],
) {
  if (status === 'PAID') return 'paid';
  if (status === 'OVERDUE') return 'overdue';
  if (status === 'NOT_REQUIRED') return 'not-required';
  return 'pending';
}

function mapEvaluationStatus(
  status: BackendPracticalLesson['evaluationStatus'],
) {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'NOT_REQUIRED') return 'not-required';
  return 'pending';
}
