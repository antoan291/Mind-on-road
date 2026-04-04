import type {
  ExamApplicationStatus as PrismaExamApplicationStatus,
  Prisma,
  PrismaClient
} from '@prisma/client';

import type {
  ExamApplicationRecord,
  ExamApplicationsRepository,
  ExamApplicationStatus
} from '../../../domain/repositories/exam-applications.repository';

const examApplicationSelect = {
  id: true,
  studentId: true,
  studentName: true,
  categoryCode: true,
  applicationNumber: true,
  status: true,
  examOfficeName: true,
  preferredExamDate: true,
  requiredDataSnapshot: true,
  missingRequirements: true,
  statusNote: true,
  submittedAt: true,
  decidedAt: true,
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
    }
  }
} as const;

const FINAL_STATUSES: PrismaExamApplicationStatus[] = ['APPROVED', 'REJECTED'];

export class PrismaExamApplicationsRepository
  implements ExamApplicationsRepository
{
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
  }): Promise<ExamApplicationRecord[]> {
    const applications = await this.prisma.examApplicationRecord.findMany({
      where: {
        tenantId: params.tenantId
      },
      orderBy: [
        {
          createdAt: 'desc'
        }
      ],
      select: examApplicationSelect
    });

    return applications.map((application) =>
      mapApplicationRecord(application)
    );
  }

  public async findByTenantAndId(params: {
    tenantId: string;
    applicationId: string;
  }): Promise<ExamApplicationRecord | null> {
    const application = await this.prisma.examApplicationRecord.findFirst({
      where: {
        id: params.applicationId,
        tenantId: params.tenantId
      },
      select: examApplicationSelect
    });

    return application ? mapApplicationRecord(application) : null;
  }

  public async generateForStudent(params: {
    tenantId: string;
    studentId: string;
    actorName: string;
  }): Promise<ExamApplicationRecord | null> {
    const student = await this.prisma.student.findFirst({
      where: {
        id: params.studentId,
        tenantId: params.tenantId
      },
      select: {
        id: true,
        displayName: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        nationalId: true,
        address: true,
        documentRecords: {
          where: {
            ownerType: 'STUDENT'
          },
          orderBy: {
            updatedAt: 'desc'
          },
          select: {
            name: true,
            status: true,
            documentNo: true,
            expiryDate: true
          }
        },
        enrollments: {
          orderBy: {
            updatedAt: 'desc'
          },
          select: {
            categoryCode: true,
            status: true,
            theoryGroupNumber: true,
            assignedInstructorName: true,
            enrollmentDate: true,
            failedExamAttempts: true,
            packageHours: true,
            additionalHours: true,
            completedHours: true
          }
        }
      }
    });

    const enrollment = student?.enrollments[0] ?? null;

    if (!student || !enrollment) {
      return null;
    }

    const requiredDataSnapshot = {
      studentName: student.displayName,
      phone: student.phone,
      email: student.email,
      nationalId: student.nationalId,
      address: student.address,
      categoryCode: enrollment.categoryCode,
      theoryGroupNumber: enrollment.theoryGroupNumber,
      assignedInstructorName: enrollment.assignedInstructorName,
      enrollmentDate: enrollment.enrollmentDate.toISOString().slice(0, 10),
      failedExamAttempts: enrollment.failedExamAttempts,
      packageHours: enrollment.packageHours,
      additionalHours: enrollment.additionalHours,
      completedHours: enrollment.completedHours,
      documents: student.documentRecords.map((document) => ({
        name: document.name,
        status: document.status,
        documentNo: document.documentNo,
        expiryDate: document.expiryDate
          ? document.expiryDate.toISOString().slice(0, 10)
          : null
      }))
    };
    const missingRequirements = collectMissingRequirements(
      student,
      enrollment,
      student.documentRecords
    );
    const nextStatus: PrismaExamApplicationStatus =
      missingRequirements.length > 0 ? 'DRAFT' : 'READY_FOR_REVIEW';
    const existingApplication =
      await this.prisma.examApplicationRecord.findFirst({
        where: {
          tenantId: params.tenantId,
          studentId: student.id,
          categoryCode: enrollment.categoryCode,
          status: {
            notIn: FINAL_STATUSES
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: examApplicationSelect
      });

    if (!existingApplication) {
      const createdApplication =
        await this.prisma.examApplicationRecord.create({
          data: {
            tenantId: params.tenantId,
            studentId: student.id,
            studentName: student.displayName,
            categoryCode: enrollment.categoryCode,
            applicationNumber: buildApplicationNumber(),
            status: nextStatus,
            examOfficeName: 'ДАИ София',
            preferredExamDate: null,
            requiredDataSnapshot,
            missingRequirements,
            statusNote:
              missingRequirements.length > 0
                ? 'Автоматично създадена чернова с липсващи данни.'
                : 'Автоматично генерирано заявление, готово за преглед.',
            revisionRecords: {
              create: {
                tenantId: params.tenantId,
                actorName: params.actorName,
                changeSummary: 'Автоматично генериране на заявление за изпит',
                previousSnapshot: {},
                nextSnapshot: {
                  status: nextStatus,
                  requiredDataSnapshot,
                  missingRequirements
                }
              }
            }
          },
          select: examApplicationSelect
        });

      return mapApplicationRecord(createdApplication);
    }

    const updatedApplication =
      await this.prisma.examApplicationRecord.update({
        where: {
          id: existingApplication.id
        },
        data: {
          studentName: student.displayName,
          categoryCode: enrollment.categoryCode,
          status: nextStatus,
          requiredDataSnapshot,
          missingRequirements,
          statusNote:
            missingRequirements.length > 0
              ? 'Заявлението е върнато в чернова заради липсващи данни.'
              : 'Заявлението е обновено и готово за преглед.',
          submittedAt: nextStatus === 'READY_FOR_REVIEW' ? null : existingApplication.submittedAt,
          decidedAt: null,
          revisionRecords: {
            create: {
              tenantId: params.tenantId,
              actorName: params.actorName,
              changeSummary: 'Автоматично обновяване на данните за заявление',
              previousSnapshot: toJsonInput(
                toRevisionSnapshot(mapApplicationRecord(existingApplication))
              ),
              nextSnapshot: toJsonInput({
                status: nextStatus,
                requiredDataSnapshot,
                missingRequirements
              })
            }
          }
        },
        select: examApplicationSelect
      });

    return mapApplicationRecord(updatedApplication);
  }

  public async updateStatusByTenantAndId(params: {
    tenantId: string;
    applicationId: string;
    status: ExamApplicationStatus;
    statusNote: string | null;
    actorName: string;
  }): Promise<ExamApplicationRecord | null> {
    const currentApplication = await this.findByTenantAndId({
      tenantId: params.tenantId,
      applicationId: params.applicationId
    });

    if (!currentApplication) {
      return null;
    }

    const updatedApplication =
      await this.prisma.examApplicationRecord.update({
        where: {
          id: currentApplication.id
        },
        data: {
          status: params.status,
          statusNote: params.statusNote,
          submittedAt:
            params.status === 'SENT'
              ? new Date()
              : currentApplication.submittedAt,
          decidedAt:
            params.status === 'APPROVED' || params.status === 'REJECTED'
              ? new Date()
              : currentApplication.decidedAt,
          revisionRecords: {
            create: {
              tenantId: params.tenantId,
              actorName: params.actorName,
              changeSummary: `Промяна на статус към ${params.status}`,
              previousSnapshot: toJsonInput(
                toRevisionSnapshot(currentApplication)
              ),
              nextSnapshot: toJsonInput({
                status: params.status,
                statusNote: params.statusNote
              })
            }
          }
        },
        select: examApplicationSelect
      });

    return mapApplicationRecord(updatedApplication);
  }
}

function mapApplicationRecord(
  application: Prisma.ExamApplicationRecordGetPayload<{
    select: typeof examApplicationSelect;
  }>
): ExamApplicationRecord {
  return {
    id: application.id,
    studentId: application.studentId,
    studentName: application.studentName,
    categoryCode: application.categoryCode,
    applicationNumber: application.applicationNumber,
    status: application.status,
    examOfficeName: application.examOfficeName,
    preferredExamDate: application.preferredExamDate,
    requiredDataSnapshot: normalizeJsonObject(
      application.requiredDataSnapshot
    ),
    missingRequirements: application.missingRequirements,
    statusNote: application.statusNote,
    submittedAt: application.submittedAt,
    decidedAt: application.decidedAt,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    revisionRecords: application.revisionRecords.map((revision) => ({
      id: revision.id,
      actorName: revision.actorName,
      changeSummary: revision.changeSummary,
      previousSnapshot: normalizeJsonObject(revision.previousSnapshot),
      nextSnapshot: normalizeJsonObject(revision.nextSnapshot),
      changedAt: revision.changedAt
    }))
  };
}

function collectMissingRequirements(
  student: {
    displayName: string;
    phone: string;
    email: string | null;
    nationalId: string | null;
    address: string | null;
  },
  enrollment: {
    categoryCode: string;
    theoryGroupNumber: string | null;
    assignedInstructorName: string | null;
  },
  documents: Array<{
    status: string;
    documentNo: string | null;
    expiryDate: Date | null;
  }>
) {
  const missingRequirements: string[] = [];

  if (!student.displayName.trim()) missingRequirements.push('Име на курсист');
  if (!student.phone.trim()) missingRequirements.push('Телефон');
  if (!student.email?.trim()) missingRequirements.push('Имейл');
  if (!student.nationalId?.trim()) missingRequirements.push('ЕГН/ЛНЧ');
  if (!student.address?.trim()) missingRequirements.push('Адрес');
  if (!enrollment.categoryCode.trim()) missingRequirements.push('Категория');
  if (!enrollment.theoryGroupNumber?.trim()) {
    missingRequirements.push('Теоретична група');
  }
  if (!enrollment.assignedInstructorName?.trim()) {
    missingRequirements.push('Назначен инструктор');
  }

  const hasUsableIdentityDocument = documents.some(
    (document) =>
      document.status !== 'MISSING' &&
      Boolean(document.documentNo?.trim()) &&
      (!document.expiryDate || document.expiryDate >= new Date())
  );

  if (!hasUsableIdentityDocument) {
    missingRequirements.push('Валиден документ за самоличност');
  }

  return missingRequirements;
}

function buildApplicationNumber() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `EXAM-${timestamp}-${randomSuffix}`;
}

function toRevisionSnapshot(application: ExamApplicationRecord) {
  return {
    status: application.status,
    statusNote: application.statusNote,
    requiredDataSnapshot: application.requiredDataSnapshot,
    missingRequirements: application.missingRequirements,
    submittedAt: application.submittedAt?.toISOString() ?? null,
    decidedAt: application.decidedAt?.toISOString() ?? null
  };
}

function normalizeJsonObject(value: Prisma.JsonValue): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toJsonInput(value: Record<string, unknown>): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
