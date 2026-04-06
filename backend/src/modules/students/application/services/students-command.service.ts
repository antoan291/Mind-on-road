import type {
  StudentProfileRecord,
  StudentWriteInput,
  StudentsRepository
} from '../../domain/repositories/students.repository';
import type {
  IdentityAuthRepository,
  ProvisionTenantPortalIdentityResult
} from '../../../identity/domain/repositories/identity-auth.repository';

export interface StudentPortalAccessInfo {
  loginIdentifier: string;
  temporaryPassword: string | null;
  mustChangePassword: boolean;
  status:
    | 'created'
    | 'linked_existing'
    | 'already_linked'
    | 'updated_existing';
}

export interface StudentDetailView {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  nationalId: string | null;
  status: string;
  parentContactEnabled: boolean;
  enrollment: {
    id: string;
    categoryCode: string;
    status: string;
    trainingMode: string;
    registerMode: string;
    instructorName: string | null;
    theoryGroupNumber: string | null;
    enrollmentDate: string;
    expectedArrivalDate: string | null;
    previousLicenseCategory: string | null;
    packageHours: number;
    additionalHours: number;
    completedHours: number;
    remainingHours: number;
    maxHours: number;
    failedExamAttempts: number;
    lastPracticeAt: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  address: string | null;
  educationLevel: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  enrollments: Array<{
    id: string;
    categoryCode: string;
    status: string;
    trainingMode: string;
    registerMode: string;
    theoryGroupNumber: string | null;
    assignedInstructorName: string | null;
    enrollmentDate: string;
    expectedArrivalDate: string | null;
    previousLicenseCategory: string | null;
    packageHours: number;
    additionalHours: number;
    completedHours: number;
    remainingHours: number;
    maxHours: number;
    failedExamAttempts: number;
    lastPracticeAt: string | null;
    notes: string | null;
  }>;
  portalAccess: StudentPortalAccessInfo | null;
}

export class StudentsCommandService {
  public constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly identityAuthRepository: IdentityAuthRepository
  ) {}

  public async createStudent(command: {
    tenantId: string;
    student: StudentWriteInput;
  }) {
    const portalIdentity = await this.identityAuthRepository.provisionTenantPortalIdentity(
      {
        tenantId: command.tenantId,
        roleKey: 'student',
        firstName: command.student.firstName,
        lastName: command.student.lastName,
        displayName: command.student.displayName,
        phone: command.student.phone,
        email: command.student.email
      }
    );

    return toStudentDetail(
      await this.studentsRepository.createForTenant({
        tenantId: command.tenantId,
        student: {
          ...command.student,
          userMembershipId: portalIdentity.membershipId
        }
      }),
      toPortalAccessInfo(portalIdentity)
    );
  }

  public async updateStudent(command: {
    tenantId: string;
    studentId: string;
    student: StudentWriteInput;
  }) {
    const existingStudent = await this.studentsRepository.findByTenantAndId({
      tenantId: command.tenantId,
      studentId: command.studentId
    });

    if (!existingStudent) {
      return null;
    }

    const portalIdentity = await this.identityAuthRepository.provisionTenantPortalIdentity(
      {
        tenantId: command.tenantId,
        roleKey: 'student',
        firstName: command.student.firstName,
        lastName: command.student.lastName,
        displayName: command.student.displayName,
        phone: command.student.phone,
        email: command.student.email,
        existingMembershipId: existingStudent.userMembershipId
      }
    );

    const student = await this.studentsRepository.updateByTenantAndId({
      tenantId: command.tenantId,
      studentId: command.studentId,
      student: {
        ...command.student,
        userMembershipId: portalIdentity.membershipId
      }
    });

    if (!student) {
      return null;
    }

    return toStudentDetail(student, toPortalAccessInfo(portalIdentity));
  }

  public async deleteStudent(command: {
    tenantId: string;
    studentId: string;
  }) {
    return this.studentsRepository.deleteByTenantAndId(command);
  }
}

export { StudentAlreadyExistsError } from '../../domain/students.errors';

function toStudentDetail(
  student: StudentProfileRecord,
  portalAccess: StudentPortalAccessInfo | null = null
): StudentDetailView {
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
    }),
    portalAccess
  };
}

function toPortalAccessInfo(
  portalIdentity: ProvisionTenantPortalIdentityResult
): StudentPortalAccessInfo {
  return {
    loginIdentifier: portalIdentity.loginIdentifier,
    temporaryPassword: portalIdentity.temporaryPassword,
    mustChangePassword: true,
    status: portalIdentity.status
  };
}
