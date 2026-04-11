import type { Prisma, PrismaClient } from '@prisma/client';

import type { QueryReadAccessScope } from '../../../../shared/query/read-access-scope';
import type {
  PracticalLessonCreateInput,
  PracticalLessonRecord,
  PracticalLessonUpdateInput,
  PracticalLessonsRepository
} from '../../../domain/repositories/practical-lessons.repository';
import {
  PracticalLessonInstructorScheduleConflictError,
  PracticalLessonStudentScheduleConflictError,
  PracticalLessonVehicleScheduleConflictError
} from '../../../domain/practical-lessons.errors';

const practicalLessonSelect = {
  id: true,
  studentId: true,
  studentName: true,
  instructorName: true,
  vehicleLabel: true,
  categoryCode: true,
  lessonDate: true,
  startTimeLabel: true,
  endTimeLabel: true,
  durationMinutes: true,
  status: true,
  paymentStatus: true,
  evaluationStatus: true,
  routeLabel: true,
  startLocation: true,
  endLocation: true,
  notes: true,
  kmDriven: true,
  rating: true,
  parentNotificationSent: true,
  parentPerformanceSummary: true,
  parentFeedbackRating: true,
  parentFeedbackComment: true,
  parentFeedbackSubmittedAt: true,
  studentFeedbackRating: true,
  studentFeedbackComment: true,
  studentFeedbackSubmittedAt: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  revisionRecords: {
    orderBy: {
      changedAt: 'desc'
    },
    select: {
      id: true,
      actorName: true,
      changeSummary: true,
      previousSnapshot: true,
      nextSnapshot: true,
      changedAt: true
    },
    take: 20
  },
  student: {
    select: {
      phone: true
    }
  }
} as const satisfies Prisma.PracticalLessonRecordSelect;

type PracticalLessonRow = Prisma.PracticalLessonRecordGetPayload<{
  select: typeof practicalLessonSelect;
}>;

