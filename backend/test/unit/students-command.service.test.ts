import assert from 'node:assert/strict';
import test from 'node:test';

import type {
  IdentityAuthRepository,
  LoginIdentityRecord,
  AuthenticatedSessionRecord,
  CreateSessionInput,
  CreatedSessionRecord,
  UpdatePasswordInput,
  ProvisionTenantPortalIdentityInput,
  ProvisionTenantPortalIdentityResult,
} from '../../src/modules/identity/domain/repositories/identity-auth.repository';
import { StudentsCommandService } from '../../src/modules/students/application/services/students-command.service';
import type {
  DeterminatorSessionCreateInput,
  DeterminatorSessionRecord,
  StudentProfileRecord,
  StudentWriteInput,
  StudentsRepository,
} from '../../src/modules/students/domain/repositories/students.repository';

test('createStudent provisions portal access and stores membership id', async () => {
  const studentsRepository = new InMemoryStudentsRepository();
  const identityRepository = new StubIdentityAuthRepository({
    userId: 'user-1',
    membershipId: 'membership-1',
    loginIdentifier: '0888123456',
    temporaryPassword: 'temp-password-2026',
    status: 'created',
  });
  const service = new StudentsCommandService(
    studentsRepository,
    identityRepository,
  );

  const result = await service.createStudent({
    tenantId: 'tenant-1',
    student: buildStudentWriteInput(),
  });

  assert.equal(studentsRepository.lastCreatedStudent?.userMembershipId, 'membership-1');
  assert.equal(result.portalAccess?.status, 'created');
  assert.equal(result.portalAccess?.temporaryPassword, 'temp-password-2026');
  assert.equal(result.portalAccess?.loginIdentifier, '0888123456');
});

test('updateStudent provisions missing portal access for existing student', async () => {
  const studentsRepository = new InMemoryStudentsRepository();
  studentsRepository.seedStudent(buildStudentProfileRecord());

  const identityRepository = new StubIdentityAuthRepository({
    userId: 'user-2',
    membershipId: 'membership-2',
    loginIdentifier: '0888123456',
    temporaryPassword: null,
    status: 'linked_existing',
  });
  const service = new StudentsCommandService(
    studentsRepository,
    identityRepository,
  );

  const result = await service.updateStudent({
    tenantId: 'tenant-1',
    studentId: 'student-1',
    student: buildStudentWriteInput(),
  });

  assert.equal(studentsRepository.lastUpdatedStudent?.userMembershipId, 'membership-2');
  assert.equal(result?.portalAccess?.status, 'linked_existing');
  assert.equal(result?.portalAccess?.loginIdentifier, '0888123456');
});

class InMemoryStudentsRepository implements StudentsRepository {
  public lastCreatedStudent: StudentWriteInput | null = null;
  public lastUpdatedStudent: StudentWriteInput | null = null;
  private student: StudentProfileRecord | null = null;

  public seedStudent(student: StudentProfileRecord) {
    this.student = student;
  }

  public async listByTenant(): Promise<StudentProfileRecord[]> {
    return this.student ? [this.student] : [];
  }

  public async findByTenantAndId(): Promise<StudentProfileRecord | null> {
    return this.student;
  }

  public async createForTenant(params: {
    tenantId: string;
    student: StudentWriteInput;
  }): Promise<StudentProfileRecord> {
    this.lastCreatedStudent = params.student;
    this.student = buildStudentProfileRecord(params.student.userMembershipId ?? null);
    return this.student;
  }

  public async updateByTenantAndId(params: {
    tenantId: string;
    studentId: string;
    student: StudentWriteInput;
  }): Promise<StudentProfileRecord | null> {
    this.lastUpdatedStudent = params.student;

    if (!this.student) {
      return null;
    }

    this.student = buildStudentProfileRecord(params.student.userMembershipId ?? null);
    return this.student;
  }

  public async listDeterminatorSessionsByTenant(): Promise<DeterminatorSessionRecord[]> {
    return [];
  }

