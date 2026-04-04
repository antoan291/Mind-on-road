import type {
  StudentProfileRecord,
  StudentsRepository
} from '../../domain/repositories/students.repository';

export class StudentsQueryService {
  public constructor(private readonly studentsRepository: StudentsRepository) {}

  public async listStudents(params: { tenantId: string }) {
    const students = await this.studentsRepository.listByTenant({
      tenantId: params.tenantId
    });

    return students.map((student) => toStudentSummary(student));
  }

  public async getStudentById(params: {
    tenantId: string;
    studentId: string;
  }) {
    const student = await this.studentsRepository.findByTenantAndId(params);

    if (!student) {
      return null;
    }

    return toStudentDetail(student);
  }
}

function toStudentSummary(student: StudentProfileRecord) {
  const enrollment = student.enrollments[0] ?? null;
  const maxHours = enrollment
    ? enrollment.packageHours + enrollment.additionalHours
    : 0;
  const completedHours = enrollment?.completedHours ?? 0;
  const remainingHours = Math.max(maxHours - completedHours, 0);

  return {
    id: student.id,
    name: student.displayName,
    phone: student.phone,
    email: student.email,
    nationalId: student.nationalId,
    status: student.status,
    parentName: student.parentName,
    parentEmail: student.parentEmail,
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
          remainingHours,
          maxHours,
          failedExamAttempts: enrollment.failedExamAttempts,
          lastPracticeAt: enrollment.lastPracticeAt?.toISOString() ?? null
        }
      : null,
    createdAt: student.createdAt.toISOString(),
    updatedAt: student.updatedAt.toISOString()
  };
}

function toStudentDetail(student: StudentProfileRecord) {
  return {
    ...toStudentSummary(student),
    firstName: student.firstName,
    lastName: student.lastName,
    birthDate: student.birthDate?.toISOString().slice(0, 10) ?? null,
    address: student.address,
    educationLevel: student.educationLevel,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail,
    enrollments: student.enrollments.map((enrollment) => {
      const maxHours = enrollment.packageHours + enrollment.additionalHours;
      const completedHours = enrollment.completedHours;

      return {
        id: enrollment.id,
        categoryCode: enrollment.categoryCode,
        status: enrollment.status,
        trainingMode: enrollment.trainingMode,
        registerMode: enrollment.registerMode,
        theoryGroupNumber: enrollment.theoryGroupNumber,
        assignedInstructorName: enrollment.assignedInstructorName,
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
        lastPracticeAt: enrollment.lastPracticeAt?.toISOString() ?? null,
        notes: enrollment.notes
      };
    })
  };
}