export class PrismaPracticalLessonsRepository
  implements PracticalLessonsRepository
{
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }): Promise<PracticalLessonRecord[]> {
    return this.prisma.practicalLessonRecord.findMany({
      where: buildPracticalLessonReadWhere(params.tenantId, params.scope),
      orderBy: [
        {
          lessonDate: 'desc'
        },
        {
          startTimeLabel: 'asc'
        }
      ],
      select: practicalLessonSelect
    }).then((lessons) => lessons.map((lesson) => mapPracticalLessonRow(lesson)));
  }

  public async updateByTenantAndId(params: {
    tenantId: string;
    lessonId: string;
    lesson: PracticalLessonUpdateInput;
  }): Promise<PracticalLessonRecord | null> {
    const existingLesson = await this.prisma.practicalLessonRecord.findFirst({
      where: {
        id: params.lessonId,
        tenantId: params.tenantId
      },
      select: {
        id: true,
        studentId: true,
        instructorName: true,
        vehicleLabel: true,
        lessonDate: true,
        startTimeLabel: true,
        endTimeLabel: true,
        status: true,
        paymentStatus: true,
        evaluationStatus: true,
        routeLabel: true,
        startLocation: true,
        endLocation: true,
        notes: true,
        kmDriven: true,
        rating: true,
        parentNotificationSent: true,
        parentPerformanceSummary: true,
        parentFeedbackRating: true,
        parentFeedbackComment: true,
        parentFeedbackSubmittedAt: true,
        studentFeedbackRating: true,
        studentFeedbackComment: true,
        studentFeedbackSubmittedAt: true,
        updatedBy: true
      }
    });

    if (!existingLesson) {
      return null;
    }

    if (shouldValidateScheduleSlot(existingLesson, params.lesson)) {
      await this.assertStudentScheduleSlotAvailable({
        tenantId: params.tenantId,
        studentId: existingLesson.studentId,
        instructorName:
          params.lesson.instructorName ?? existingLesson.instructorName,
        vehicleLabel: params.lesson.vehicleLabel ?? existingLesson.vehicleLabel,
        lessonDate: params.lesson.lessonDate ?? existingLesson.lessonDate,
        startTimeLabel:
          params.lesson.startTimeLabel ?? existingLesson.startTimeLabel,
        endTimeLabel: params.lesson.endTimeLabel ?? existingLesson.endTimeLabel,
        excludedLessonId: params.lessonId
      });
    }

    const nextSnapshot = buildLessonSnapshot({
      studentId: existingLesson.studentId,
      instructorName:
        params.lesson.instructorName ?? existingLesson.instructorName,
      vehicleLabel: params.lesson.vehicleLabel ?? existingLesson.vehicleLabel,
      lessonDate: params.lesson.lessonDate ?? existingLesson.lessonDate,
      startTimeLabel:
        params.lesson.startTimeLabel ?? existingLesson.startTimeLabel,
      endTimeLabel: params.lesson.endTimeLabel ?? existingLesson.endTimeLabel,
      status: params.lesson.status ?? existingLesson.status,
      paymentStatus:
        params.lesson.paymentStatus ?? existingLesson.paymentStatus,
      evaluationStatus:
        params.lesson.evaluationStatus ?? existingLesson.evaluationStatus,
      routeLabel:
        params.lesson.routeLabel !== undefined
          ? params.lesson.routeLabel
          : existingLesson.routeLabel,
      startLocation:
        params.lesson.startLocation !== undefined
          ? params.lesson.startLocation
          : existingLesson.startLocation,
      endLocation:
        params.lesson.endLocation !== undefined
          ? params.lesson.endLocation
          : existingLesson.endLocation,
      notes:
        params.lesson.notes !== undefined
          ? params.lesson.notes
          : existingLesson.notes,
      kmDriven:
        params.lesson.kmDriven !== undefined
          ? params.lesson.kmDriven
          : existingLesson.kmDriven,
      rating:
        params.lesson.rating !== undefined
          ? params.lesson.rating
          : existingLesson.rating,
      parentNotificationSent:
        params.lesson.parentNotificationSent ??
        existingLesson.parentNotificationSent,
      parentPerformanceSummary:
        params.lesson.parentPerformanceSummary !== undefined
          ? params.lesson.parentPerformanceSummary
          : existingLesson.parentPerformanceSummary,
      parentFeedbackRating:
        params.lesson.parentFeedbackRating !== undefined
          ? params.lesson.parentFeedbackRating
          : existingLesson.parentFeedbackRating,
      parentFeedbackComment:
        params.lesson.parentFeedbackComment !== undefined
          ? params.lesson.parentFeedbackComment
          : existingLesson.parentFeedbackComment,
      parentFeedbackSubmittedAt:
        params.lesson.parentFeedbackSubmittedAt !== undefined
          ? params.lesson.parentFeedbackSubmittedAt
          : existingLesson.parentFeedbackSubmittedAt,
      studentFeedbackRating:
        params.lesson.studentFeedbackRating !== undefined
          ? params.lesson.studentFeedbackRating
          : existingLesson.studentFeedbackRating,
      studentFeedbackComment:
        params.lesson.studentFeedbackComment !== undefined
          ? params.lesson.studentFeedbackComment
          : existingLesson.studentFeedbackComment,
      studentFeedbackSubmittedAt:
        params.lesson.studentFeedbackSubmittedAt !== undefined
          ? params.lesson.studentFeedbackSubmittedAt
          : existingLesson.studentFeedbackSubmittedAt
    });

    await this.prisma.$transaction([
      this.prisma.practicalLessonRecord.updateMany({
        where: {
          id: params.lessonId,
          tenantId: params.tenantId
        },
        data: {
          studentName: params.lesson.studentName,
          instructorName: params.lesson.instructorName,
          vehicleLabel: params.lesson.vehicleLabel,
          categoryCode: params.lesson.categoryCode,
          lessonDate: params.lesson.lessonDate,
          startTimeLabel: params.lesson.startTimeLabel,
          endTimeLabel: params.lesson.endTimeLabel,
          durationMinutes: params.lesson.durationMinutes,
          status: params.lesson.status,
          paymentStatus: params.lesson.paymentStatus,
          evaluationStatus: params.lesson.evaluationStatus,
          routeLabel: params.lesson.routeLabel,
          startLocation: params.lesson.startLocation,
          endLocation: params.lesson.endLocation,
          notes: params.lesson.notes,
          kmDriven: params.lesson.kmDriven,
          rating: params.lesson.rating,
          parentNotificationSent: params.lesson.parentNotificationSent,
          parentPerformanceSummary: params.lesson.parentPerformanceSummary,
          parentFeedbackRating: params.lesson.parentFeedbackRating,
          parentFeedbackComment: params.lesson.parentFeedbackComment,
          parentFeedbackSubmittedAt:
            params.lesson.parentFeedbackSubmittedAt,
          studentFeedbackRating: params.lesson.studentFeedbackRating,
          studentFeedbackComment: params.lesson.studentFeedbackComment,
          studentFeedbackSubmittedAt:
            params.lesson.studentFeedbackSubmittedAt,
          updatedBy: params.lesson.updatedBy
        }
      }),
      this.prisma.practicalLessonRevisionRecord.create({
        data: {
          tenantId: params.tenantId,
          practicalLessonId: params.lessonId,
          actorName: params.lesson.updatedBy ?? 'Система',
          changeSummary: buildRevisionSummary(params.lesson),
          previousSnapshot: buildLessonSnapshot(existingLesson),
          nextSnapshot
        }
      })
    ]);

    const updatedLesson = await this.prisma.practicalLessonRecord.findFirst({
      where: {
        id: params.lessonId,
        tenantId: params.tenantId
      },
      select: practicalLessonSelect
    });

    return updatedLesson ? mapPracticalLessonRow(updatedLesson) : null;
  }

  public async createForTenant(params: {
    tenantId: string;
    lesson: PracticalLessonCreateInput;
  }): Promise<PracticalLessonRecord | null> {
    const student = await this.prisma.student.findFirst({
      where: {
        id: params.lesson.studentId,
        tenantId: params.tenantId
      },
      select: {
        id: true
      }
    });

    if (!student) {
      return null;
    }

    await this.assertStudentScheduleSlotAvailable({
      tenantId: params.tenantId,
      studentId: params.lesson.studentId,
      instructorName: params.lesson.instructorName,
      vehicleLabel: params.lesson.vehicleLabel,
      lessonDate: params.lesson.lessonDate,
      startTimeLabel: params.lesson.startTimeLabel,
      endTimeLabel: params.lesson.endTimeLabel
    });

    const createdLesson = await this.prisma.practicalLessonRecord.create({
      data: {
        tenantId: params.tenantId,
        studentId: params.lesson.studentId,
        studentName: params.lesson.studentName,
        instructorName: params.lesson.instructorName,
        vehicleLabel: params.lesson.vehicleLabel,
        categoryCode: params.lesson.categoryCode,
        lessonDate: params.lesson.lessonDate,
        startTimeLabel: params.lesson.startTimeLabel,
        endTimeLabel: params.lesson.endTimeLabel,
        durationMinutes: params.lesson.durationMinutes,
        status: params.lesson.status,
        paymentStatus: params.lesson.paymentStatus,
        evaluationStatus: params.lesson.evaluationStatus,
        routeLabel: params.lesson.routeLabel,
        startLocation: params.lesson.startLocation,
        endLocation: params.lesson.endLocation,
        notes: params.lesson.notes,
        kmDriven: params.lesson.kmDriven,
        rating: params.lesson.rating,
        parentNotificationSent: params.lesson.parentNotificationSent,
        parentPerformanceSummary: params.lesson.parentPerformanceSummary,
        parentFeedbackRating: null,
        parentFeedbackComment: null,
        parentFeedbackSubmittedAt: null,
        studentFeedbackRating: null,
        studentFeedbackComment: null,
        studentFeedbackSubmittedAt: null,
        createdBy: params.lesson.createdBy,
        updatedBy: params.lesson.updatedBy
      },
      select: practicalLessonSelect
    });

    return mapPracticalLessonRow(createdLesson);
  }

  public async deleteByTenantAndId(params: {
    tenantId: string;
    lessonId: string;
  }): Promise<boolean> {
    const deletedRows = await this.prisma.practicalLessonRecord.deleteMany({
      where: {
        id: params.lessonId,
        tenantId: params.tenantId
      }
    });

    return deletedRows.count > 0;
  }

  private async assertStudentScheduleSlotAvailable(params: {
    tenantId: string;
    studentId: string;
    instructorName: string;
    vehicleLabel: string;
    lessonDate: Date;
    startTimeLabel: string;
    endTimeLabel: string;
    excludedLessonId?: string;
  }) {
    const requestedStartMinutes = toLessonTimeMinutes(params.startTimeLabel);
    const requestedEndMinutes = toLessonTimeMinutes(params.endTimeLabel);

    const sameDayLessons = await this.prisma.practicalLessonRecord.findMany({
      where: {
        tenantId: params.tenantId,
        lessonDate: params.lessonDate,
        status: {
          not: 'CANCELED'
        },
        ...(params.excludedLessonId
          ? {
              id: {
                not: params.excludedLessonId
              }
            }
          : {})
      },
      select: {
        studentId: true,
        instructorName: true,
        vehicleLabel: true,
        startTimeLabel: true,
        endTimeLabel: true
      }
    });

    const conflictingLesson = sameDayLessons.find((lesson) => {
      const existingStartMinutes = toLessonTimeMinutes(lesson.startTimeLabel);
      const existingEndMinutes = toLessonTimeMinutes(lesson.endTimeLabel);

      return (
        requestedStartMinutes < existingEndMinutes &&
        requestedEndMinutes > existingStartMinutes
      );
    });

    if (!conflictingLesson) {
      return;
    }

    if (conflictingLesson.studentId === params.studentId) {
      throw new PracticalLessonStudentScheduleConflictError();
    }

    if (conflictingLesson.instructorName === params.instructorName) {
      throw new PracticalLessonInstructorScheduleConflictError();
    }

    if (conflictingLesson.vehicleLabel === params.vehicleLabel) {
      throw new PracticalLessonVehicleScheduleConflictError();
    }
  }
}

