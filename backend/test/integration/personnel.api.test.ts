import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { access, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { after, before, test } from 'node:test';

import {
  PrismaClient,
  TenantMembershipStatus,
  UserStatus,
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

test('owner can create and update personnel with multiple staff roles without changing password', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const createResponse = await fetch(`${baseUrl}/personnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: ownerSession.cookie,
        'x-csrf-token': ownerSession.csrfToken,
      },
      body: JSON.stringify({
        firstName: 'Нова',
        lastName: 'Служителка',
        email: `staff.${context.suffix}@example.com`,
        phone: `0899${context.numericSuffix.slice(0, 6)}`,
        password: 'PersonnelCreate2026!',
        roleKeys: ['instructor'],
      }),
    });

    assert.equal(createResponse.status, 201);
    const createdPayload = (await createResponse.json()) as {
      item: { membershipId: string; roleKeys: string[] };
      portalAccess: { temporaryPassword: string | null };
    };
    assert.deepEqual(createdPayload.item.roleKeys, ['instructor']);
    assert.equal(createdPayload.portalAccess.temporaryPassword, null);

    const createdStaffSession = await login({
      tenantSlug: context.tenantSlug,
      email: `staff.${context.suffix}@example.com`,
      password: 'PersonnelCreate2026!',
    });

    assert.ok(createdStaffSession.cookie);

    const updateResponse = await fetch(
      `${baseUrl}/personnel/${createdPayload.item.membershipId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          cookie: ownerSession.cookie,
          'x-csrf-token': ownerSession.csrfToken,
        },
        body: JSON.stringify({
          firstName: 'Нова',
          lastName: 'Служителка',
          email: `staff.${context.suffix}@example.com`,
          phone: `0899${context.numericSuffix.slice(0, 6)}`,
          roleKeys: ['instructor', 'administration'],
        }),
      },
    );

    assert.equal(updateResponse.status, 200);
    const updatedPayload = (await updateResponse.json()) as {
      item: { roleKeys: string[] };
    };
    assert.deepEqual(updatedPayload.item.roleKeys.sort(), ['administration', 'instructor']);

    const updatedStaffSession = await login({
      tenantSlug: context.tenantSlug,
      email: `staff.${context.suffix}@example.com`,
      password: 'PersonnelCreate2026!',
    });

    assert.ok(updatedStaffSession.cookie);

    const listResponse = await fetch(`${baseUrl}/personnel`, {
      headers: {
        cookie: ownerSession.cookie,
      },
    });

    assert.equal(listResponse.status, 200);
    const listPayload = (await listResponse.json()) as {
      items: Array<{ email: string; roleKeys: string[] }>;
    };
    const createdItem = listPayload.items.find(
      (item) => item.email === `staff.${context.suffix}@example.com`,
    );
    assert.ok(createdItem);
    assert.deepEqual(createdItem.roleKeys.sort(), ['administration', 'instructor']);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('owner cannot change personnel password from edit flow', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const createResponse = await fetch(`${baseUrl}/personnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: ownerSession.cookie,
        'x-csrf-token': ownerSession.csrfToken,
      },
      body: JSON.stringify({
        firstName: 'Мария',
        lastName: 'Администрация',
        email: `staff-edit.${context.suffix}@example.com`,
        phone: `0888${context.numericSuffix.slice(0, 6)}`,
        password: 'PersonnelCreate2026!',
        roleKeys: ['administration'],
      }),
    });

    assert.equal(createResponse.status, 201);
    const createdPayload = (await createResponse.json()) as {
      item: { membershipId: string };
    };

    const updateResponse = await fetch(
      `${baseUrl}/personnel/${createdPayload.item.membershipId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          cookie: ownerSession.cookie,
          'x-csrf-token': ownerSession.csrfToken,
        },
        body: JSON.stringify({
          firstName: 'Мария',
          lastName: 'Администрация',
          email: `staff-edit.${context.suffix}@example.com`,
          phone: `0888${context.numericSuffix.slice(0, 6)}`,
          password: 'PersonnelUpdated2026!',
          roleKeys: ['administration', 'instructor'],
        }),
      },
    );

    assert.equal(updateResponse.status, 400);
    const updatePayload = (await updateResponse.json()) as { error: string };
    assert.equal(updatePayload.error, 'Паролата се сменя от самия служител след вход.');

    const staffSession = await login({
      tenantSlug: context.tenantSlug,
      email: `staff-edit.${context.suffix}@example.com`,
      password: 'PersonnelCreate2026!',
    });

    assert.ok(staffSession.cookie);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('owner can delete personnel and remove their login access', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const staffEmail = `staff-delete.${context.suffix}@example.com`;
    const staffPassword = 'PersonnelDelete2026!';
    const createResponse = await fetch(`${baseUrl}/personnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: ownerSession.cookie,
        'x-csrf-token': ownerSession.csrfToken,
      },
      body: JSON.stringify({
        firstName: 'Петър',
        lastName: 'Инструктор',
        email: staffEmail,
        phone: `0877${context.numericSuffix.slice(0, 6)}`,
        password: staffPassword,
        roleKeys: ['instructor'],
      }),
    });

    assert.equal(createResponse.status, 201);
    const createdPayload = (await createResponse.json()) as {
      item: { membershipId: string; userId: string };
    };

    const staffSession = await login({
      tenantSlug: context.tenantSlug,
      email: staffEmail,
      password: staffPassword,
    });

    assert.ok(staffSession.cookie);

    const deleteResponse = await fetch(
      `${baseUrl}/personnel/${createdPayload.item.membershipId}`,
      {
        method: 'DELETE',
        headers: {
          cookie: ownerSession.cookie,
          'x-csrf-token': ownerSession.csrfToken,
        },
      },
    );

    assert.equal(deleteResponse.status, 204);

    const deletedMembership = await prisma.tenantMembership.findUnique({
      where: {
        id: createdPayload.item.membershipId,
      },
      select: {
        id: true,
      },
    });
    assert.equal(deletedMembership, null);

    const deletedUser = await prisma.user.findUnique({
      where: {
        id: createdPayload.item.userId,
      },
      select: {
        id: true,
      },
    });
    assert.equal(deletedUser, null);

    const reloginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantSlug: context.tenantSlug,
        email: staffEmail,
        password: staffPassword,
      }),
    });

    assert.equal(reloginResponse.status, 401);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('student role cannot access personnel management endpoints', async () => {
  const context = await seedTenantContext();

  try {
    const studentSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.student.email,
      password: context.student.password,
    });

    const response = await fetch(`${baseUrl}/personnel`, {
      headers: {
        cookie: studentSession.cookie,
      },
    });

    assert.equal(response.status, 403);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('administration role cannot access personnel or AI endpoints', async () => {
  const context = await seedTenantContext();

  try {
    const administration = await createTenantUser({
      tenantId: context.tenantId,
      email: `administration.${context.suffix}@example.com`,
      password: 'AdministrationPassword2026!',
      firstName: 'Мария',
      lastName: 'Администрация',
      roleKeys: ['administration'],
    });

    const administrationSession = await login({
      tenantSlug: context.tenantSlug,
      email: administration.email,
      password: administration.password,
    });

    const personnelResponse = await fetch(`${baseUrl}/personnel`, {
      headers: {
        cookie: administrationSession.cookie,
      },
    });

    assert.equal(personnelResponse.status, 403);

    const aiResponse = await fetch(`${baseUrl}/ai/business-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: administrationSession.cookie,
        'x-csrf-token': administrationSession.csrfToken,
      },
      body: JSON.stringify({
        question: 'Какво е състоянието на школата?',
      }),
    });

    assert.equal(aiResponse.status, 403);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('owner and administration can read assignable instructor options, instructor cannot', async () => {
  const context = await seedTenantContext();
  const foreignContext = await seedTenantContext();

  try {
    await createTenantUser({
      tenantId: context.tenantId,
      email: `assignable.instructor.${context.suffix}@example.com`,
      password: 'AssignableInstructor2026!',
      firstName: 'Иван',
      lastName: 'Петров',
      roleKeys: ['instructor'],
    });

    await createTenantUser({
      tenantId: context.tenantId,
      email: `assignable.simulator.${context.suffix}@example.com`,
      password: 'AssignableSimulator2026!',
      firstName: 'Мария',
      lastName: 'Иванова',
      roleKeys: ['simulator_instructor'],
    });

    await createTenantUser({
      tenantId: foreignContext.tenantId,
      email: `foreign.instructor.${foreignContext.suffix}@example.com`,
      password: 'ForeignInstructor2026!',
      firstName: 'Чужд',
      lastName: 'Инструктор',
      roleKeys: ['instructor'],
    });

    const administration = await createTenantUser({
      tenantId: context.tenantId,
      email: `assignable.administration.${context.suffix}@example.com`,
      password: 'AssignableAdministration2026!',
      firstName: 'Админ',
      lastName: 'Служител',
      roleKeys: ['administration'],
    });

    const instructor = await createTenantUser({
      tenantId: context.tenantId,
      email: `assignable.blocked.${context.suffix}@example.com`,
      password: 'BlockedInstructor2026!',
      firstName: 'Блокиран',
      lastName: 'Инструктор',
      roleKeys: ['instructor'],
    });

    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const administrationSession = await login({
      tenantSlug: context.tenantSlug,
      email: administration.email,
      password: administration.password,
    });

    const instructorSession = await login({
      tenantSlug: context.tenantSlug,
      email: instructor.email,
      password: instructor.password,
    });

    const ownerResponse = await fetch(`${baseUrl}/students/instructor-options`, {
      headers: {
        cookie: ownerSession.cookie,
      },
    });

    assert.equal(ownerResponse.status, 200);
    const ownerPayload = (await ownerResponse.json()) as {
      items: Array<{ displayName: string; roleKeys: string[] }>;
    };
    assert.ok(
      ownerPayload.items.some(
        (item) =>
          item.displayName === 'Иван Петров' &&
          item.roleKeys.includes('instructor'),
      ),
    );
    assert.ok(
      ownerPayload.items.some(
        (item) =>
          item.displayName === 'Мария Иванова' &&
          item.roleKeys.includes('simulator_instructor'),
      ),
    );
    assert.ok(
      ownerPayload.items.every(
        (item) => item.displayName !== 'Чужд Инструктор',
      ),
    );

    const administrationResponse = await fetch(
      `${baseUrl}/students/instructor-options`,
      {
        headers: {
          cookie: administrationSession.cookie,
        },
      },
    );

    assert.equal(administrationResponse.status, 200);

    const instructorResponse = await fetch(
      `${baseUrl}/students/instructor-options`,
      {
        headers: {
          cookie: instructorSession.cookie,
        },
      },
    );

    assert.equal(instructorResponse.status, 403);
  } finally {
    await cleanupTenantContexts([context.tenantId, foreignContext.tenantId]);
  }
});

test('owner can upload instructor document files', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const uploadResponse = await fetch(
      `${baseUrl}/documents/upload?fileName=instructor-license.pdf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          cookie: ownerSession.cookie,
          'x-csrf-token': ownerSession.csrfToken,
        },
        body: Buffer.from('test instructor document content', 'utf8'),
      },
    );

    assert.equal(uploadResponse.status, 201);
    const uploadPayload = (await uploadResponse.json()) as {
      fileName: string;
      fileUrl: string;
    };
    assert.equal(uploadPayload.fileName, 'instructor-license.pdf');
    assert.match(uploadPayload.fileUrl, /^\/uploads\/documents\//);

    const storedFilePath = resolve(
      process.cwd(),
      'storage',
      'uploads',
      uploadPayload.fileUrl.replace(/^\/uploads\//, ''),
    );

    await access(storedFilePath);
    await rm(storedFilePath, { force: true });
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('instructor role cannot access determinator endpoints', async () => {
  const context = await seedTenantContext();

  try {
    const instructor = await createTenantUser({
      tenantId: context.tenantId,
      email: `instructor.${context.suffix}@example.com`,
      password: 'InstructorPassword2026!',
      firstName: 'Иван',
      lastName: 'Инструктор',
      roleKeys: ['instructor'],
    });

    const instructorSession = await login({
      tenantSlug: context.tenantSlug,
      email: instructor.email,
      password: instructor.password,
    });

    const getResponse = await fetch(`${baseUrl}/determinator/sessions`, {
      headers: {
        cookie: instructorSession.cookie,
      },
    });

    assert.equal(getResponse.status, 403);

    const postResponse = await fetch(`${baseUrl}/determinator/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: instructorSession.cookie,
        'x-csrf-token': instructorSession.csrfToken,
      },
      body: JSON.stringify({
        studentId: randomUUID(),
        registrationNumber: 'DET-001',
        autoTempoCorrectReactions: 10,
        autoTempoWrongReactions: 1,
        forcedTempoCorrectReactions: 8,
        forcedTempoDelayedReactions: 2,
        forcedTempoWrongResults: 1,
        forcedTempoMissedStimuli: 0,
        overallResult: 'test',
        instructorNote: 'test',
      }),
    });

    assert.equal(postResponse.status, 403);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('developer can log into a second tenant with the same profile', async () => {
  const sourceContext = await seedTenantContext();
  const targetContext = await seedTenantContext();

  try {
    const developer = await createTenantUser({
      tenantId: sourceContext.tenantId,
      email: `developer.${sourceContext.suffix}@example.com`,
      password: 'DeveloperTestPassword2026!',
      firstName: 'Platform',
      lastName: 'Developer',
      roleKeys: ['developer'],
    });

    const session = await login({
      tenantSlug: targetContext.tenantSlug,
      email: developer.email,
      password: developer.password,
    });

    const meResponse = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        cookie: session.cookie,
      },
    });

    assert.equal(meResponse.status, 200);
    const mePayload = (await meResponse.json()) as {
      tenantSlug: string;
      user: { roleKeys: string[] };
    };
    assert.equal(mePayload.tenantSlug, targetContext.tenantSlug);
    assert.deepEqual(mePayload.user.roleKeys, ['developer']);

    const linkedMembership = await prisma.tenantMembership.findUnique({
      where: {
        tenantId_userId: {
          tenantId: targetContext.tenantId,
          userId: developer.userId,
        },
      },
      select: {
        id: true,
        roles: {
          select: {
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
    });

    assert.ok(linkedMembership);
    assert.deepEqual(
      linkedMembership.roles.map((membershipRole) => membershipRole.role.key),
      ['developer'],
    );
  } finally {
    await cleanupTenantContexts([sourceContext.tenantId, targetContext.tenantId]);
  }
});

