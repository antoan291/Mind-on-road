import type {
  ExamApplicationRecord,
  ExamApplicationsRepository
} from '../../domain/repositories/exam-applications.repository';

export class ExamApplicationsQueryService {
  public constructor(
    private readonly examApplicationsRepository: ExamApplicationsRepository
  ) {}

  public async listExamApplications(params: { tenantId: string }) {
    const items = await this.examApplicationsRepository.listByTenant(params);

    return items.map((item) => toExamApplicationResponse(item));
  }
}

export function toExamApplicationResponse(item: ExamApplicationRecord) {
  return {
    id: item.id,
    studentId: item.studentId,
    studentName: item.studentName,
    categoryCode: item.categoryCode,
    applicationNumber: item.applicationNumber,
    status: item.status,
    examOfficeName: item.examOfficeName,
    preferredExamDate: item.preferredExamDate
      ? item.preferredExamDate.toISOString().slice(0, 10)
      : null,
    requiredDataSnapshot: item.requiredDataSnapshot,
    missingRequirements: item.missingRequirements,
    statusNote: item.statusNote,
    submittedAt: item.submittedAt?.toISOString() ?? null,
    decidedAt: item.decidedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    revisionHistory: item.revisionRecords.map((revision) => ({
      id: revision.id,
      actorName: revision.actorName,
      changeSummary: revision.changeSummary,
      previousSnapshot: revision.previousSnapshot,
      nextSnapshot: revision.nextSnapshot,
      changedAt: revision.changedAt.toISOString()
    }))
  };
}