function mapPracticalLessonRow(
  lesson: PracticalLessonRow
): PracticalLessonRecord {
  return {
    id: lesson.id,
    studentId: lesson.studentId,
    studentName: lesson.studentName,
    studentPhone: lesson.student.phone,
    instructorName: lesson.instructorName,
    vehicleLabel: lesson.vehicleLabel,
    categoryCode: lesson.categoryCode,
    lessonDate: lesson.lessonDate,
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
    parentFeedbackSubmittedAt: lesson.parentFeedbackSubmittedAt,
    studentFeedbackRating: lesson.studentFeedbackRating,
    studentFeedbackComment: lesson.studentFeedbackComment,
    studentFeedbackSubmittedAt: lesson.studentFeedbackSubmittedAt,
    revisionHistory: lesson.revisionRecords.map((revision) => ({
      id: revision.id,
      actorName: revision.actorName,
      changeSummary: revision.changeSummary,
      previousSnapshot:
        revision.previousSnapshot &&
        typeof revision.previousSnapshot === 'object' &&
        !Array.isArray(revision.previousSnapshot)
          ? (revision.previousSnapshot as Record<string, unknown>)
          : {},
      nextSnapshot:
        revision.nextSnapshot &&
        typeof revision.nextSnapshot === 'object' &&
        !Array.isArray(revision.nextSnapshot)
          ? (revision.nextSnapshot as Record<string, unknown>)
          : {},
      changedAt: revision.changedAt
    })),
    createdBy: lesson.createdBy,
    updatedBy: lesson.updatedBy,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt
  };
}

