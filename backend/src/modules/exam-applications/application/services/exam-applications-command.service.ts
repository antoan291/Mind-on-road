import type {
  ExamApplicationStatus,
  ExamApplicationsRepository
} from '../../domain/repositories/exam-applications.repository';
import { toExamApplicationResponse } from './exam-applications-query.service';

export class ExamApplicationValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ExamApplicationValidationError';
  }
}

const BLOCKED_BY_MISSING_REQUIREMENTS = new Set<ExamApplicationStatus>([
  'SENT',
  'RECEIVED',
  'APPROVED'
]);

export class ExamApplicationsCommandService {
  public constructor(
    private readonly examApplicationsRepository: ExamApplicationsRepository
  ) {}

  public async generateApplication(params: {
    tenantId: string;
    studentId: string;
    actorName: string;
  }) {
    const application =
      await this.examApplicationsRepository.generateForStudent(params);

    return application ? toExamApplicationResponse(application) : null;
  }

  public async updateApplicationStatus(params: {
    tenantId: string;
    applicationId: string;
    status: ExamApplicationStatus;
    statusNote: string | null;
    actorName: string;
  }) {
    const currentApplication =
      await this.examApplicationsRepository.findByTenantAndId({
        tenantId: params.tenantId,
        applicationId: params.applicationId
      });

    if (!currentApplication) {
      return null;
    }

    if (
      BLOCKED_BY_MISSING_REQUIREMENTS.has(params.status) &&
      currentApplication.missingRequirements.length > 0
    ) {
      throw new ExamApplicationValidationError(
        'Application cannot be sent while mandatory student data or documents are missing.'
      );
    }

    const updatedApplication =
      await this.examApplicationsRepository.updateStatusByTenantAndId(params);

    return updatedApplication
      ? toExamApplicationResponse(updatedApplication)
      : null;
  }
}
