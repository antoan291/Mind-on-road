import type {
  PracticalLessonRecord,
  PracticalLessonsRepository
} from '../../domain/repositories/practical-lessons.repository';

export class PracticalLessonsQueryService {
  public constructor(
    private readonly practicalLessonsRepository: PracticalLessonsRepository
  ) {}

  public async listLessons(params: { tenantId: string }) {
    const lessons = await this.practicalLessonsRepository.listByTenant({
      tenantId: params.tenantId
    });

    return lessons.map((lesson) => toPracticalLessonResponse(lesson));
  }
}

export function toPracticalLessonResponse(lesson: PracticalLessonRecord) {
  return {
    id: lesson.id,
    studentId: lesson.studentId,
    studentName: lesson.studentName,
    studentPhone: lesson.studentPhone,
    instructorName: lesson.instructorName,
    vehicleLabel: lesson.vehicleLabel,
    categoryCode: lesson.categoryCode,
    lessonDate: lesson.lessonDate.toISOString().slice(0, 10),
    startTimeLabel: lesson.startTimeLabel,
    endTimeLabel: lesson.endTimeLabel,
    durationMinutes: lesson.durationMinutes,
    status: lesson.status,
    paymentStatus: lesson.paymentStatus,
    evaluationStatus: lesson.evaluationStatus,
    routeLabel: lesson.routeLabel,
    startLocation: lesson.startLocation,
    endLocation: lesson.endLocation,
    notes: lesson.notes,
    kmDriven: lesson.kmDriven,
    rating: lesson.rating,
    parentNotificationSent: lesson.parentNotificationSent,
    parentPerformanceSummary: lesson.parentPerformanceSummary,
    parentFeedbackRating: lesson.parentFeedbackRating,
    parentFeedbackComment: lesson.parentFeedbackComment,
    parentFeedbackSubmittedAt:
      lesson.parentFeedbackSubmittedAt?.toISOString() ?? null,
    studentFeedbackRating: lesson.studentFeedbackRating,
    studentFeedbackComment: lesson.studentFeedbackComment,
    studentFeedbackSubmittedAt:
      lesson.studentFeedbackSubmittedAt?.toISOString() ?? null,
    revisionHistory: lesson.revisionHistory.map((revision) => ({
      id: revision.id,
      actorName: revision.actorName,
      changeSummary: revision.changeSummary,
      previousSnapshot: revision.previousSnapshot,
      nextSnapshot: revision.nextSnapshot,
      changedAt: revision.changedAt.toISOString()
    })),
    createdBy: lesson.createdBy,
    updatedBy: lesson.updatedBy,
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString()
  };
}
