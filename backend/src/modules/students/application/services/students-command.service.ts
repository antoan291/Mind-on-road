import type {
  StudentProfileRecord,
  StudentWriteInput,
  StudentsRepository
} from '../../domain/repositories/students.repository';

export class StudentsCommandService {
  public constructor(private readonly studentsRepository: StudentsRepository) {}

  public async createStudent(command: {
    tenantId: string;
    student: StudentWriteInput;
  }) {
    return toStudentDetail(
      await this.studentsRepository.createForTenant({
        tenantId: command.tenantId,
        student: command.student
      })
    );
  }

  public async updateStudent(command: {
    tenantId: string;
    studentId: string;
    student: StudentWriteInput;
  }) {
    const student = await this.studentsRepository.updateByTenantAndId({
      tenantId: command.tenantId,
      studentId: command.studentId,
      student: command.student
    });

    if (!student) {
      return null;
    }

    return toStudentDetail(student);
  }
}

export { StudentAlreadyExistsError } from '../../domain/students.errors';

function toStudentDetail(student: StudentProfileRecord) {
  const enrollment = student.enrollments[0] ?? null;
  const maxHours = enrollment
    ? enrollment.packageHours + enrollment.additionalHours
    : 0;
  const completedHours = enrollment?.completedHours ?? 0;

  return {
    id: student.id,
    name: student.displayName,
    phone: student.phone,
    email: student.email,
    nationalId: student.nationalId,
    status: student.status,
    parentContactEnabled: student.parentContactStatus === 'ENABLED',
    enrollment: enrollment
      ? {
          id: enrollment.id,
          categoryCode: enrollment.categoryCode,
          status: enrollment.status,
          trainingMode: enrollment.trainingMode,
          registerMode: enrollment.registerMode,
          instructorName: enrollment.assignedInstructorName,
          theoryGroupNumber: enrollment.theoryGroupNumber,
          enrollmentDate: enrollment.enrollmentDate.toISOString().slice(0, 10),
          expectedArrivalDate:
            enrollment.expectedArrivalDate?.toISOString().slice(0, 10) ?? null,
          previousLicenseCategory: enrollment.previousLicenseCategory,
          packageHours: enrollment.packageHours,
          additionalHours: enrollment.additionalHours,
          completedHours,
          remainingHours: Math.max(maxHours - completedHours, 0),
          maxHours,
          failedExamAttempts: enrollment.failedExamAttempts,
          lastPracticeAt: enrollment.lastPracticeAt?.toISOString() ?? null
        }
      : null,
    createdAt: student.createdAt.toISOString(),
    updatedAt: student.updatedAt.toISOString(),
    firstName: student.firstName,
    lastName: student.lastName,
    birthDate: student.birthDate?.toISOString().slice(0, 10) ?? null,
    address: student.address,
    educationLevel: student.educationLevel,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail,
    enrollments: student.enrollments.map((studentEnrollment) => {
      const enrollmentMaxHours =
        studentEnrollment.packageHours + studentEnrollment.additionalHours;

      return {
        id: studentEnrollment.id,
        categoryCode: studentEnrollment.categoryCode,
        status: studentEnrollment.status,
        trainingMode: studentEnrollment.trainingMode,
        registerMode: studentEnrollment.registerMode,
        theoryGroupNumber: studentEnrollment.theoryGroupNumber,
        assignedInstructorName: studentEnrollment.assignedInstructorName,
        enrollmentDate: studentEnrollment.enrollmentDate
          .toISOString()
          .slice(0, 10),
        expectedArrivalDate:
          studentEnrollment.expectedArrivalDate?.toISOString().slice(0, 10) ??
          null,
        previousLicenseCategory: studentEnrollment.previousLicenseCategory,
        packageHours: studentEnrollment.packageHours,
        additionalHours: studentEnrollment.additionalHours,
        completedHours: studentEnrollment.completedHours,
        remainingHours: Math.max(
          enrollmentMaxHours - studentEnrollment.completedHours,
          0
        ),
        maxHours: enrollmentMaxHours,
        failedExamAttempts: studentEnrollment.failedExamAttempts,
        lastPracticeAt:
          studentEnrollment.lastPracticeAt?.toISOString() ?? null,
        notes: studentEnrollment.notes
      };
    })
  };
}
