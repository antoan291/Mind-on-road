export interface StudentEnrollmentRecord {
  id: string;
  categoryCode: string;
  status: string;
  trainingMode: string;
  registerMode: string;
  theoryGroupNumber: string | null;
  assignedInstructorName: string | null;
  instructorMembershipId: string | null;
  enrollmentDate: Date;
  expectedArrivalDate: Date | null;
  previousLicenseCategory: string | null;
  packageHours: number;
  additionalHours: number;
  completedHours: number;
  failedExamAttempts: number;
  lastPracticeAt: Date | null;
  notes: string | null;
}

export interface StudentProfileRecord {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  nationalId: string | null;
  birthDate: Date | null;
  address: string | null;
  educationLevel: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  parentContactStatus: string;
  userMembershipId: string | null;
  parentMembershipId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  enrollments: StudentEnrollmentRecord[];
}

export interface DeterminatorSessionRecord {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  measuredAt: Date;
  autoTempoCorrectReactions: number;
  autoTempoWrongReactions: number;
  autoTempoSuccessCoefficient: number;
  forcedTempoCorrectReactions: number;
  forcedTempoDelayedReactions: number;
  forcedTempoWrongResults: number;
  forcedTempoMissedStimuli: number;
  forcedTempoSuccessCoefficient: number;
  overallResult: string;
  instructorNote: string;
}

export interface DeterminatorSessionCreateInput {
  studentId: string;
  registrationNumber: string;
  autoTempoCorrectReactions: number;
  autoTempoWrongReactions: number;
  forcedTempoCorrectReactions: number;
  forcedTempoDelayedReactions: number;
  forcedTempoWrongResults: number;
  forcedTempoMissedStimuli: number;
  overallResult: string | null;
  instructorNote: string | null;
}

export interface StudentEnrollmentWriteInput {
  categoryCode: string;
  status: string;
  trainingMode: string;
  registerMode: string;
  theoryGroupNumber: string | null;
  assignedInstructorName: string | null;
  enrollmentDate: Date;
  expectedArrivalDate: Date | null;
  previousLicenseCategory: string | null;
  packageHours: number;
  additionalHours: number;
  completedHours: number;
  failedExamAttempts: number;
  lastPracticeAt: Date | null;
  notes: string | null;
}

export interface StudentWriteInput {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  email: string | null;
  nationalId: string | null;
  birthDate: Date | null;
  address: string | null;
  educationLevel: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  parentContactStatus: string;
  userMembershipId?: string | null;
  status: string;
  enrollment: StudentEnrollmentWriteInput;
  initialPayment?: {
    amount: number;
    paidAmount: number;
    method: string;
    status: string;
    paidAt: Date;
    note: string | null;
  } | null;
}

export interface StudentsRepository {
  listByTenant(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }): Promise<StudentProfileRecord[]>;
  listAccessibleStudentIds(params: {
    tenantId: string;
    actor:
      | {
          mode: 'instructor';
          membershipId: string;
          instructorName: string;
        }
      | {
          mode: 'student';
          membershipId: string;
          email: string;
        }
      | {
          mode: 'parent';
          membershipId: string;
          email: string;
        };
  }): Promise<string[]>;
  findByTenantAndId(params: {
    tenantId: string;
    studentId: string;
    scope?: QueryReadAccessScope;
  }): Promise<StudentProfileRecord | null>;
  createForTenant(params: {
    tenantId: string;
    student: StudentWriteInput;
  }): Promise<StudentProfileRecord>;
  updateByTenantAndId(params: {
    tenantId: string;
    studentId: string;
    student: StudentWriteInput;
  }): Promise<StudentProfileRecord | null>;
  deleteByTenantAndId(params: {
    tenantId: string;
    studentId: string;
  }): Promise<boolean>;
  listDeterminatorSessionsByTenant(params: {
    tenantId: string;
    studentId?: string;
    scope?: QueryReadAccessScope;
  }): Promise<DeterminatorSessionRecord[]>;
  createDeterminatorSession(params: {
    tenantId: string;
    session: DeterminatorSessionCreateInput;
  }): Promise<DeterminatorSessionRecord | null>;
}
import type { QueryReadAccessScope } from '../../../shared/query/read-access-scope';
