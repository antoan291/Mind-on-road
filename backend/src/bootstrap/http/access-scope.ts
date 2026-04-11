import type { QueryReadAccessScope } from '../../modules/shared/query/read-access-scope';
import type { AuthenticatedRequest, ReadAccessScope } from './types';
import { tenantWideAccessRoleKeys } from './constants';
import { studentsQueryService } from './services';

export async function resolveReadAccessScope(
  auth: NonNullable<AuthenticatedRequest['auth']>
): Promise<ReadAccessScope> {
  const roleKeys = new Set(auth.user.roleKeys);

  if (tenantWideAccessRoleKeys.some((roleKey) => roleKeys.has(roleKey))) {
    return {
      mode: 'tenant',
      cacheScope: 'tenant',
      studentIds: new Set<string>(),
      instructorName: null
    };
  }

  if (roleKeys.has('instructor') || roleKeys.has('simulator_instructor')) {
    const studentIds = await studentsQueryService.listAccessibleStudentIds({
      tenantId: auth.tenantId,
      actor: {
        mode: 'instructor',
        membershipId: auth.membershipId,
        instructorName: auth.user.displayName
      }
    });

    return {
      mode: 'instructor',
      cacheScope: `instructor:${auth.user.id}`,
      studentIds: new Set(studentIds),
      instructorName: auth.user.displayName
    };
  }

  if (roleKeys.has('student')) {
    const studentIds = await studentsQueryService.listAccessibleStudentIds({
      tenantId: auth.tenantId,
      actor: {
        mode: 'student',
        membershipId: auth.membershipId,
        email: auth.user.email
      }
    });
    const ownStudentId = studentIds[0] ?? 'none';

    return {
      mode: 'student',
      cacheScope: `student:${auth.user.id}:${ownStudentId}`,
      studentIds: new Set(studentIds),
      instructorName: null
    };
  }

  if (roleKeys.has('parent')) {
    const studentIds = await studentsQueryService.listAccessibleStudentIds({
      tenantId: auth.tenantId,
      actor: {
        mode: 'parent',
        membershipId: auth.membershipId,
        email: auth.user.email
      }
    });

    return {
      mode: 'parent',
      cacheScope: `parent:${auth.user.id}`,
      studentIds: new Set(studentIds),
      instructorName: null
    };
  }

  return {
    mode: 'tenant',
    cacheScope: `user:${auth.user.id}`,
    studentIds: new Set<string>(),
    instructorName: null
  };
}

export function toQueryReadAccessScope(
  accessScope: ReadAccessScope
): QueryReadAccessScope {
  if (accessScope.mode === 'tenant') {
    return { mode: 'tenant' };
  }

  if (accessScope.mode === 'instructor') {
    return {
      mode: 'instructor',
      studentIds: Array.from(accessScope.studentIds),
      instructorName: accessScope.instructorName
    };
  }

  if (accessScope.mode === 'student') {
    return {
      mode: 'student',
      studentIds: Array.from(accessScope.studentIds)
    };
  }

  return {
    mode: 'parent',
    studentIds: Array.from(accessScope.studentIds)
  };
}

export function isStudentVisibleForScope(
  student: { id: string },
  accessScope: ReadAccessScope
) {
  if (accessScope.mode === 'tenant') {
    return true;
  }

  return accessScope.studentIds.has(student.id);
}
