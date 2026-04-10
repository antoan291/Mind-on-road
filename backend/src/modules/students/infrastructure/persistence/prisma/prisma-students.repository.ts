import {
  ParentContactStatus,
  Prisma,
  type PrismaClient,
  StudentEnrollmentStatus,
  StudentRegisterMode,
  StudentStatus,
  StudentTrainingMode
} from '@prisma/client';

import { StudentAlreadyExistsError } from '../../../domain/students.errors';
import type {
  DeterminatorSessionCreateInput,
  DeterminatorSessionRecord,
  StudentProfileRecord,
  StudentWriteInput,
  StudentsRepository
} from '../../../domain/repositories/students.repository';

export class PrismaStudentsRepository implements StudentsRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
  }): Promise<StudentProfileRecord[]> {
    return this.prisma.student.findMany({
      where: {
        tenantId: params.tenantId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: studentSelection
    });
  }

  public async findByTenantAndId(params: {
    tenantId: string;
    studentId: string;
  }): Promise<StudentProfileRecord | null> {
    return this.prisma.student.findFirst({
      where: {
        id: params.studentId,
        tenantId: params.tenantId
      },
      select: studentSelection
    });
  }

  public async createForTenant(params: {
    tenantId: string;
    student: StudentWriteInput;
  }): Promise<StudentProfileRecord> {
    try {
      const student = await this.prisma.$transaction(async (transaction) => {
        const createdStudent = await transaction.student.create({
          data: toPrismaStudentCreateData(params.tenantId, params.student),
          select: {
            id: true
          }
        });

        await transaction.studentEnrollment.create({
          data: toPrismaEnrollmentCreateData(
            params.tenantId,
            createdStudent.id,
            params.student
          )
        });

        if (params.student.initialPayment) {
          await transaction.paymentRecord.create({
            data: {
              tenantId: params.tenantId,
              studentId: createdStudent.id,
              studentName: params.student.displayName,
              paymentNumber: buildInitialPaymentNumber(),
              amount: params.student.initialPayment.amount,
              paidAmount: params.student.initialPayment.paidAmount,
              method: params.student.initialPayment.method,
              status: params.student.initialPayment.status as
                | 'PAID'
                | 'PARTIAL'
                | 'OVERDUE'
                | 'PENDING'
                | 'CANCELED',
              paidAt: params.student.initialPayment.paidAt,
              note: params.student.initialPayment.note
            }
          });
        }

        return transaction.student.findFirstOrThrow({
          where: {
            id: createdStudent.id,
            tenantId: params.tenantId
          },
          select: studentSelection
        });
      });

      return student;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new StudentAlreadyExistsError();
      }

      throw error;
    }
  }

  public async updateByTenantAndId(params: {
    tenantId: string;
    studentId: string;
    student: StudentWriteInput;
  }): Promise<StudentProfileRecord | null> {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const existingStudent = await transaction.student.findFirst({
          where: {
            id: params.studentId,
            tenantId: params.tenantId
          },
          select: {
            id: true,
            enrollments: {
              orderBy: {
                createdAt: 'desc'
              },
              select: {
                id: true
              },
              take: 1
            }
          }
        });

        if (!existingStudent) {
          return null;
        }

        await transaction.student.update({
          where: {
            id: existingStudent.id
          },
          data: toPrismaStudentUpdateData(params.student)
        });

        const currentEnrollment = existingStudent.enrollments[0] ?? null;

        if (currentEnrollment) {
          await transaction.studentEnrollment.update({
            where: {
              id: currentEnrollment.id
            },
            data: toPrismaEnrollmentUpdateData(params.student)
          });
        } else {
          await transaction.studentEnrollment.create({
            data: toPrismaEnrollmentCreateData(
              params.tenantId,
              existingStudent.id,
              params.student
            )
          });
        }

        return transaction.student.findFirstOrThrow({
          where: {
            id: existingStudent.id,
            tenantId: params.tenantId
          },
          select: studentSelection
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new StudentAlreadyExistsError();
      }

      throw error;
    }
  }

  public async deleteByTenantAndId(params: {
    tenantId: string;
    studentId: string;
  }): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.documentRecord.deleteMany({
        where: {
          tenantId: params.tenantId,
          OR: [
            { studentId: params.studentId },
            {
              ownerType: 'STUDENT',
              ownerRef: params.studentId
            }
          ]
        }
      });

      const deletedRows = await transaction.student.deleteMany({
        where: {
          id: params.studentId,
          tenantId: params.tenantId
        }
      });

      return deletedRows.count > 0;
    });
  }

  public async listDeterminatorSessionsByTenant(params: {
    tenantId: string;
    studentId?: string;
  }): Promise<DeterminatorSessionRecord[]> {
    return this.prisma.determinatorSession.findMany({
      where: {
        tenantId: params.tenantId,
        ...(params.studentId ? { studentId: params.studentId } : {})
      },
      orderBy: {
        measuredAt: 'desc'
      },
      select: determinatorSessionSelection
    });
  }

  public async createDeterminatorSession(params: {
    tenantId: string;
    session: DeterminatorSessionCreateInput;
  }): Promise<DeterminatorSessionRecord | null> {
    return this.prisma.$transaction(async (transaction) => {
      const student = await transaction.student.findFirst({
        where: {
          id: params.session.studentId,
          tenantId: params.tenantId
        },
        select: {
          id: true,
          displayName: true
        }
      });

      if (!student) {
        return null;
      }

      return transaction.determinatorSession.create({
        data: {
          tenantId: params.tenantId,
          studentId: student.id,
          studentName: student.displayName,
          registrationNumber: params.session.registrationNumber,
          autoTempoCorrectReactions:
            params.session.autoTempoCorrectReactions,
          autoTempoWrongReactions: params.session.autoTempoWrongReactions,
          autoTempoSuccessCoefficient: calculateAutoTempoSuccessCoefficient(
            params.session.autoTempoCorrectReactions
          ),
          forcedTempoCorrectReactions:
            params.session.forcedTempoCorrectReactions,
          forcedTempoDelayedReactions:
            params.session.forcedTempoDelayedReactions,
          forcedTempoWrongResults: params.session.forcedTempoWrongResults,
          forcedTempoMissedStimuli:
            params.session.forcedTempoMissedStimuli,
          forcedTempoSuccessCoefficient:
            calculateForcedTempoSuccessCoefficient(
              params.session.forcedTempoCorrectReactions,
              params.session.forcedTempoDelayedReactions,
              params.session.forcedTempoWrongResults,
              params.session.forcedTempoMissedStimuli
            ),
          overallResult:
            params.session.overallResult ??
            `Автотемп ${calculateAutoTempoSuccessCoefficient(
              params.session.autoTempoCorrectReactions
            ).toFixed(3)} · Наложен темп ${calculateForcedTempoSuccessCoefficient(
              params.session.forcedTempoCorrectReactions,
              params.session.forcedTempoDelayedReactions,
              params.session.forcedTempoWrongResults,
              params.session.forcedTempoMissedStimuli
            ).toFixed(3)}.`,
          instructorNote:
            params.session.instructorNote ??
            'Измерването е записано по показателите от детерминатора.'
        },
        select: determinatorSessionSelection
      });
    });
  }
}