  public async createDeterminatorSession(_: {
    tenantId: string;
    session: DeterminatorSessionCreateInput;
  }): Promise<DeterminatorSessionRecord | null> {
    return null;
  }
}

class StubIdentityAuthRepository implements IdentityAuthRepository {
  public constructor(
    private readonly provisionResult: ProvisionTenantPortalIdentityResult,
  ) {}

  public async findLoginIdentity(): Promise<LoginIdentityRecord | null> {
    return null;
  }

  public async findAuthenticatedSessionByTokenHash(): Promise<AuthenticatedSessionRecord | null> {
    return null;
  }

  public async createSession(_: CreateSessionInput): Promise<CreatedSessionRecord> {
    throw new Error('Not implemented in test.');
  }

  public async revokeSession(): Promise<void> {}

  public async revokeUserSessions(): Promise<void> {}

  public async updateSessionActivity(): Promise<void> {}

  public async updatePassword(_: UpdatePasswordInput): Promise<void> {}

  public async provisionTenantPortalIdentity(
    _: ProvisionTenantPortalIdentityInput,
  ): Promise<ProvisionTenantPortalIdentityResult> {
    return this.provisionResult;
  }
}

function buildStudentWriteInput(): StudentWriteInput {
  return {
    firstName: 'Антоан',
    lastName: 'Тест',
    displayName: 'Антоан Тест',
    phone: '0888123456',
    email: 'antoan.test@example.com',
    nationalId: '9904041234',
    birthDate: new Date('1999-04-04T00:00:00.000Z'),
    address: 'София',
    educationLevel: 'Средно',
    parentName: 'Мария Тест',
    parentPhone: '0888999000',
    parentEmail: 'parent@example.com',
    parentContactStatus: 'ENABLED',
    status: 'ACTIVE',
    enrollment: {
      categoryCode: 'B',
      status: 'ACTIVE',
      trainingMode: 'STANDARD_PACKAGE',
      registerMode: 'ELECTRONIC',
      theoryGroupNumber: 'B-1',
      assignedInstructorName: 'Георги Петров',
      enrollmentDate: new Date('2026-04-04T00:00:00.000Z'),
      expectedArrivalDate: new Date('2026-04-14T00:00:00.000Z'),
      previousLicenseCategory: null,
      packageHours: 20,
      additionalHours: 0,
      completedHours: 2,
      failedExamAttempts: 0,
      lastPracticeAt: null,
      notes: null,
    },
  };
}

function buildStudentProfileRecord(
  userMembershipId: string | null = null,
): StudentProfileRecord {
  return {
    id: 'student-1',
    displayName: 'Антоан Тест',
    firstName: 'Антоан',
    lastName: 'Тест',
    phone: '0888123456',
    email: 'antoan.test@example.com',
    nationalId: '9904041234',
    birthDate: new Date('1999-04-04T00:00:00.000Z'),
    address: 'София',
    educationLevel: 'Средно',
    parentName: 'Мария Тест',
    parentPhone: '0888999000',
    parentEmail: 'parent@example.com',
    parentContactStatus: 'ENABLED',
    userMembershipId,
    parentMembershipId: null,
    status: 'ACTIVE',
    createdAt: new Date('2026-04-04T00:00:00.000Z'),
    updatedAt: new Date('2026-04-04T00:00:00.000Z'),
    enrollments: [
      {
        id: 'enrollment-1',
        categoryCode: 'B',
        status: 'ACTIVE',
        trainingMode: 'STANDARD_PACKAGE',
        registerMode: 'ELECTRONIC',
        theoryGroupNumber: 'B-1',
        assignedInstructorName: 'Георги Петров',
        instructorMembershipId: null,
        enrollmentDate: new Date('2026-04-04T00:00:00.000Z'),
        expectedArrivalDate: new Date('2026-04-14T00:00:00.000Z'),
        previousLicenseCategory: null,
        packageHours: 20,
        additionalHours: 0,
        completedHours: 2,
        failedExamAttempts: 0,
        lastPracticeAt: null,
        notes: null,
      },
    ],
  };
}