test('settings updates are developer-only', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const developer = await createTenantUser({
      tenantId: context.tenantId,
      email: `developer.${context.suffix}@example.com`,
      password: 'DeveloperSettingsPassword2026!',
      firstName: 'Platform',
      lastName: 'Developer',
      roleKeys: ['developer'],
    });

    const developerSession = await login({
      tenantSlug: context.tenantSlug,
      email: developer.email,
      password: developer.password,
    });

    const settingsPayload = {
      settings: [
        {
          featureKey: 'ai',
          enabled: false,
        },
      ],
    };

    const ownerResponse = await fetch(`${baseUrl}/settings/features`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: ownerSession.cookie,
        'x-csrf-token': ownerSession.csrfToken,
      },
      body: JSON.stringify(settingsPayload),
    });

    assert.equal(ownerResponse.status, 403);

    const developerResponse = await fetch(`${baseUrl}/settings/features`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: developerSession.cookie,
        'x-csrf-token': developerSession.csrfToken,
      },
      body: JSON.stringify(settingsPayload),
    });

    assert.equal(developerResponse.status, 200);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('notifications include expiring instructor documents and forbid users without students.read', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const instructor = await createTenantUser({
      tenantId: context.tenantId,
      email: `instructor.${context.suffix}@example.com`,
      password: 'InstructorExpiry2026!',
      firstName: 'Иван',
      lastName: 'Инструкторов',
      roleKeys: ['instructor'],
    });

    const guest = await createTenantUser({
      tenantId: context.tenantId,
      email: `guest.${context.suffix}@example.com`,
      password: 'GuestNoAccess2026!',
      firstName: 'Guest',
      lastName: 'NoAccess',
      roleKeys: [],
    });

    const guestSession = await login({
      tenantSlug: context.tenantSlug,
      email: guest.email,
      password: guest.password,
    });

    await prisma.documentRecord.create({
      data: {
        tenantId: context.tenantId,
        studentId: null,
        name: 'Удостоверение за психологическа годност',
        ownerType: 'INSTRUCTOR',
        ownerName: 'Иван Инструкторов',
        ownerRef: instructor.membershipId,
        category: 'Удостоверение',
        documentNo: `DOC-${context.numericSuffix}`,
        issueDate: new Date('2026-01-01T00:00:00.000Z'),
        expiryDate: new Date('2026-04-20T00:00:00.000Z'),
        status: 'EXPIRING_SOON',
        fileUrl: null,
        notes: null,
      },
    });

    const ownerResponse = await fetch(`${baseUrl}/notifications`, {
      headers: {
        cookie: ownerSession.cookie,
      },
    });

    assert.equal(ownerResponse.status, 200);
    const ownerPayload = (await ownerResponse.json()) as {
      items: Array<{
        kind: string;
        title: string;
        actionTarget: string | null;
        metadata: Record<string, unknown> | null;
      }>;
    };
    const documentNotification = ownerPayload.items.find(
      (item) => item.kind === 'INSTRUCTOR_DOCUMENT_EXPIRY',
    );
    assert.ok(documentNotification);
    assert.equal(
      documentNotification.title,
      'Изтичащ документ · Иван Инструкторов',
    );
    assert.equal(
      documentNotification.actionTarget,
      `/instructors/${instructor.membershipId}`,
    );
    assert.equal(
      documentNotification.metadata?.ownerName,
      'Иван Инструкторов',
    );

    const guestResponse = await fetch(`${baseUrl}/notifications`, {
      headers: {
        cookie: guestSession.cookie,
      },
    });

    assert.equal(guestResponse.status, 403);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('owner can create theory groups and student cannot', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });
    const studentSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.student.email,
      password: context.student.password,
    });

    const payload = {
      name: 'Теория B - Май 2026',
      categoryCode: 'B',
      scheduleLabel: 'Понеделник и сряда, 18:00 - 20:00',
      instructorName: 'Иван Инструкторов',
      daiCode: `TG-${context.numericSuffix}`,
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      totalLectures: 12,
    };

    const ownerResponse = await fetch(`${baseUrl}/theory/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: ownerSession.cookie,
        'x-csrf-token': ownerSession.csrfToken,
      },
      body: JSON.stringify(payload),
    });

    assert.equal(ownerResponse.status, 201);
    const ownerBody = (await ownerResponse.json()) as {
      item: {
        name: string;
        daiCode: string;
        categoryCode: string;
        totalLectures: number;
        status: string;
      };
    };
    assert.equal(ownerBody.item.name, payload.name);
    assert.equal(ownerBody.item.daiCode, payload.daiCode);
    assert.equal(ownerBody.item.categoryCode, payload.categoryCode);
    assert.equal(ownerBody.item.totalLectures, payload.totalLectures);

    const listResponse = await fetch(`${baseUrl}/theory/groups`, {
      headers: {
        cookie: ownerSession.cookie,
      },
    });

    assert.equal(listResponse.status, 200);
    const listBody = (await listResponse.json()) as {
      items: Array<{ daiCode: string; name: string }>;
    };
    assert.ok(
      listBody.items.some((item) => item.daiCode === payload.daiCode),
    );

    const studentResponse = await fetch(`${baseUrl}/theory/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: studentSession.cookie,
        'x-csrf-token': studentSession.csrfToken,
      },
      body: JSON.stringify({
        ...payload,
        daiCode: `TG-STUDENT-${context.numericSuffix}`,
      }),
    });

    assert.equal(studentResponse.status, 403);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('owner can register a student with an initial payment record', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const createResponse = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: ownerSession.cookie,
        'x-csrf-token': ownerSession.csrfToken,
      },
      body: JSON.stringify({
        firstName: 'Иван',
        lastName: 'Курсист',
        phone: `0887${context.numericSuffix.slice(0, 6)}`,
        email: `student-create.${context.suffix}@example.com`,
        portalPassword: 'StudentInitial2026!',
        nationalId: `99${context.numericSuffix.slice(0, 8)}`,
        birthDate: '1999-04-04',
        address: 'гр. София, бул. България 1',
        educationLevel: 'Средно',
        parentName: null,
        parentPhone: null,
        parentEmail: null,
        parentContactStatus: 'DISABLED',
        status: 'ACTIVE',
        initialPayment: {
          amount: 150,
          paidAmount: 150,
          method: 'В брой',
          status: 'PAID',
          paidAt: '2026-04-08',
          note: 'Първоначално плащане при записване',
        },
        enrollment: {
          categoryCode: 'B',
          status: 'ACTIVE',
          trainingMode: 'STANDARD_PACKAGE',
          registerMode: 'ELECTRONIC',
          theoryGroupNumber: null,
          assignedInstructorName: null,
          enrollmentDate: '2026-04-08',
          expectedArrivalDate: null,
          previousLicenseCategory: null,
          packageHours: 20,
          additionalHours: 0,
          completedHours: 0,
          failedExamAttempts: 0,
          lastPracticeAt: null,
          notes: null,
        },
      }),
    });

    const createBodyText = await createResponse.text();
    assert.equal(createResponse.status, 201, createBodyText);
    const createdStudent = JSON.parse(createBodyText) as { id: string };

    const paymentsResponse = await fetch(`${baseUrl}/payments`, {
      headers: {
        cookie: ownerSession.cookie,
      },
    });

    const paymentsBodyText = await paymentsResponse.text();
    assert.equal(paymentsResponse.status, 200, paymentsBodyText);
    const paymentsPayload = JSON.parse(paymentsBodyText) as {
      items: Array<{
        studentId: string;
        amount: number;
        paidAmount: number;
        method: string;
        status: string;
      }>;
    };

    const initialPayment = paymentsPayload.items.find(
      (item) => item.studentId === createdStudent.id,
    );

    assert.ok(initialPayment);
    assert.equal(initialPayment.amount, 150);
    assert.equal(initialPayment.paidAmount, 150);
    assert.equal(initialPayment.method, 'В брой');
    assert.equal(initialPayment.status, 'PAID');
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('owner can register a student with explicit portal password and the student can log in with it', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const studentEmail = `student-password.${context.suffix}@example.com`;
    const studentPassword = 'StudentPortal2026!';
    const createResponse = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: ownerSession.cookie,
        'x-csrf-token': ownerSession.csrfToken,
      },
      body: JSON.stringify({
        firstName: 'Петър',
        lastName: 'Курсист',
        phone: `0885${context.numericSuffix.slice(0, 6)}`,
        email: studentEmail,
        portalPassword: studentPassword,
        nationalId: `97${context.numericSuffix.slice(0, 8)}`,
        birthDate: '1997-04-04',
        address: 'гр. София, бул. България 3',
        educationLevel: 'Средно',
        parentName: null,
        parentPhone: null,
        parentEmail: null,
        parentContactStatus: 'DISABLED',
        status: 'ACTIVE',
        enrollment: {
          categoryCode: 'B',
          status: 'ACTIVE',
          trainingMode: 'STANDARD_PACKAGE',
          registerMode: 'ELECTRONIC',
          theoryGroupNumber: null,
          assignedInstructorName: null,
          enrollmentDate: '2026-04-08',
          expectedArrivalDate: null,
          previousLicenseCategory: null,
          packageHours: 20,
          additionalHours: 0,
          completedHours: 0,
          failedExamAttempts: 0,
          lastPracticeAt: null,
          notes: null,
        },
      }),
    });

    const createBodyText = await createResponse.text();
    assert.equal(createResponse.status, 201, createBodyText);
    const createdStudent = JSON.parse(createBodyText) as {
      portalAccess: {
        loginIdentifier: string;
        temporaryPassword: string | null;
        mustChangePassword: boolean;
      } | null;
    };

    assert.equal(createdStudent.portalAccess?.loginIdentifier, studentEmail);
    assert.equal(createdStudent.portalAccess?.temporaryPassword, null);
    assert.equal(createdStudent.portalAccess?.mustChangePassword, true);

    const studentSession = await login({
      tenantSlug: context.tenantSlug,
      email: studentEmail,
      password: studentPassword,
    });

    assert.ok(studentSession.cookie);
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