function buildPracticalLessonReadWhere(
  tenantId: string,
  scope?: QueryReadAccessScope
): Prisma.PracticalLessonRecordWhereInput {
  if (!scope || scope.mode === 'tenant') {
    return { tenantId };
  }

  if (scope.mode === 'instructor') {
    return {
      tenantId,
      OR: [
        {
          studentId: {
            in: scope.studentIds
          }
        },
        {
          instructorName: scope.instructorName
        }
      ]
    };
  }

  return {
    tenantId,
    studentId: {
      in: scope.studentIds
    }
  };
}

function toLessonTimeMinutes(timeLabel: string) {
  const [hours = 0, minutes = 0] = timeLabel.split(':').map(Number);

  return hours * 60 + minutes;
}

function buildLessonSnapshot(lesson: {
  studentId: string;
  instructorName: string;
  vehicleLabel: string;
  lessonDate: Date;
  startTimeLabel: string;
  endTimeLabel: string;
  status: string;
  paymentStatus: string;
  evaluationStatus: string;
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
}) {
  return {
    studentId: lesson.studentId,
    instructorName: lesson.instructorName,
    vehicleLabel: lesson.vehicleLabel,
    lessonDate: lesson.lessonDate.toISOString().slice(0, 10),
    startTimeLabel: lesson.startTimeLabel,
    endTimeLabel: lesson.endTimeLabel,
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
      lesson.studentFeedbackSubmittedAt?.toISOString() ?? null
  };
}

