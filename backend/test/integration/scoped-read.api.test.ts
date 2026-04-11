import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { after, before, test } from 'node:test';

import {
  NotificationSeverity,
  ParentContactStatus,
  Prisma,
  PrismaClient,
  TenantMembershipStatus,
  UserStatus
} from '@prisma/client';

import { createHttpApp } from '../../src/bootstrap/http/create-http-app';
import { disconnectRedisClient } from '../../src/infrastructure/cache/redis/redis-cache-client';
import { hashPassword } from '../../src/modules/identity/domain/services/password-security';
import { seedPermissions, seedRolesForTenant } from '../../prisma/identity-seed-service';

const prisma = new PrismaClient();

let server: ReturnType<ReturnType<typeof createHttpApp>['listen']>;
let baseUrl = '';

before(async () => {
  await seedPermissions(prisma);

  const app = createHttpApp();
  server = app.listen(0);
  await once(server, 'listening');

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to resolve test server address.');
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  server.closeIdleConnections?.();
  server.closeAllConnections?.();
  server.close();
  await once(server, 'close');
  await disconnectRedisClient();
  await prisma.$disconnect();
});

test('student and parent read endpoints return only linked records', async () => {
  const context = await seedScopedReadContext();

  try {
    const studentSession = await login({
      tenantSlug: context.tenant.slug,
      email: context.studentUser.email,
      password: context.studentUser.password
    });
    const parentSession = await login({
      tenantSlug: context.tenant.slug,
      email: context.parentUser.email,
      password: context.parentUser.password
    });

    const studentResponses = await Promise.all([
      fetchJson<{ items: Array<{ id: string }> }>('/students', studentSession.cookie),
      fetchJson<{ items: Array<{ studentId: string }> }>('/payments', studentSession.cookie),
      fetchJson<{ items: Array<{ studentId: string }> }>('/invoices', studentSession.cookie),
      fetchJson<{ items: Array<{ id: string }> }>('/documents', studentSession.cookie),
      fetchJson<{ items: Array<{ studentId: string }> }>('/practical-lessons', studentSession.cookie),
      fetchJson<{
        items: Array<{
          id: string;
          lectures: Array<{
            attendanceRecords: Array<{ studentId: string }>;
          }>;
        }>;
      }>('/theory/groups', studentSession.cookie),
      fetchJson<{ items: Array<{ studentId: string | null }> }>('/notifications', studentSession.cookie)
    ]);

    const [
      studentsPayload,
      paymentsPayload,
      invoicesPayload,
      documentsPayload,
      lessonsPayload,
      theoryPayload,
      notificationsPayload
    ] = studentResponses;

    assert.deepEqual(
      studentsPayload.items.map((item: { id: string }) => item.id),
      [context.studentRecord.id]
    );
    assert.deepEqual(
      paymentsPayload.items.map((item: { studentId: string }) => item.studentId),
      [context.studentRecord.id]
    );
    assert.deepEqual(
      invoicesPayload.items.map((item: { studentId: string }) => item.studentId),
      [context.studentRecord.id]
    );
    assert.deepEqual(
      documentsPayload.items.map((item: { id: string }) => item.id).sort(),
      [context.studentDocumentId]
    );
    assert.deepEqual(
      lessonsPayload.items.map((item: { studentId: string }) => item.studentId),
      [context.studentRecord.id]
    );
    assert.deepEqual(
      theoryPayload.items.map((item: { id: string }) => item.id),
      [context.theoryGroupId]
    );
    assert.deepEqual(
      theoryPayload.items[0].lectures[0].attendanceRecords.map(
        (item: { studentId: string }) => item.studentId
      ),
      [context.studentRecord.id]
    );
    assert.deepEqual(
      notificationsPayload.items.map((item: { studentId: string | null }) => item.studentId),
      [context.studentRecord.id]
    );

    const parentStudentsPayload = await fetchJson<{ items: Array<{ id: string }> }>(
      '/students',
      parentSession.cookie
    );
    const parentDocumentsPayload = await fetchJson<{ items: Array<{ id: string }> }>(
      '/documents',
      parentSession.cookie
    );
    const parentLessonsPayload = await fetchJson<{ items: Array<{ studentId: string }> }>(
      '/practical-lessons',
      parentSession.cookie
    );
    const parentNotificationsPayload = await fetchJson<{
      items: Array<{ studentId: string | null }>;
    }>('/notifications', parentSession.cookie);

    assert.deepEqual(
      parentStudentsPayload.items.map((item: { id: string }) => item.id),
      [context.studentRecord.id]
    );
    assert.deepEqual(
      parentDocumentsPayload.items.map((item: { id: string }) => item.id),
      [context.studentDocumentId]
    );
    assert.deepEqual(
      parentLessonsPayload.items.map((item: { studentId: string }) => item.studentId),
      [context.studentRecord.id]
    );
    assert.deepEqual(
      parentNotificationsPayload.items.map((item: { studentId: string | null }) => item.studentId),
      [context.studentRecord.id]
    );
  } finally {
    await cleanupTenantContexts([context.tenant.id, context.foreignTenant.id]);
  }
});