test('registering a student does not overwrite an instructor account with the same phone', async () => {
  const context = await seedTenantContext();

  try {
    const ownerSession = await login({
      tenantSlug: context.tenantSlug,
      email: context.owner.email,
      password: context.owner.password,
    });

    const sharedPhone = `0886${context.numericSuffix.slice(0, 6)}`;
    const instructorEmail = `shared-phone.instructor.${context.suffix}@example.com`;
    const createPersonnelResponse = await fetch(`${baseUrl}/personnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: ownerSession.cookie,
        'x-csrf-token': ownerSession.csrfToken,
      },
      body: JSON.stringify({
        firstName: 'Георги',
        lastName: 'Инструкторов',
        email: instructorEmail,
        phone: sharedPhone,
        password: 'InstructorSharedPhone2026!',
        roleKeys: ['instructor'],
      }),
    });

    assert.equal(createPersonnelResponse.status, 201);

    const createStudentResponse = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: ownerSession.cookie,
        'x-csrf-token': ownerSession.csrfToken,
      },
      body: JSON.stringify({
        firstName: 'Иван',
        lastName: 'Курсист',
        phone: sharedPhone,
        email: `shared-phone.student.${context.suffix}@example.com`,
        portalPassword: 'StudentSharedPhone2026!',
        nationalId: `98${context.numericSuffix.slice(0, 8)}`,
        birthDate: '1998-04-04',
        address: 'гр. София, бул. България 2',
        educationLevel: 'Средно',
        parentName: null,
        parentPhone: null,
        parentEmail: null,
        parentContactStatus: 'DISABLED',
        status: 'ACTIVE',
        enrollment: {
          categoryCode: 'B',
          status: 'ACTIVE',
          trainingMode: 'STANDARD_PACKAGE',
          registerMode: 'ELECTRONIC',
          theoryGroupNumber: null,
          assignedInstructorName: 'Георги Инструкторов',
          enrollmentDate: '2026-04-08',
          expectedArrivalDate: null,
          previousLicenseCategory: null,
          packageHours: 20,
          additionalHours: 0,
          completedHours: 0,
          failedExamAttempts: 0,
          lastPracticeAt: null,
          notes: null,
        },
      }),
    });

    const createStudentBody = await createStudentResponse.text();
    assert.equal(createStudentResponse.status, 201, createStudentBody);

    const instructorUser = await prisma.user.findUnique({
      where: {
        email: instructorEmail,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
      },
    });

    assert.deepEqual(instructorUser, {
      email: instructorEmail,
      firstName: 'Георги',
      lastName: 'Инструкторов',
      displayName: 'Георги Инструкторов',
      phone: sharedPhone,
    });

    const studentUser = await prisma.user.findUnique({
      where: {
        email: `shared-phone.student.${context.suffix}@example.com`,
      },
      select: {
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
      },
    });

    assert.deepEqual(studentUser, {
      firstName: 'Иван',
      lastName: 'Курсист',
      displayName: 'Иван Курсист',
      phone: sharedPhone,
    });
  } finally {
    await cleanupTenantContext(context.tenantId);
  }
});

async function login(params: {
  tenantSlug: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as { csrfToken: string };
  const cookie = response.headers.get('set-cookie');
  assert.ok(cookie);

  return {
    csrfToken: body.csrfToken,
    cookie,
  };
}

async function seedTenantContext() {
  const suffix = randomUUID();
  const numericSuffix = suffix.replace(/[^0-9]/g, '').padEnd(6, '0');
  const tenantSlug = `personnel-test-${suffix.slice(0, 8)}`;
  const tenant = await prisma.tenant.create({
    data: {
      name: `Personnel Test ${suffix.slice(0, 8)}`,
      slug: tenantSlug,
    },
  });

  await seedRolesForTenant(prisma, tenant.id);

  const owner = await createTenantUser({
    tenantId: tenant.id,
    email: `owner.${suffix}@example.com`,
    password: 'OwnerTestPassword2026!',
    firstName: 'Owner',
    lastName: 'Tester',
    roleKeys: ['owner'],
  });

  const student = await createTenantUser({
    tenantId: tenant.id,
    email: `student.${suffix}@example.com`,
    password: 'StudentTestPassword2026!',
    firstName: 'Student',
    lastName: 'Tester',
    roleKeys: ['student'],
  });

  return {
    suffix,
    numericSuffix,
    tenantId: tenant.id,
    tenantSlug,
    owner,
    student,
  };
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
      phone: `0888${randomUUID().replace(/[^0-9]/g, '').padEnd(6, '0').slice(0, 6)}`,
      status: UserStatus.ACTIVE,
      mustChangePassword: false,
    },
  });

  const membership = await prisma.tenantMembership.create({
    data: {
      tenantId: params.tenantId,
      userId: user.id,
      status: TenantMembershipStatus.ACTIVE,
      joinedAt: new Date(),
    },
  });

  const roles = await prisma.role.findMany({
    where: {
      tenantId: params.tenantId,
      key: {
        in: params.roleKeys,
      },
    },
    select: {
      id: true,
    },
  });

  await prisma.membershipRole.createMany({
    data: roles.map((role) => ({
      membershipId: membership.id,
      roleId: role.id,
    })),
  });

  return {
    userId: user.id,
    membershipId: membership.id,
    email: params.email,
    password: params.password,
  };
}

async function cleanupTenantContext(tenantId: string) {
  const memberships = await prisma.tenantMembership.findMany({
    where: {
      tenantId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  const membershipIds = memberships.map((membership) => membership.id);
  const userIds = memberships.map((membership) => membership.userId);

  if (membershipIds.length > 0) {
    await prisma.userSession.deleteMany({
      where: {
        tenantMembershipId: {
          in: membershipIds,
        },
      },
    });
    await prisma.membershipRole.deleteMany({
      where: {
        membershipId: {
          in: membershipIds,
        },
      },
    });
  }

  await prisma.auditLog.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.notificationRecord.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.theoryLectureAttendanceRecord.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.theoryLectureRecord.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.theoryGroupRecord.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.documentRecord.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.paymentRecord.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.determinatorSession.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.studentEnrollment.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.student.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.tenantMembership.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.role.deleteMany({
    where: {
      tenantId,
    },
  });
  await prisma.tenant.delete({
    where: {
      id: tenantId,
    },
  });

  if (userIds.length > 0) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  }
}

async function cleanupTenantContexts(tenantIds: string[]) {
  const memberships = await prisma.tenantMembership.findMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
    select: {
      id: true,
      userId: true,
      tenantId: true,
    },
  });

  const membershipIds = memberships.map((membership) => membership.id);
  const userIds = Array.from(new Set(memberships.map((membership) => membership.userId)));

  if (membershipIds.length > 0) {
    await prisma.userSession.deleteMany({
      where: {
        tenantMembershipId: {
          in: membershipIds,
        },
      },
    });
    await prisma.membershipRole.deleteMany({
      where: {
        membershipId: {
          in: membershipIds,
        },
      },
    });
  }

  await prisma.auditLog.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.notificationRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.theoryLectureAttendanceRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.theoryLectureRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.theoryGroupRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.documentRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.paymentRecord.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.determinatorSession.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.studentEnrollment.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.student.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.tenantMembership.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.role.deleteMany({
    where: {
      tenantId: {
        in: tenantIds,
      },
    },
  });
  await prisma.tenant.deleteMany({
    where: {
      id: {
        in: tenantIds,
      },
    },
  });

  if (userIds.length > 0) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  }
}
