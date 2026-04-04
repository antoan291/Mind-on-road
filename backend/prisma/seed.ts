import { PrismaClient } from '@prisma/client';
import {
  DocumentLifecycleStatus,
  DocumentOwnerType,
  InvoiceLifecycleStatus,
  InvoicePaymentLinkStatus,
  ParentContactStatus,
  PracticalLessonEvaluationStatus,
  PracticalLessonPaymentStatus,
  PracticalLessonStatus,
  StudentEnrollmentStatus,
  StudentRegisterMode,
  StudentStatus,
  StudentTrainingMode,
  TenantMembershipStatus,
  TheoryGroupStatus,
  TheoryLectureStatus,
  UserStatus,
  VehicleLifecycleStatus
} from '@prisma/client';

import { permissionSeeds, roleTemplateSeeds } from './identity-seed-data';
import { seedPermissions, seedRolesForTenant } from './identity-seed-service';
import { hashPassword } from '../src/modules/identity/domain/services/password-security';

const prisma = new PrismaClient();

async function main() {
  await seedPermissions(prisma);

  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      slug: true
    }
  });

  for (const tenant of tenants) {
    await seedRolesForTenant(prisma, tenant.id);
    await seedDemoStudents(prisma, tenant.id);
    console.info(`[seed] seeded roles for tenant ${tenant.slug}`);
  }

  console.info(
    `[seed] seeded ${permissionSeeds.length} permissions and ${roleTemplateSeeds.length} role templates`
  );

  if (tenants.length === 0) {
    console.info(
      '[seed] no tenants exist yet, so tenant-scoped roles were not materialized'
    );
  }
}