test('instructor read endpoints return only assigned records from their tenant', async () => {
  const context = await seedScopedReadContext();

  try {
    const instructorSession = await login({
      tenantSlug: context.tenant.slug,
      email: context.instructorUser.email,
      password: context.instructorUser.password
    });

    const studentsPayload = await fetchJson<{ items: Array<{ id: string }> }>(
      '/students',
      instructorSession.cookie
    );
    const documentsPayload = await fetchJson<{ items: Array<{ id: string }> }>(
      '/documents',
      instructorSession.cookie
    );
    const lessonsPayload = await fetchJson<{ items: Array<{ studentId: string }> }>(
      '/practical-lessons',
      instructorSession.cookie
    );
    const theoryPayload = await fetchJson<{ items: Array<{ id: string }> }>(
      '/theory/groups',
      instructorSession.cookie
    );
    const vehiclesPayload = await fetchJson<{ items: Array<{ id: string }> }>(
      '/vehicles',
      instructorSession.cookie
    );
    const notificationsPayload = await fetchJson<{
      items: Array<{ studentId: string | null }>;
    }>('/notifications', instructorSession.cookie);

    assert.deepEqual(
      studentsPayload.items.map((item: { id: string }) => item.id),
      [context.studentRecord.id]
    );
    assert.deepEqual(
      documentsPayload.items.map((item: { id: string }) => item.id).sort(),
      [context.instructorDocumentId, context.studentDocumentId].sort()
    );
    assert.deepEqual(
      lessonsPayload.items.map((item: { studentId: string }) => item.studentId),
      [context.studentRecord.id]
    );
    assert.deepEqual(
      theoryPayload.items.map((item: { id: string }) => item.id),
      [context.theoryGroupId]
    );
    assert.deepEqual(
      vehiclesPayload.items.map((item: { id: string }) => item.id),
      [context.vehicleId]
    );
    assert.deepEqual(
      notificationsPayload.items.map((item: { studentId: string | null }) => item.studentId).sort(),
      [context.studentRecord.id, null].sort()
    );
  } finally {
    await cleanupTenantContexts([context.tenant.id, context.foreignTenant.id]);
  }
});

async function fetchJson<T>(path: string, cookie: string) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      cookie
    }
  });

  const bodyText = await response.text();
  assert.equal(response.status, 200, bodyText);
  return JSON.parse(bodyText) as T;
}

