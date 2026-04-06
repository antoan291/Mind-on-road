import { apiClient } from './apiClient';

export type ExamApplicationStatus =
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'SENT'
  | 'RECEIVED'
  | 'APPROVED'
  | 'REJECTED';

export type ExamApplicationRevisionView = {
  id: string;
  actorName: string;
  changeSummary: string;
  previousSnapshot: Record<string, unknown>;
  nextSnapshot: Record<string, unknown>;
  changedAt: string;
};

export type ExamApplicationView = {
  id: string;
  studentId: string;
  studentName: string;
  categoryCode: string;
  applicationNumber: string;
  status: ExamApplicationStatus;
  statusLabel: string;
  statusTone: 'info' | 'warning' | 'success' | 'error';
  examOfficeName: string;
  preferredExamDate: string | null;
  requiredDataSnapshot: Record<string, unknown>;
  missingRequirements: string[];
  statusNote: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  revisionHistory: ExamApplicationRevisionView[];
};

type BackendExamApplication = Omit<
  ExamApplicationView,
  'statusLabel' | 'statusTone'
>;

export async function fetchExamApplicationRecords() {
  const response = await apiClient.get<{ items: BackendExamApplication[] }>(
    '/exam-applications',
  );

  return response.items.map((item) => mapExamApplication(item));
}

export async function generateExamApplicationRecord(
  studentId: string,
  csrfToken: string,
) {
  const response = await apiClient.post<BackendExamApplication>(
    '/exam-applications/generate',
    { studentId },
    csrfToken,
  );

  return mapExamApplication(response);
}

export async function updateExamApplicationStatus(
  applicationId: string,
  payload: {
    status: ExamApplicationStatus;
    statusNote?: string | null;
  },
  csrfToken: string,
) {
  const response = await apiClient.put<BackendExamApplication>(
    `/exam-applications/${applicationId}`,
    payload,
    csrfToken,
  );

  return mapExamApplication(response);
}

function mapExamApplication(
  application: BackendExamApplication,
): ExamApplicationView {
  return {
    ...application,
    preferredExamDate: application.preferredExamDate ?? null,
    missingRequirements: application.missingRequirements ?? [],
    statusNote: application.statusNote ?? null,
    submittedAt: application.submittedAt ?? null,
    decidedAt: application.decidedAt ?? null,
    createdAt: application.createdAt ?? '',
    updatedAt: application.updatedAt ?? '',
    revisionHistory: application.revisionHistory ?? [],
    statusLabel: mapStatusLabel(application.status),
    statusTone: mapStatusTone(application.status),
  };
}

function mapStatusLabel(status: ExamApplicationStatus) {
  switch (status) {
    case 'READY_FOR_REVIEW':
      return 'Готово за преглед';
    case 'SENT':
      return 'Изпратено';
    case 'RECEIVED':
      return 'Получено';
    case 'APPROVED':
      return 'Одобрено';
    case 'REJECTED':
      return 'Отхвърлено';
    default:
      return 'Чернова';
  }
}

function mapStatusTone(
  status: ExamApplicationStatus,
): ExamApplicationView['statusTone'] {
  switch (status) {
    case 'READY_FOR_REVIEW':
    case 'RECEIVED':
      return 'info';
    case 'SENT':
      return 'warning';
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    default:
      return 'warning';
  }
}