function buildRevisionSummary(lesson: PracticalLessonUpdateInput) {
  if (
    lesson.parentFeedbackRating !== undefined ||
    lesson.parentFeedbackComment !== undefined
  ) {
    return 'Родителска обратна връзка е обновена.';
  }

  if (
    lesson.studentFeedbackRating !== undefined ||
    lesson.studentFeedbackComment !== undefined
  ) {
    return 'Ученическа обратна връзка е обновена.';
  }

  const changedFields = [
    lesson.studentName !== undefined ? 'курсист' : null,
    lesson.instructorName !== undefined ? 'инструктор' : null,
    lesson.vehicleLabel !== undefined ? 'автомобил' : null,
    lesson.lessonDate !== undefined ||
    lesson.startTimeLabel !== undefined ||
    lesson.endTimeLabel !== undefined
      ? 'график'
      : null,
    lesson.status !== undefined ? 'статус' : null,
    lesson.paymentStatus !== undefined ? 'плащане' : null,
    lesson.evaluationStatus !== undefined ||
    lesson.rating !== undefined ||
    lesson.notes !== undefined
      ? 'оценка/бележки'
      : null,
    lesson.parentNotificationSent !== undefined ||
    lesson.parentPerformanceSummary !== undefined
      ? 'родителски отчет'
      : null
  ].filter((field): field is string => Boolean(field));

  return changedFields.length > 0
    ? `Обновени полета: ${changedFields.join(', ')}.`
    : 'Урокът е обновен.';
}

function shouldValidateScheduleSlot(
  existingLesson: {
    instructorName: string;
    vehicleLabel: string;
    lessonDate: Date;
    startTimeLabel: string;
    endTimeLabel: string;
    status: string;
  },
  lessonUpdate: PracticalLessonUpdateInput
) {
  return (
    lessonUpdate.instructorName !== undefined ||
    lessonUpdate.vehicleLabel !== undefined ||
    lessonUpdate.lessonDate !== undefined ||
    lessonUpdate.startTimeLabel !== undefined ||
    lessonUpdate.endTimeLabel !== undefined ||
    (existingLesson.status === 'CANCELED' &&
      lessonUpdate.status !== undefined &&
      lessonUpdate.status !== 'CANCELED')
  );
}