async function login(params: {
  tenantSlug: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  const bodyText = await response.text();
  assert.equal(response.status, 200, bodyText);
  const cookie = response.headers.get('set-cookie');
  assert.ok(cookie);

  return { cookie };
}

async function seedScopedReadContext() {
  const tenant = await createTenant(`scope-local-${randomUUID().slice(0, 8)}`);
  const foreignTenant = await createTenant(`scope-foreign-${randomUUID().slice(0, 8)}`);

  const instructorUser = await createTenantUser({
    tenantId: tenant.id,
    email: `instructor.${randomUUID()}@example.com`,
    password: 'InstructorRead2026!',
    firstName: 'Ivan',
    lastName: 'Instructorov',
    roleKeys: ['instructor']
  });
  const studentUser = await createTenantUser({
    tenantId: tenant.id,
    email: `student.${randomUUID()}@example.com`,
    password: 'StudentRead2026!',
    firstName: 'Student',
    lastName: 'Portalov',
    roleKeys: ['student']
  });
  const parentUser = await createTenantUser({
    tenantId: tenant.id,
    email: `parent.${randomUUID()}@example.com`,
    password: 'ParentRead2026!',
    firstName: 'Parent',
    lastName: 'Portalov',
    roleKeys: ['parent']
  });
  const foreignInstructor = await createTenantUser({
    tenantId: foreignTenant.id,
    email: `foreign.instructor.${randomUUID()}@example.com`,
    password: 'ForeignInstructor2026!',
    firstName: instructorUser.firstName,
    lastName: instructorUser.lastName,
    roleKeys: ['instructor']
  });

  const studentRecord = await createStudentRecord({
    tenantId: tenant.id,
    firstName: 'Linked',
    lastName: 'Student',
    email: studentUser.email,
    phone: `0888${randomDigits(6)}`,
    userMembershipId: studentUser.membershipId,
    parentMembershipId: parentUser.membershipId,
    parentEmail: parentUser.email,
    assignedInstructorName: instructorUser.displayName,
    instructorMembershipId: instructorUser.membershipId
  });
  const otherStudentRecord = await createStudentRecord({
    tenantId: tenant.id,
    firstName: 'Hidden',
    lastName: 'Student',
    email: `hidden.${randomUUID()}@example.com`,
    phone: `0899${randomDigits(6)}`,
    userMembershipId: null,
    parentMembershipId: null,
    parentEmail: null,
    assignedInstructorName: 'Other Instructor',
    instructorMembershipId: null
  });
  await createStudentRecord({
    tenantId: foreignTenant.id,
    firstName: 'Foreign',
    lastName: 'Student',
    email: `foreign.student.${randomUUID()}@example.com`,
    phone: `0877${randomDigits(6)}`,
    userMembershipId: null,
    parentMembershipId: null,
    parentEmail: null,
    assignedInstructorName: foreignInstructor.displayName,
    instructorMembershipId: foreignInstructor.membershipId
  });

  await prisma.paymentRecord.createMany({
    data: [
      buildPaymentRecord(tenant.id, studentRecord.id, studentRecord.displayName),
      buildPaymentRecord(tenant.id, otherStudentRecord.id, otherStudentRecord.displayName)
    ]
  });

  await prisma.invoiceRecord.createMany({
    data: [
      buildInvoiceRecord(tenant.id, studentRecord.id, studentRecord.displayName),
      buildInvoiceRecord(tenant.id, otherStudentRecord.id, otherStudentRecord.displayName)
    ]
  });

  const studentDocument = await prisma.documentRecord.create({
    data: {
      tenantId: tenant.id,
      studentId: studentRecord.id,
      name: 'Student contract',
      ownerType: 'STUDENT',
      ownerName: studentRecord.displayName,
      ownerRef: studentRecord.id,
      category: 'contract',
      documentNo: `DOC-${randomDigits(4)}`,
      issueDate: new Date('2026-04-10T00:00:00.000Z'),
      expiryDate: null,
      status: 'VALID',
      fileUrl: null,
      notes: null
    }
  });
  await prisma.documentRecord.create({
    data: {
      tenantId: tenant.id,
      studentId: otherStudentRecord.id,
      name: 'Other student document',
      ownerType: 'STUDENT',
      ownerName: otherStudentRecord.displayName,
      ownerRef: otherStudentRecord.id,
      category: 'contract',
      documentNo: `DOC-${randomDigits(4)}`,
      issueDate: new Date('2026-04-10T00:00:00.000Z'),
      expiryDate: null,
      status: 'VALID',
      fileUrl: null,
      notes: null
    }
  });
  const instructorDocument = await prisma.documentRecord.create({
    data: {
      tenantId: tenant.id,
      studentId: null,
      name: 'Instructor license',
      ownerType: 'INSTRUCTOR',
      ownerName: instructorUser.displayName,
      ownerRef: instructorUser.membershipId,
      category: 'license',
      documentNo: `LIC-${randomDigits(4)}`,
      issueDate: new Date('2026-04-10T00:00:00.000Z'),
      expiryDate: new Date('2026-04-20T00:00:00.000Z'),
      status: 'EXPIRING_SOON',
      fileUrl: null,
      notes: null
    }
  });

  const lesson = await prisma.practicalLessonRecord.create({
    data: buildPracticalLessonRecord({
      tenantId: tenant.id,
      studentId: studentRecord.id,
      studentName: studentRecord.displayName,
      instructorName: instructorUser.displayName,
      vehicleLabel: 'Seat Leon'
    })
  });
  await prisma.practicalLessonRecord.create({
    data: buildPracticalLessonRecord({
      tenantId: tenant.id,
      studentId: otherStudentRecord.id,
      studentName: otherStudentRecord.displayName,
      instructorName: 'Other Instructor',
      vehicleLabel: 'VW Golf'
    })
  });

  const theoryGroup = await prisma.theoryGroupRecord.create({
    data: {
      tenantId: tenant.id,
      name: 'Theory Local',
      categoryCode: 'B',
      scheduleLabel: 'Mon/Wed',
      instructorName: instructorUser.displayName,
      daiCode: `TG-${randomDigits(4)}`,
      startDate: new Date('2026-04-01T00:00:00.000Z'),
      endDate: new Date('2026-04-30T00:00:00.000Z'),
      totalLectures: 1,
      completedLectures: 1,
      activeStudents: 1,
      studentsWithAbsences: 0,
      studentsNeedingRecovery: 0,
      averageAttendance: 100,
      status: 'ACTIVE'
    }
  });
  const lecture = await prisma.theoryLectureRecord.create({
    data: {
      tenantId: tenant.id,
      theoryGroupId: theoryGroup.id,
      lectureNumber: 1,
      topic: 'Road signs',
      lectureDate: new Date('2026-04-15T00:00:00.000Z'),
      startTimeLabel: '18:00',
      endTimeLabel: '19:30',
      durationMinutes: 90,
      location: 'Hall A',
      status: 'COMPLETED',
      presentCount: 1,
      absentCount: 1
    }
  });
  await prisma.theoryLectureAttendanceRecord.createMany({
    data: [
      {
        tenantId: tenant.id,
        theoryGroupId: theoryGroup.id,
        theoryLectureId: lecture.id,
        studentId: studentRecord.id,
        status: 'PRESENT',
        viberSent: false,
        markedBy: instructorUser.displayName
      },
      {
        tenantId: tenant.id,
        theoryGroupId: theoryGroup.id,
        theoryLectureId: lecture.id,
        studentId: otherStudentRecord.id,
        status: 'ABSENT',
        viberSent: false,
        markedBy: instructorUser.displayName
      }
    ]
  });

  const vehicle = await prisma.vehicleRecord.create({
    data: {
      tenantId: tenant.id,
      vehicleLabel: 'Seat Leon',
      instructorName: instructorUser.displayName,
      categoryCode: 'B',
      status: 'ACTIVE',
      nextInspection: new Date('2026-05-01T00:00:00.000Z'),
      activeLessons: 1,
      operationalNote: ''
    }
  });
  await prisma.vehicleRecord.create({
    data: {
      tenantId: tenant.id,
      vehicleLabel: 'VW Golf',
      instructorName: 'Other Instructor',
      categoryCode: 'B',
      status: 'ACTIVE',
      nextInspection: new Date('2026-05-01T00:00:00.000Z'),
      activeLessons: 0,
      operationalNote: ''
    }
  });

  await prisma.notificationRecord.createMany({
    data: [
      {
        tenantId: tenant.id,
        studentId: studentRecord.id,
        practicalLessonId: lesson.id,
        signalKey: `student-signal-${randomUUID()}`,
        kind: 'PAYMENT_REMINDER',
        severity: 'WARNING',
        deliveryStatus: 'PENDING',
        channel: 'SYSTEM',
        title: 'Student scoped notification',
        message: 'Visible only to linked student and parent.',
        audienceLabel: studentRecord.displayName,
        actionLabel: null,
        actionTarget: null,
        eventTime: new Date('2026-04-15T10:00:00.000Z'),
        metadata: toJson({
          studentId: studentRecord.id
        })
      },
      {
        tenantId: tenant.id,
        studentId: otherStudentRecord.id,
        practicalLessonId: null,
        signalKey: `other-student-signal-${randomUUID()}`,
        kind: 'PAYMENT_REMINDER',
        severity: 'WARNING',
        deliveryStatus: 'PENDING',
        channel: 'SYSTEM',
        title: 'Other student notification',
        message: 'Should stay hidden.',
        audienceLabel: otherStudentRecord.displayName,
        actionLabel: null,
        actionTarget: null,
        eventTime: new Date('2026-04-15T11:00:00.000Z'),
        metadata: toJson({
          studentId: otherStudentRecord.id
        })
      },
      {
        tenantId: tenant.id,
        studentId: null,
        practicalLessonId: null,
        signalKey: `instructor-doc-signal-${randomUUID()}`,
        kind: 'INSTRUCTOR_DOCUMENT_EXPIRY',
        severity: NotificationSeverity.WARNING,
        deliveryStatus: 'PENDING',
        channel: 'SYSTEM',
        title: 'Instructor doc warning',
        message: 'Visible only to the matched instructor and tenant-wide roles.',
        audienceLabel: instructorUser.displayName,
        actionLabel: null,
        actionTarget: null,
        eventTime: new Date('2026-04-15T12:00:00.000Z'),
        metadata: toJson({
          ownerType: 'INSTRUCTOR',
          ownerName: instructorUser.displayName
        })
      }
    ]
  });

  return {
    tenant,
    foreignTenant,
    instructorUser,
    studentUser,
    parentUser,
    studentRecord,
    studentDocumentId: studentDocument.id,
    instructorDocumentId: instructorDocument.id,
    theoryGroupId: theoryGroup.id,
    vehicleId: vehicle.id
  };
}

async function createTenant(slug: string) {
  const tenant = await prisma.tenant.create({
    data: {
      name: `Tenant ${slug}`,
      slug
    }
  });

  await seedRolesForTenant(prisma, tenant.id);
  return tenant;
}

async function createTenantUser(params: {
  tenantId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleKeys: string[];
}) {
  const user = await prisma.user.create({
    data: {
      email: params.email,
      passwordHash: hashPassword(params.password),
      firstName: params.firstName,
      lastName: params.lastName,
      displayName: `${params.firstName} ${params.lastName}`,
      phone: `0888${randomDigits(6)}`,
      status: UserStatus.ACTIVE,
      mustChangePassword: false
    }
  });

  const membership = await prisma.tenantMembership.create({
    data: {
      tenantId: params.tenantId,
      userId: user.id,
      status: TenantMembershipStatus.ACTIVE,
      joinedAt: new Date()
    }
  });

  const roles = await prisma.role.findMany({
    where: {
      tenantId: params.tenantId,
      key: {
        in: params.roleKeys
      }
    },
    select: {
      id: true
    }
  });

  await prisma.membershipRole.createMany({
    data: roles.map((role) => ({
      membershipId: membership.id,
      roleId: role.id
    }))
  });

  return {
    userId: user.id,
    membershipId: membership.id,
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    displayName: `${params.firstName} ${params.lastName}`
  };
}

async function createStudentRecord(params: {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  userMembershipId: string | null;
  parentMembershipId: string | null;
  parentEmail: string | null;
  assignedInstructorName: string | null;
  instructorMembershipId: string | null;
}) {
  const student = await prisma.student.create({
    data: {
      tenantId: params.tenantId,
      firstName: params.firstName,
      lastName: params.lastName,
      displayName: `${params.firstName} ${params.lastName}`,
      phone: params.phone,
      email: params.email,
      nationalId: `99${randomDigits(8)}`,
      birthDate: new Date('1999-04-04T00:00:00.000Z'),
      address: 'Sofia',
      educationLevel: 'Secondary',
      parentName: params.parentMembershipId ? 'Linked Parent' : null,
      parentPhone: params.parentMembershipId ? `0899${randomDigits(6)}` : null,
      parentEmail: params.parentEmail,
      parentContactStatus: params.parentMembershipId
        ? ParentContactStatus.ENABLED
        : ParentContactStatus.DISABLED,
      userMembershipId: params.userMembershipId,
      parentMembershipId: params.parentMembershipId,
      status: 'ACTIVE'
    }
  });

  await prisma.studentEnrollment.create({
    data: {
      tenantId: params.tenantId,
      studentId: student.id,
      categoryCode: 'B',
      status: 'ACTIVE',
      trainingMode: 'STANDARD_PACKAGE',
      registerMode: 'ELECTRONIC',
      theoryGroupNumber: 'B-1',
      assignedInstructorName: params.assignedInstructorName,
      instructorMembershipId: params.instructorMembershipId,
      enrollmentDate: new Date('2026-04-01T00:00:00.000Z'),
      expectedArrivalDate: null,
      previousLicenseCategory: null,
      packageHours: 20,
      additionalHours: 0,
      completedHours: 4,
      failedExamAttempts: 0,
      lastPracticeAt: new Date('2026-04-10T00:00:00.000Z'),
      notes: null
    }
  });

  return student;
}

function buildPaymentRecord(
  tenantId: string,
  studentId: string,
  studentName: string
) {
  return {
    tenantId,
    studentId,
    studentName,
    paymentNumber: `PAY-${randomDigits(6)}`,
    amount: 150,
    paidAmount: 150,
    method: 'Cash',
    status: 'PAID' as const,
    paidAt: new Date('2026-04-11T00:00:00.000Z'),
    note: null
  };
}

function buildInvoiceRecord(
  tenantId: string,
  studentId: string,
  recipientName: string
) {
  return {
    tenantId,
    studentId,
    invoiceNumber: `INV-${randomDigits(6)}`,
    invoiceDate: new Date('2026-04-11T00:00:00.000Z'),
    recipientName,
    categoryCode: 'B',
    invoiceReason: 'Training package',
    packageType: 'Standard',
    totalAmount: 180,
    currency: 'EUR',
    status: 'ISSUED' as const,
    paymentLinkStatus: 'LINKED' as const,
    paymentNumber: null,
    paymentStatus: null,
    createdBy: 'System',
    createdDate: new Date('2026-04-11T00:00:00.000Z'),
    lastUpdatedBy: 'System',
    notes: null,
    issuedDate: new Date('2026-04-11T00:00:00.000Z'),
    dueDate: null,
    vatAmount: 30,
    subtotalAmount: 150,
    wasCorrected: false,
    correctionReason: null
  };
}

function buildPracticalLessonRecord(params: {
  tenantId: string;
  studentId: string;
  studentName: string;
  instructorName: string;
  vehicleLabel: string;
}) {
  return {
    tenantId: params.tenantId,
    studentId: params.studentId,
    studentName: params.studentName,
    instructorName: params.instructorName,
    vehicleLabel: params.vehicleLabel,
    categoryCode: 'B',
    lessonDate: new Date('2026-04-15T00:00:00.000Z'),
    startTimeLabel: '10:00',
    endTimeLabel: '11:30',
    durationMinutes: 90,
    status: 'COMPLETED' as const,
    paymentStatus: 'PAID' as const,
    evaluationStatus: 'COMPLETED' as const,
    routeLabel: null,
    startLocation: null,
    endLocation: null,
    notes: null,
    kmDriven: null,
    rating: null,
    parentNotificationSent: false,
    parentPerformanceSummary: null,
    parentFeedbackRating: null,
    parentFeedbackComment: null,
    parentFeedbackSubmittedAt: null,
    studentFeedbackRating: null,
    studentFeedbackComment: null,
    studentFeedbackSubmittedAt: null,
    createdBy: 'System',
    updatedBy: 'System'
  };
}

function randomDigits(length: number) {
  return randomUUID().replace(/[^0-9]/g, '').padEnd(length, '0').slice(0, length);
}

function toJson(value: Record<string, unknown>) {
  return value as Prisma.InputJsonValue;
}

async function cleanupTenantContexts(tenantIds: string[]) {
  const memberships = await prisma.tenantMembership.findMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    },
    select: {
      id: true,
      userId: true
    }
  });

  const membershipIds = memberships.map((membership) => membership.id);
  const userIds = Array.from(new Set(memberships.map((membership) => membership.userId)));

  if (membershipIds.length > 0) {
    await prisma.userSession.deleteMany({
      where: {
        tenantMembershipId: {
          in: membershipIds
        }
      }
    });
    await prisma.membershipRole.deleteMany({
      where: {
        membershipId: {
          in: membershipIds
        }
      }
    });
  }

  await prisma.auditLog.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.notificationRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.practicalLessonRevisionRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.practicalLessonRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.theoryLectureAttendanceRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.theoryLectureRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.theoryGroupRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.documentRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.invoiceRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.paymentRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.vehicleRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.determinatorSession.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.studentEnrollment.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.student.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.tenantMembership.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.role.deleteMany({
    where: {
      tenantId: {
        in: tenantIds
      }
    }
  });
  await prisma.tenant.deleteMany({
    where: {
      id: {
        in: tenantIds
      }
    }
  });

  if (userIds.length > 0) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    });
  }
}