void main()
  .catch((error) => {
    console.error('[seed] failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function seedDemoStudents(prismaClient: PrismaClient, tenantId: string) {
  const adminRole = await prismaClient.role.findUniqueOrThrow({
    where: {
      tenantId_key: {
        tenantId,
        key: 'admin'
      }
    },
    select: {
      id: true
    }
  });

  const instructorRole = await prismaClient.role.findUniqueOrThrow({
    where: {
      tenantId_key: {
        tenantId,
        key: 'instructor'
      }
    },
    select: {
      id: true
    }
  });

  const studentRole = await prismaClient.role.findUniqueOrThrow({
    where: {
      tenantId_key: {
        tenantId,
        key: 'student'
      }
    },
    select: {
      id: true
    }
  });

  await prismaClient.determinatorSession.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.examApplicationRevisionRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.examApplicationRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.paymentRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.expenseRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.documentRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.invoiceRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.vehicleRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.practicalLessonRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.notificationRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.theoryLectureRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.theoryGroupRecord.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.studentEnrollment.deleteMany({
    where: {
      tenantId
    }
  });

  await prismaClient.student.deleteMany({
    where: {
      tenantId
    }
  });

  await upsertTenantRoleUser(prismaClient, {
    tenantId,
    roleId: adminRole.id,
    firstName: 'Админ',
    lastName: 'Операции',
    displayName: 'Админ Операции',
    email: 'admin@mindonroad.local',
    phone: '0888000001',
    password: 'MindOnRoadAdmin2026!'
  });

  const seedInstructors = [
    {
      firstName: 'Георги',
      lastName: 'Петров',
      displayName: 'Георги Петров',
      email: 'georgi.petrov@mindonroad.local',
      phone: '0888100001'
    },
    {
      firstName: 'Иван',
      lastName: 'Димитров',
      displayName: 'Иван Димитров',
      email: 'ivan.dimitrov@mindonroad.local',
      phone: '0888100002'
    },
    {
      firstName: 'Петър',
      lastName: 'Николов',
      displayName: 'Петър Николов',
      email: 'petar.nikolov@mindonroad.local',
      phone: '0888100003'
    },
    {
      firstName: 'Даниел',
      lastName: 'Стоянов',
      displayName: 'Даниел Стоянов',
      email: 'daniel.stoyanov@mindonroad.local',
      phone: '0888100004'
    }
  ];

  for (const instructor of seedInstructors) {
    await upsertTenantRoleUser(prismaClient, {
      tenantId,
      roleId: instructorRole.id,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      displayName: instructor.displayName,
      email: instructor.email,
      phone: instructor.phone,
      password: 'MindOnRoadInstructor2026!'
    });
  }

  const demoStudents = [
    {
      seedCode: 'AT',
      firstName: 'Антоан',
      lastName: 'Тест',
      phone: '0886612503',
      email: 'antoan.test@example.com',
      nationalId: '9904041234',
      educationLevel: 'Средно',
      parentName: 'Мария Тест',
      parentPhone: '0886612504',
      parentEmail: 'parent.antoan.test@example.com',
      parentContactStatus: ParentContactStatus.ENABLED,
      categoryCode: 'B',
      trainingMode: StudentTrainingMode.STANDARD_PACKAGE,
      registerMode: StudentRegisterMode.ELECTRONIC,
      theoryGroupNumber: 'AT-001',
      assignedInstructorName: 'Георги Петров',
      enrollmentDate: new Date('2026-04-04T00:00:00.000Z'),
      expectedArrivalDate: new Date('2026-04-14T00:00:00.000Z'),
      packageHours: 20,
      additionalHours: 0,
      completedHours: 2,
      lastPracticeAt: new Date('2026-04-03T10:00:00.000Z'),
      enrollmentStatus: StudentEnrollmentStatus.ACTIVE,
      studentStatus: StudentStatus.ACTIVE,
      paymentAmount: 1200,
      paymentStatus: 'PAID',
      paymentMethod: 'Банков превод',
      paymentDate: new Date('2026-04-04T00:00:00.000Z'),
      documentStatus: DocumentLifecycleStatus.VALID,
      documentIssueDate: new Date('2024-01-10T00:00:00.000Z'),
      documentExpiryDate: new Date('2034-01-10T00:00:00.000Z'),
      invoiceStatus: InvoiceLifecycleStatus.ISSUED,
      invoicePaymentStatus: 'PAID',
      invoicePaymentLinkStatus: InvoicePaymentLinkStatus.LINKED,
      invoiceDate: new Date('2026-04-04T00:00:00.000Z'),
      invoiceDueDate: new Date('2026-04-11T00:00:00.000Z'),
      expenseDate: new Date('2026-04-04T00:00:00.000Z'),
      vehicleLabel: 'Toyota Corolla · CA 1234 AB',
      vehicleStatus: VehicleLifecycleStatus.ACTIVE,
      nextInspection: new Date('2026-05-15T00:00:00.000Z'),
      theoryGroupName: 'B-AT-001-Утро',
      theoryStatus: TheoryGroupStatus.ACTIVE,
      theoryStartDate: new Date('2026-04-01T00:00:00.000Z'),
      theoryEndDate: null,
      totalLectures: 28,
      completedLectures: 12,
      averageAttendance: 100,
      lectureNumber: 13,
      lectureDate: new Date('2026-04-04T00:00:00.000Z'),
      lectureTopic: 'Пътни знаци - контролен тест',
      lectureStatus: TheoryLectureStatus.SCHEDULED,
      lessonDate: new Date('2026-04-04T00:00:00.000Z'),
      lessonStartTimeLabel: '09:00',
      lessonEndTimeLabel: '10:30',
      lessonDurationMinutes: 90,
      lessonStatus: PracticalLessonStatus.COMPLETED,
      lessonPaymentStatus: PracticalLessonPaymentStatus.PAID,
      lessonEvaluationStatus: PracticalLessonEvaluationStatus.COMPLETED,
      routeLabel: 'Градско каране - тестов маршрут',
      kmDriven: 18,
      rating: 5,
      parentNotificationSent: true,
      parentPerformanceSummary:
        'Изпратен тестов отчет към родител: Антоан Тест се справя стабилно.',
      measuredAt: new Date('2026-04-04T12:00:00.000Z'),
      registrationNumber: 'DET-AT-001',
      autoTempoCorrectReactions: 69,
      autoTempoWrongReactions: 1,
      autoTempoSuccessCoefficient: 34.5,
      forcedTempoCorrectReactions: 59,
      forcedTempoDelayedReactions: 1,
      forcedTempoWrongResults: 0,
      forcedTempoMissedStimuli: 0,
      forcedTempoSuccessCoefficient: 60,
      determinatorOverallResult: 'Стабилен профил при двата режима на темп.',
      determinatorInstructorNote: 'Добър контрол на реакциите, без рискови пропуски.'
    },
    {
      seedCode: 'BT',
      firstName: 'Борис',
      lastName: 'Тестов',
      phone: '0887001101',
      email: 'boris.testov@example.com',
      nationalId: '9802151111',
      educationLevel: 'Средно',
      parentName: 'Силвия Тестова',
      parentPhone: '0887001102',
      parentEmail: 'parent.boris.testov@example.com',
      parentContactStatus: ParentContactStatus.ENABLED,
      categoryCode: 'B',
      trainingMode: StudentTrainingMode.STANDARD_PACKAGE,
      registerMode: StudentRegisterMode.HYBRID,
      theoryGroupNumber: 'BT-002',
      assignedInstructorName: 'Иван Димитров',
      enrollmentDate: new Date('2026-01-12T00:00:00.000Z'),
      expectedArrivalDate: new Date('2026-01-22T00:00:00.000Z'),
      packageHours: 31,
      additionalHours: 6,
      completedHours: 26,
      failedExamAttempts: 1,
      lastPracticeAt: new Date('2026-02-20T11:00:00.000Z'),
      enrollmentStatus: StudentEnrollmentStatus.FAILED_EXAM,
      studentStatus: StudentStatus.ACTIVE,
      paymentAmount: 1700,
      paymentStatus: 'PARTIAL',
      paymentMethod: 'POS',
      paymentDate: new Date('2026-01-14T00:00:00.000Z'),
      documentStatus: DocumentLifecycleStatus.EXPIRING_SOON,
      documentIssueDate: new Date('2016-05-20T00:00:00.000Z'),
      documentExpiryDate: new Date('2026-05-20T00:00:00.000Z'),
      invoiceStatus: InvoiceLifecycleStatus.OVERDUE,
      invoicePaymentStatus: 'PARTIAL',
      invoicePaymentLinkStatus: InvoicePaymentLinkStatus.PARTIAL,
      invoiceDate: new Date('2026-01-14T00:00:00.000Z'),
      invoiceDueDate: new Date('2026-01-24T00:00:00.000Z'),
      expenseDate: new Date('2026-01-21T00:00:00.000Z'),
      vehicleLabel: 'Skoda Octavia · CB 4455 KT',
      vehicleStatus: VehicleLifecycleStatus.SERVICE_SOON,
      nextInspection: new Date('2026-04-20T00:00:00.000Z'),
      theoryGroupName: 'B-BT-002-Вечер',
      theoryStatus: TheoryGroupStatus.COMPLETED,
      theoryStartDate: new Date('2026-01-15T00:00:00.000Z'),
      theoryEndDate: new Date('2026-02-18T00:00:00.000Z'),
      totalLectures: 28,
      completedLectures: 28,
      averageAttendance: 93,
      lectureNumber: 28,
      lectureDate: new Date('2026-02-18T00:00:00.000Z'),
      lectureTopic: 'Вътрешен теоретичен изпит',
      lectureStatus: TheoryLectureStatus.COMPLETED,
      lessonDate: new Date('2026-02-20T00:00:00.000Z'),
      lessonStartTimeLabel: '11:00',
      lessonEndTimeLabel: '12:30',
      lessonDurationMinutes: 90,
      lessonStatus: PracticalLessonStatus.NO_SHOW,
      lessonPaymentStatus: PracticalLessonPaymentStatus.OVERDUE,
      lessonEvaluationStatus: PracticalLessonEvaluationStatus.PENDING,
      routeLabel: 'Неявяване - резервиран градски маршрут',
      kmDriven: 0,
      rating: null,
      parentNotificationSent: false,
      parentPerformanceSummary: null,
      measuredAt: new Date('2026-02-20T13:00:00.000Z'),
      registrationNumber: 'DET-BT-002',
      autoTempoCorrectReactions: 58,
      autoTempoWrongReactions: 6,
      autoTempoSuccessCoefficient: 29,
      forcedTempoCorrectReactions: 48,
      forcedTempoDelayedReactions: 8,
      forcedTempoWrongResults: 3,
      forcedTempoMissedStimuli: 1,
      forcedTempoSuccessCoefficient: 52,
      determinatorOverallResult: 'Нужна е допълнителна работа при висок темп.',
      determinatorInstructorNote:
        'След неуспешен изпит и пропуснат час, препоръчани са още 6 часа.'
    },
    {
      seedCode: 'MT',
      firstName: 'Мария',
      lastName: 'Тестова',
      phone: '0887002201',
      email: 'maria.testova@example.com',
      nationalId: '0005032222',
      educationLevel: 'Висше',
      parentName: null,
      parentPhone: null,
      parentEmail: null,
      parentContactStatus: ParentContactStatus.DISABLED,
      categoryCode: 'B',
      trainingMode: StudentTrainingMode.LICENSED_MANUAL_HOURS,
      registerMode: StudentRegisterMode.PAPER,
      theoryGroupNumber: 'MT-003',
      assignedInstructorName: 'Петър Николов',
      enrollmentDate: new Date('2025-11-03T00:00:00.000Z'),
      expectedArrivalDate: null,
      packageHours: 0,
      additionalHours: 8,
      completedHours: 8,
      previousLicenseCategory: 'B78',
      lastPracticeAt: new Date('2025-12-12T08:30:00.000Z'),
      enrollmentStatus: StudentEnrollmentStatus.PASSED,
      studentStatus: StudentStatus.COMPLETED,
      paymentAmount: 640,
      paymentStatus: 'PAID',
      paymentMethod: 'В брой',
      paymentDate: new Date('2025-11-05T00:00:00.000Z'),
      documentStatus: DocumentLifecycleStatus.VALID,
      documentIssueDate: new Date('2022-03-10T00:00:00.000Z'),
      documentExpiryDate: new Date('2032-03-10T00:00:00.000Z'),
      invoiceStatus: InvoiceLifecycleStatus.ISSUED,
      invoicePaymentStatus: 'PAID',
      invoicePaymentLinkStatus: InvoicePaymentLinkStatus.LINKED,
      invoiceDate: new Date('2025-11-05T00:00:00.000Z'),
      invoiceDueDate: new Date('2025-11-15T00:00:00.000Z'),
      expenseDate: new Date('2025-11-08T00:00:00.000Z'),
      vehicleLabel: 'Volkswagen Golf · CA 7788 MX',
      vehicleStatus: VehicleLifecycleStatus.ACTIVE,
      nextInspection: new Date('2026-07-02T00:00:00.000Z'),
      theoryGroupName: 'B-MT-003-Индивидуално',
      theoryStatus: TheoryGroupStatus.COMPLETED,
      theoryStartDate: new Date('2025-11-10T00:00:00.000Z'),
      theoryEndDate: new Date('2025-11-20T00:00:00.000Z'),
      totalLectures: 0,
      completedLectures: 0,
      averageAttendance: 0,
      lectureNumber: 1,
      lectureDate: new Date('2025-11-10T00:00:00.000Z'),
      lectureTopic: 'Въвеждащ инструктаж за ръчни часове',
      lectureStatus: TheoryLectureStatus.COMPLETED,
      lessonDate: new Date('2025-12-12T00:00:00.000Z'),
      lessonStartTimeLabel: '08:30',
      lessonEndTimeLabel: '10:00',
      lessonDurationMinutes: 90,
      lessonStatus: PracticalLessonStatus.COMPLETED,
      lessonPaymentStatus: PracticalLessonPaymentStatus.PAID,
      lessonEvaluationStatus: PracticalLessonEvaluationStatus.COMPLETED,
      routeLabel: 'Маневри и паркиране - ръчни скорости',
      kmDriven: 14,
      rating: 5,
      parentNotificationSent: false,
      parentPerformanceSummary: null,
      measuredAt: new Date('2025-12-12T11:30:00.000Z'),
      registrationNumber: 'DET-MT-003',
      autoTempoCorrectReactions: 74,
      autoTempoWrongReactions: 0,
      autoTempoSuccessCoefficient: 37,
      forcedTempoCorrectReactions: 61,
      forcedTempoDelayedReactions: 0,
      forcedTempoWrongResults: 0,
      forcedTempoMissedStimuli: 0,
      forcedTempoSuccessCoefficient: 61,
      determinatorOverallResult: 'Отличен резултат и приключено обучение.',
      determinatorInstructorNote:
        'Курсист с книжка, часовете са въведени ръчно като допълнителна практика.'
    },
    {
      seedCode: 'VN',
      firstName: 'Виктор',
      lastName: 'Николов',
      phone: '0887003301',
      email: 'viktor.nikolov@example.com',
      nationalId: '0109093333',
      educationLevel: 'Средно',
      parentName: 'Нели Николова',
      parentPhone: '0887003302',
      parentEmail: 'parent.viktor.nikolov@example.com',
      parentContactStatus: ParentContactStatus.ENABLED,
      categoryCode: 'A2',
      trainingMode: StudentTrainingMode.STANDARD_PACKAGE,
      registerMode: StudentRegisterMode.ELECTRONIC,
      theoryGroupNumber: 'VN-004',
      assignedInstructorName: 'Даниел Стоянов',
      enrollmentDate: new Date('2026-03-01T00:00:00.000Z'),
      expectedArrivalDate: new Date('2026-04-14T00:00:00.000Z'),
      packageHours: 18,
      additionalHours: 2,
      completedHours: 9,
      lastPracticeAt: new Date('2026-04-02T15:00:00.000Z'),
      enrollmentStatus: StudentEnrollmentStatus.ACTIVE,
      studentStatus: StudentStatus.ACTIVE,
      paymentAmount: 980,
      paymentStatus: 'PENDING',
      paymentMethod: 'Банков превод',
      paymentDate: new Date('2026-03-03T00:00:00.000Z'),
      documentStatus: DocumentLifecycleStatus.MISSING,
      documentIssueDate: new Date('2026-03-01T00:00:00.000Z'),
      documentExpiryDate: null,
      invoiceStatus: InvoiceLifecycleStatus.DRAFT,
      invoicePaymentStatus: 'PENDING',
      invoicePaymentLinkStatus: InvoicePaymentLinkStatus.NOT_LINKED,
      invoiceDate: new Date('2026-03-03T00:00:00.000Z'),
      invoiceDueDate: new Date('2026-03-13T00:00:00.000Z'),
      expenseDate: new Date('2026-03-04T00:00:00.000Z'),
      vehicleLabel: 'Honda CB500F · CA 9090 MC',
      vehicleStatus: VehicleLifecycleStatus.ACTIVE,
      nextInspection: new Date('2026-06-12T00:00:00.000Z'),
      theoryGroupName: 'A2-VN-004-Следобед',
      theoryStatus: TheoryGroupStatus.ACTIVE,
      theoryStartDate: new Date('2026-03-04T00:00:00.000Z'),
      theoryEndDate: null,
      totalLectures: 28,
      completedLectures: 8,
      averageAttendance: 88,
      lectureNumber: 9,
      lectureDate: new Date('2026-04-02T00:00:00.000Z'),
      lectureTopic: 'Защитно управление на мотоциклет',
      lectureStatus: TheoryLectureStatus.COMPLETED,
      lessonDate: new Date('2026-04-02T00:00:00.000Z'),
      lessonStartTimeLabel: '15:00',
      lessonEndTimeLabel: '16:30',
      lessonDurationMinutes: 90,
      lessonStatus: PracticalLessonStatus.COMPLETED,
      lessonPaymentStatus: PracticalLessonPaymentStatus.PENDING,
      lessonEvaluationStatus: PracticalLessonEvaluationStatus.COMPLETED,
      routeLabel: 'Полигон и градски преход',
      kmDriven: 22,
      rating: 4,
      parentNotificationSent: true,
      parentPerformanceSummary:
        'Изпратен отчет към родител: Виктор напредва добре, но има нужда от по-добро позициониране.',
      measuredAt: new Date('2026-04-02T17:00:00.000Z'),
      registrationNumber: 'DET-VN-004',
      autoTempoCorrectReactions: 63,
      autoTempoWrongReactions: 2,
      autoTempoSuccessCoefficient: 31.5,
      forcedTempoCorrectReactions: 57,
      forcedTempoDelayedReactions: 2,
      forcedTempoWrongResults: 1,
      forcedTempoMissedStimuli: 1,
      forcedTempoSuccessCoefficient: 57,
      determinatorOverallResult: 'Добър резултат с леки забавяния при наложен темп.',
      determinatorInstructorNote:
        'Да се упражнява реакция при внезапна промяна на пътна ситуация.'
    }
  ];

  for (const studentData of demoStudents) {
    const studentDisplayName = `${studentData.firstName} ${studentData.lastName}`;
    const paymentNumber = `PAY-${studentData.seedCode}-001`;
    const invoiceNumber = `INV-${studentData.seedCode}-001`;
    const documentNo = `ID-${studentData.seedCode}-001`;

    const student = await prismaClient.student.upsert({
      where: {
        tenantId_nationalId: {
          tenantId,
          nationalId: studentData.nationalId
        }
      },
      update: {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        displayName: studentDisplayName,
        phone: studentData.phone,
        email: studentData.email ?? null,
        educationLevel: studentData.educationLevel,
        parentName: studentData.parentName ?? null,
        parentPhone: studentData.parentPhone ?? null,
        parentEmail: studentData.parentEmail ?? null,
        parentContactStatus: studentData.parentContactStatus,
        status: studentData.studentStatus
      },
      create: {
        tenantId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        displayName: studentDisplayName,
        phone: studentData.phone,
        email: studentData.email ?? null,
        nationalId: studentData.nationalId,
        educationLevel: studentData.educationLevel,
        parentName: studentData.parentName ?? null,
        parentPhone: studentData.parentPhone ?? null,
        parentEmail: studentData.parentEmail ?? null,
        parentContactStatus: studentData.parentContactStatus,
        status: studentData.studentStatus
      },
      select: {
        id: true
      }
    });

    const existingEnrollment = await prismaClient.studentEnrollment.findFirst({
      where: {
        tenantId,
        studentId: student.id,
        categoryCode: studentData.categoryCode
      },
      select: {
        id: true
      }
    });

    if (existingEnrollment) {
      await prismaClient.studentEnrollment.update({
        where: {
          id: existingEnrollment.id
        },
        data: {
          status: studentData.enrollmentStatus,
          trainingMode: studentData.trainingMode,
          registerMode: studentData.registerMode,
          theoryGroupNumber: studentData.theoryGroupNumber,
          assignedInstructorName: studentData.assignedInstructorName,
          enrollmentDate: studentData.enrollmentDate,
          expectedArrivalDate: studentData.expectedArrivalDate ?? null,
          previousLicenseCategory: studentData.previousLicenseCategory ?? null,
          packageHours: studentData.packageHours,
          additionalHours: studentData.additionalHours,
          completedHours: studentData.completedHours,
          failedExamAttempts: studentData.failedExamAttempts ?? 0,
          lastPracticeAt: studentData.lastPracticeAt ?? null
        }
      });
      continue;
    }

    await prismaClient.studentEnrollment.create({
      data: {
        tenantId,
        studentId: student.id,
        categoryCode: studentData.categoryCode,
        status: studentData.enrollmentStatus,
        trainingMode: studentData.trainingMode,
        registerMode: studentData.registerMode,
        theoryGroupNumber: studentData.theoryGroupNumber,
        assignedInstructorName: studentData.assignedInstructorName,
        enrollmentDate: studentData.enrollmentDate,
        expectedArrivalDate: studentData.expectedArrivalDate ?? null,
        previousLicenseCategory: studentData.previousLicenseCategory ?? null,
        packageHours: studentData.packageHours,
        additionalHours: studentData.additionalHours,
        completedHours: studentData.completedHours,
        failedExamAttempts: studentData.failedExamAttempts ?? 0,
        lastPracticeAt: studentData.lastPracticeAt ?? null
      }
    });

    await prismaClient.paymentRecord.create({
      data: {
        tenantId,
        studentId: student.id,
        studentName: studentDisplayName,
        paymentNumber,
        amount: studentData.paymentAmount,
        paidAmount:
          studentData.paymentStatus === 'PAID'
            ? studentData.paymentAmount
            : studentData.paymentStatus === 'PARTIAL'
              ? Math.round(studentData.paymentAmount / 2)
              : 0,
        method: studentData.paymentMethod,
        status: studentData.paymentStatus,
        paidAt: studentData.paymentDate,
        note: `Тестово плащане за ${studentDisplayName}`
      }
    });

    await prismaClient.documentRecord.create({
      data: {
        tenantId,
        studentId: student.id,
        name: 'Лична карта',
        ownerType: DocumentOwnerType.STUDENT,
        ownerName: studentDisplayName,
        ownerRef: student.id,
        category: 'Документ за самоличност',
        documentNo:
          studentData.documentStatus === DocumentLifecycleStatus.MISSING
            ? null
            : documentNo,
        issueDate: studentData.documentIssueDate,
        expiryDate: studentData.documentExpiryDate,
        status: studentData.documentStatus,
        fileUrl:
          studentData.documentStatus === DocumentLifecycleStatus.MISSING
            ? null
            : `/documents/${documentNo}.pdf`,
        notes: `Тестов документ към досието на ${studentDisplayName}`
      }
    });

    await prismaClient.invoiceRecord.create({
      data: {
        tenantId,
        studentId: student.id,
        invoiceNumber,
        invoiceDate: studentData.invoiceDate,
        recipientName: studentDisplayName,
        categoryCode: studentData.categoryCode,
        invoiceReason: 'Пакет практическо обучение',
        packageType: 'Стандартен пакет',
        totalAmount: studentData.paymentAmount,
        currency: 'BGN',
        status: studentData.invoiceStatus,
        paymentLinkStatus: studentData.invoicePaymentLinkStatus,
        paymentNumber:
          studentData.invoicePaymentLinkStatus ===
          InvoicePaymentLinkStatus.NOT_LINKED
            ? null
            : paymentNumber,
        paymentStatus: studentData.invoicePaymentStatus,
        createdBy: 'Система',
        createdDate: studentData.invoiceDate,
        lastUpdatedBy: 'Система',
        notes: `Тестова фактура за ${studentDisplayName}`,
        issuedDate:
          studentData.invoiceStatus === InvoiceLifecycleStatus.DRAFT
            ? null
            : studentData.invoiceDate,
        dueDate: studentData.invoiceDueDate,
        vatAmount: Math.round(studentData.paymentAmount / 6),
        subtotalAmount:
          studentData.paymentAmount - Math.round(studentData.paymentAmount / 6),
        wasCorrected: false,
        correctionReason: null
      }
    });

    await prismaClient.expenseRecord.createMany({
      data: [
        {
          tenantId,
          expenseType: 'expense',
          title: 'Гориво за учебен автомобил · тест',
          category: 'Поддръжка',
          amount: 180,
          vatAmount: 30,
          paymentMethod: 'bank',
          source: 'Mind On Road',
          counterparty: `Тестов доставчик ${studentData.seedCode}`,
          note: `Контролиран seed разход към обучението на ${studentDisplayName}.`,
          status:
            studentData.enrollmentStatus === StudentEnrollmentStatus.PASSED
              ? 'success'
              : 'warning',
          affectsOperationalExpense: true,
          entryDate: studentData.expenseDate
        },
        {
          tenantId,
          expenseType: 'friend-vat-expense',
          title: `Фактура гориво от приятел · ${studentData.seedCode}`,
          category: 'ДДС от приятели',
          amount: 240 + studentData.completedHours * 2,
          vatAmount: Math.round((240 + studentData.completedHours * 2) / 6),
          paymentMethod: 'bank',
          source: 'Приятелски документ',
          counterparty: `Партньор доставчик ${studentData.seedCode}`,
          note: 'Не е реален разход в касата, използва се само за ДДС калкулация.',
          status: 'success',
          affectsOperationalExpense: false,
          entryDate: studentData.expenseDate
        }
      ]
    });

    await prismaClient.vehicleRecord.create({
      data: {
        tenantId,
        vehicleLabel: studentData.vehicleLabel,
        instructorName: studentData.assignedInstructorName,
        categoryCode: studentData.categoryCode,
        status: studentData.vehicleStatus,
        nextInspection: studentData.nextInspection,
        activeLessons:
          studentData.lessonStatus === PracticalLessonStatus.SCHEDULED ? 1 : 0,
        operationalNote: `Seed автомобил, вързан към ${studentDisplayName} и ${studentData.assignedInstructorName}.`
      }
    });

    const theoryGroup = await prismaClient.theoryGroupRecord.create({
      data: {
        tenantId,
        name: studentData.theoryGroupName,
        categoryCode: studentData.categoryCode,
        scheduleLabel:
          studentData.trainingMode === StudentTrainingMode.LICENSED_MANUAL_HOURS
            ? 'Индивидуален график'
            : 'Понеделник и Сряда, 09:00 - 12:00',
        instructorName: studentData.assignedInstructorName,
        daiCode: `DAI-${studentData.seedCode}-001`,
        startDate: studentData.theoryStartDate,
        endDate: studentData.theoryEndDate,
        totalLectures: studentData.totalLectures,
        completedLectures: studentData.completedLectures,
        activeStudents: 1,
        studentsWithAbsences: studentData.averageAttendance < 90 ? 1 : 0,
        studentsNeedingRecovery: studentData.averageAttendance < 90 ? 1 : 0,
        averageAttendance: studentData.averageAttendance,
        status: studentData.theoryStatus
      },
      select: {
        id: true
      }
    });

    await prismaClient.theoryLectureRecord.create({
      data: {
        tenantId,
        theoryGroupId: theoryGroup.id,
        lectureNumber: studentData.lectureNumber,
        topic: studentData.lectureTopic,
        lectureDate: studentData.lectureDate,
        startTimeLabel: '09:00',
        endTimeLabel: '12:00',
        durationMinutes: 180,
        location: 'Зала 1',
        status: studentData.lectureStatus,
        presentCount: studentData.averageAttendance >= 90 ? 1 : 0,
        absentCount: studentData.averageAttendance < 90 ? 1 : 0
      }
    });

    await prismaClient.practicalLessonRecord.create({
      data: {
        tenantId,
        studentId: student.id,
        studentName: studentDisplayName,
        instructorName: studentData.assignedInstructorName,
        vehicleLabel: studentData.vehicleLabel,
        categoryCode: studentData.categoryCode,
        lessonDate: studentData.lessonDate,
        startTimeLabel: studentData.lessonStartTimeLabel,
        endTimeLabel: studentData.lessonEndTimeLabel,
        durationMinutes: studentData.lessonDurationMinutes,
        status: studentData.lessonStatus,
        paymentStatus: studentData.lessonPaymentStatus,
        evaluationStatus: studentData.lessonEvaluationStatus,
        routeLabel: studentData.routeLabel,
        startLocation: 'Автошкола Mind on Road',
        endLocation: 'Автошкола Mind on Road',
        notes: `Тестов практически час за ${studentDisplayName}`,
        kmDriven: studentData.kmDriven,
        rating: studentData.rating,
        parentNotificationSent: studentData.parentNotificationSent,
        parentPerformanceSummary: studentData.parentPerformanceSummary,
        createdBy: 'Система',
        updatedBy: 'Система'
      }
    });

    await prismaClient.determinatorSession.create({
      data: {
        tenantId,
        studentId: student.id,
        studentName: studentDisplayName,
        registrationNumber: studentData.registrationNumber,
        measuredAt: studentData.measuredAt,
        autoTempoCorrectReactions: studentData.autoTempoCorrectReactions,
        autoTempoWrongReactions: studentData.autoTempoWrongReactions,
        autoTempoSuccessCoefficient: studentData.autoTempoSuccessCoefficient,
        forcedTempoCorrectReactions: studentData.forcedTempoCorrectReactions,
        forcedTempoDelayedReactions: studentData.forcedTempoDelayedReactions,
        forcedTempoWrongResults: studentData.forcedTempoWrongResults,
        forcedTempoMissedStimuli: studentData.forcedTempoMissedStimuli,
        forcedTempoSuccessCoefficient: studentData.forcedTempoSuccessCoefficient,
        overallResult: studentData.determinatorOverallResult,
        instructorNote: studentData.determinatorInstructorNote
      }
    });

    await upsertTenantRoleUser(prismaClient, {
      tenantId,
      roleId: studentRole.id,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      displayName: studentDisplayName,
      email: studentData.email,
      phone: studentData.phone,
      password: 'MindOnRoadStudent2026!'
    });
  }
}

async function upsertTenantRoleUser(
  prismaClient: PrismaClient,
  params: {
    tenantId: string;
    roleId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string | null;
    phone: string;
    password: string;
  }
) {
  if (!params.email) {
    return;
  }

  const user = await prismaClient.user.upsert({
    where: {
      email: params.email
    },
    update: {
      firstName: params.firstName,
      lastName: params.lastName,
      displayName: params.displayName,
      phone: params.phone,
      status: UserStatus.ACTIVE,
      mustChangePassword: false
    },
    create: {
      email: params.email,
      passwordHash: hashPassword(params.password),
      firstName: params.firstName,
      lastName: params.lastName,
      displayName: params.displayName,
      phone: params.phone,
      status: UserStatus.ACTIVE,
      mustChangePassword: false
    },
    select: {
      id: true
    }
  });

  const membership = await prismaClient.tenantMembership.upsert({
    where: {
      tenantId_userId: {
        tenantId: params.tenantId,
        userId: user.id
      }
    },
    update: {
      status: TenantMembershipStatus.ACTIVE,
      joinedAt: new Date()
    },
    create: {
      tenantId: params.tenantId,
      userId: user.id,
      status: TenantMembershipStatus.ACTIVE,
      joinedAt: new Date()
    },
    select: {
      id: true
    }
  });

  await prismaClient.membershipRole.upsert({
    where: {
      membershipId_roleId: {
        membershipId: membership.id,
        roleId: params.roleId
      }
    },
    update: {},
    create: {
      membershipId: membership.id,
      roleId: params.roleId
    }
  });
}
