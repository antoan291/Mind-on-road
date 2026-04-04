export type ExamApplicationStatus =
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'SENT'
  | 'RECEIVED'
  | 'APPROVED'
  | 'REJECTED';

export interface ExamApplicationRevisionRecord {
  id: string;
  actorName: string;
  changeSummary: string;
  previousSnapshot: Record<string, unknown>;
  nextSnapshot: Record<string, unknown>;
  changedAt: Date;
}

export interface ExamApplicationRecord {
  id: string;
  studentId: string;
  studentName: string;
  categoryCode: string;
  applicationNumber: string;
  status: ExamApplicationStatus;
  examOfficeName: string;
  preferredExamDate: Date | null;
  requiredDataSnapshot: Record<string, unknown>;
  missingRequirements: string[];
  statusNote: string | null;
  submittedAt: Date | null;
  decidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  revisionRecords: ExamApplicationRevisionRecord[];
}

export interface ExamApplicationsRepository {
  listByTenant(params: { tenantId: string }): Promise<ExamApplicationRecord[]>;
  findByTenantAndId(params: {
    tenantId: string;
    applicationId: string;
  }): Promise<ExamApplicationRecord | null>;
  generateForStudent(params: {
    tenantId: string;
    studentId: string;
    actorName: string;
  }): Promise<ExamApplicationRecord | null>;
  updateStatusByTenantAndId(params: {
    tenantId: string;
    applicationId: string;
    status: ExamApplicationStatus;
    statusNote: string | null;
    actorName: string;
  }): Promise<ExamApplicationRecord | null>;
}
