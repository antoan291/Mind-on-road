import type {
  PracticalLessonEvaluationStatus,
  PracticalLessonPaymentStatus,
  PracticalLessonStatus
} from '@prisma/client';

export interface PracticalLessonRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  instructorName: string;
  vehicleLabel: string;
  categoryCode: string;
  lessonDate: Date;
  startTimeLabel: string;
  endTimeLabel: string;
  durationMinutes: number;
  status: PracticalLessonStatus;
  paymentStatus: PracticalLessonPaymentStatus;
  evaluationStatus: PracticalLessonEvaluationStatus;
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
  parentFeedbackSubmittedAt: Date | null;
  studentFeedbackRating: number | null;
  studentFeedbackComment: string | null;
  studentFeedbackSubmittedAt: Date | null;
  revisionHistory: PracticalLessonRevisionRecord[];
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticalLessonRevisionRecord {
  id: string;
  actorName: string;
  changeSummary: string;
  previousSnapshot: Record<string, unknown>;
  nextSnapshot: Record<string, unknown>;
  changedAt: Date;
}

export interface PracticalLessonUpdateInput {
  studentName?: string;
  instructorName?: string;
  vehicleLabel?: string;
  categoryCode?: string;
  lessonDate?: Date;
  startTimeLabel?: string;
  endTimeLabel?: string;
  durationMinutes?: number;
  status?: PracticalLessonStatus;
  paymentStatus?: PracticalLessonPaymentStatus;
  evaluationStatus?: PracticalLessonEvaluationStatus;
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
  parentFeedbackSubmittedAt?: Date | null;
  studentFeedbackRating?: number | null;
  studentFeedbackComment?: string | null;
  studentFeedbackSubmittedAt?: Date | null;
  updatedBy?: string | null;
}

export interface PracticalLessonCreateInput {
  studentId: string;
  studentName: string;
  instructorName: string;
  vehicleLabel: string;
  categoryCode: string;
  lessonDate: Date;
  startTimeLabel: string;
  endTimeLabel: string;
  durationMinutes: number;
  status: PracticalLessonStatus;
  paymentStatus: PracticalLessonPaymentStatus;
  evaluationStatus: PracticalLessonEvaluationStatus;
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
  parentFeedbackSubmittedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface PracticalLessonsRepository {
  listByTenant(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }): Promise<PracticalLessonRecord[]>;
  createForTenant(params: {
    tenantId: string;
    lesson: PracticalLessonCreateInput;
  }): Promise<PracticalLessonRecord | null>;
  updateByTenantAndId(params: {
    tenantId: string;
    lessonId: string;
    lesson: PracticalLessonUpdateInput;
  }): Promise<PracticalLessonRecord | null>;
  deleteByTenantAndId(params: {
    tenantId: string;
    lessonId: string;
  }): Promise<boolean>;
}
import type { QueryReadAccessScope } from '../../../shared/query/read-access-scope';