function buildInitialPaymentNumber() {
  return `PAY-${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')}-${Date.now().toString().slice(-6)}`;
}

const studentSelection = {
  id: true,
  displayName: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  nationalId: true,
  birthDate: true,
  address: true,
  educationLevel: true,
  parentName: true,
  parentPhone: true,
  parentEmail: true,
  parentContactStatus: true,
  userMembershipId: true,
  parentMembershipId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  enrollments: {
    orderBy: {
      createdAt: 'desc' as const
    },
    select: {
      id: true,
      categoryCode: true,
      status: true,
      trainingMode: true,
      registerMode: true,
      theoryGroupNumber: true,
      assignedInstructorName: true,
      instructorMembershipId: true,
      enrollmentDate: true,
      expectedArrivalDate: true,
      previousLicenseCategory: true,
      packageHours: true,
      additionalHours: true,
      completedHours: true,
      failedExamAttempts: true,
      lastPracticeAt: true,
      notes: true
    }
  }
};

const determinatorSessionSelection = {
  id: true,
  studentId: true,
  studentName: true,
  registrationNumber: true,
  measuredAt: true,
  autoTempoCorrectReactions: true,
  autoTempoWrongReactions: true,
  autoTempoSuccessCoefficient: true,
  forcedTempoCorrectReactions: true,
  forcedTempoDelayedReactions: true,
  forcedTempoWrongResults: true,
  forcedTempoMissedStimuli: true,
  forcedTempoSuccessCoefficient: true,
  overallResult: true,
  instructorNote: true
};

function toPrismaStudentCreateData(tenantId: string, student: StudentWriteInput) {
  return {
    tenantId,
    ...toPrismaStudentUpdateData(student)
  };
}

function toPrismaStudentUpdateData(student: StudentWriteInput) {
  return {
    firstName: student.firstName,
    lastName: student.lastName,
    displayName: student.displayName,
    phone: student.phone,
    email: student.email,
    nationalId: student.nationalId,
    birthDate: student.birthDate,
    address: student.address,
    educationLevel: student.educationLevel,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail,
    parentContactStatus: student.parentContactStatus as ParentContactStatus,
    ...(student.userMembershipId !== undefined
      ? { userMembershipId: student.userMembershipId }
      : {}),
    status: student.status as StudentStatus
  };
}

function toPrismaEnrollmentCreateData(
  tenantId: string,
  studentId: string,
  student: StudentWriteInput
) {
  return {
    tenantId,
    studentId,
    ...toPrismaEnrollmentUpdateData(student)
  };
}

function toPrismaEnrollmentUpdateData(student: StudentWriteInput) {
  return {
    categoryCode: student.enrollment.categoryCode,
    status: student.enrollment.status as StudentEnrollmentStatus,
    trainingMode: student.enrollment.trainingMode as StudentTrainingMode,
    registerMode: student.enrollment.registerMode as StudentRegisterMode,
    theoryGroupNumber: student.enrollment.theoryGroupNumber,
    assignedInstructorName: student.enrollment.assignedInstructorName,
    enrollmentDate: student.enrollment.enrollmentDate,
    expectedArrivalDate: student.enrollment.expectedArrivalDate,
    previousLicenseCategory: student.enrollment.previousLicenseCategory,
    packageHours: student.enrollment.packageHours,
    additionalHours: student.enrollment.additionalHours,
    completedHours: student.enrollment.completedHours,
    failedExamAttempts: student.enrollment.failedExamAttempts,
    lastPracticeAt: student.enrollment.lastPracticeAt,
    notes: student.enrollment.notes
  };
}

function calculateAutoTempoSuccessCoefficient(correctReactions: number) {
  return Number((correctReactions / 2).toFixed(3));
}

function calculateForcedTempoSuccessCoefficient(
  correctReactions: number,
  delayedReactions: number,
  wrongResults: number,
  missedStimuli: number
) {
  return Number(
    (
      correctReactions +
      delayedReactions -
      wrongResults -
      missedStimuli
    ).toFixed(3)
  );
}
