import type { QueryReadAccessScope } from '../../../shared/query/read-access-scope';
import type { DocumentsQueryService } from '../../../documents/application/services/documents-query.service';
import type { PracticalLessonsQueryService } from '../../../practice/application/services/practical-lessons-query.service';
import type { StudentsQueryService } from '../../../students/application/services/students-query.service';
import type {
  NotificationRecord,
  NotificationsRepository,
  NotificationWriteInput
} from '../../domain/repositories/notifications.repository';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export class NotificationsQueryService {
  public constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly studentsQueryService: StudentsQueryService,
    private readonly practicalLessonsQueryService: PracticalLessonsQueryService,
    private readonly documentsQueryService: DocumentsQueryService
  ) {}

  public async listNotifications(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }) {
    const scope = params.scope ?? { mode: 'tenant' as const };

    if (scope.mode === 'tenant') {
      const [students, lessons, documents] = await Promise.all([
        this.studentsQueryService.listStudents({ tenantId: params.tenantId }),
        this.practicalLessonsQueryService.listLessons({ tenantId: params.tenantId }),
        this.documentsQueryService.listDocuments({ tenantId: params.tenantId })
      ]);

      const notifications = buildSystemNotifications({
        students,
        lessons,
        documents,
        now: new Date()
      });

      await this.notificationsRepository.upsertManyForTenant({
        tenantId: params.tenantId,
        notifications
      });
    }

    const records = await this.notificationsRepository.listByTenant({
      tenantId: params.tenantId,
      scope
    });

    return records.map((record) => toNotificationResponse(record));
  }
}

function buildSystemNotifications(params: {
  students: Awaited<ReturnType<StudentsQueryService['listStudents']>>;
  lessons: Awaited<ReturnType<PracticalLessonsQueryService['listLessons']>>;
  documents: Awaited<ReturnType<DocumentsQueryService['listDocuments']>>;
  now: Date;
}): NotificationWriteInput[] {
  const todayStart = new Date(params.now);
  todayStart.setHours(0, 0, 0, 0);

  const studentNotifications = params.students.flatMap((student) => {
    const enrollment = student.enrollment;

    if (!enrollment) {
      return [];
    }

    const notifications: NotificationWriteInput[] = [];

    if (enrollment.lastPracticeAt) {
      const daysWithoutPractice = Math.floor(
        (params.now.getTime() -
          new Date(enrollment.lastPracticeAt).getTime()) /
          ONE_DAY_IN_MS
      );

      if (daysWithoutPractice > 30) {
        notifications.push({
          signalKey: `practice-inactivity:${student.id}`,
          kind: 'PRACTICE_INACTIVITY',
          severity: 'WARNING',
          deliveryStatus: 'PENDING',
          channel: 'SYSTEM',
          title: `Над 30 дни без практика · ${student.name}`,
          message: `${student.name} не е карал ${daysWithoutPractice} дни. Последна практика: ${enrollment.lastPracticeAt.slice(0, 10)}.`,
          audienceLabel: 'Администрация',
          studentId: student.id,
          eventTime: new Date(enrollment.lastPracticeAt),
          metadata: {
            daysWithoutPractice,
            lastPracticeAt: enrollment.lastPracticeAt,
            categoryCode: enrollment.categoryCode
          }
        });
      }
    }

    if (enrollment.expectedArrivalDate) {
      const arrivalDate = new Date(`${enrollment.expectedArrivalDate}T00:00:00`);
      const daysUntilArrival = Math.ceil(
        (arrivalDate.getTime() - todayStart.getTime()) / ONE_DAY_IN_MS
      );

      if (daysUntilArrival >= 0 && daysUntilArrival <= 10) {
        notifications.push({
          signalKey: `arrival-reminder:${student.id}:${enrollment.expectedArrivalDate}`,
          kind: 'ARRIVAL_REMINDER',
          severity: 'INFO',
          deliveryStatus: 'PENDING',
          channel: 'SYSTEM',
          title: `Ранно записване · ${student.name}`,
          message: `${student.name} трябва да бъде потърсен до датата на идване ${enrollment.expectedArrivalDate}. Остават ${daysUntilArrival} дни.`,
          audienceLabel: 'Администрация',
          studentId: student.id,
          eventTime: arrivalDate,
          metadata: {
            expectedArrivalDate: enrollment.expectedArrivalDate,
            daysUntilArrival,
            categoryCode: enrollment.categoryCode
          }
        });
      }
    }

    if (
      enrollment.categoryCode === 'B' &&
      enrollment.completedHours > 0 &&
      enrollment.completedHours % 10 === 0
    ) {
      notifications.push({
        signalKey: `category-b-hours:${student.id}:${enrollment.completedHours}`,
        kind: 'CATEGORY_B_HOUR_MILESTONE',
        severity: 'INFO',
        deliveryStatus: student.parentContactEnabled ? 'PENDING' : 'RESOLVED',
        channel: student.parentContactEnabled ? 'SYSTEM_AND_VIBER' : 'SYSTEM',
        title: `Сигнал за ${enrollment.completedHours}-ти час · ${student.name}`,
        message: `${student.name} достигна ${enrollment.completedHours} часа по категория B. Остават ${enrollment.remainingHours} часа.`,
        audienceLabel: student.parentContactEnabled
          ? `Родител на ${student.name}`
          : 'Администрация',
        studentId: student.id,
        eventTime: params.now,
        metadata: {
          completedHours: enrollment.completedHours,
          remainingHours: enrollment.remainingHours,
          maxHours: enrollment.maxHours
        }
      });
    }

    return notifications;
  });

  const lessonNotifications = params.lessons.flatMap((lesson) => {
    const notifications: NotificationWriteInput[] = [];
    const lessonEventTime = new Date(
      `${lesson.lessonDate}T${lesson.startTimeLabel}:00`
    );

    if (lesson.paymentStatus === 'OVERDUE' || lesson.paymentStatus === 'PENDING') {
      notifications.push({
        signalKey: `payment-reminder:${lesson.id}:${lesson.paymentStatus}`,
        kind: 'PAYMENT_REMINDER',
        severity: lesson.paymentStatus === 'OVERDUE' ? 'ERROR' : 'WARNING',
        deliveryStatus: 'PENDING',
        channel: lesson.parentNotificationSent ? 'SYSTEM_AND_VIBER' : 'SYSTEM',
        title: `Плащане за урок · ${lesson.studentName}`,
        message: `${lesson.studentName} има урок на ${lesson.lessonDate} ${lesson.startTimeLabel}-${lesson.endTimeLabel} със статус на плащане ${lesson.paymentStatus}.`,
        audienceLabel: lesson.studentName,
        studentId: lesson.studentId,
        practicalLessonId: lesson.id,
        eventTime: lessonEventTime,
        metadata: {
          paymentStatus: lesson.paymentStatus,
          lessonDate: lesson.lessonDate,
          instructorName: lesson.instructorName,
          vehicleLabel: lesson.vehicleLabel
        }
      });
    }

    if (lesson.parentNotificationSent && lesson.parentPerformanceSummary) {
      notifications.push({
        signalKey: `parent-report:${lesson.id}`,
        kind: 'PARENT_LESSON_REPORT',
        severity: 'SUCCESS',
        deliveryStatus: 'SENT',
        channel: 'SYSTEM_AND_VIBER',
        title: `Отчет към родител · ${lesson.studentName}`,
        message: lesson.parentPerformanceSummary,
        audienceLabel: `Родител на ${lesson.studentName}`,
        studentId: lesson.studentId,
        practicalLessonId: lesson.id,
        eventTime: lessonEventTime,
        metadata: {
          rating: lesson.rating,
          routeLabel: lesson.routeLabel,
          instructorName: lesson.instructorName
        }
      });
    }

    return notifications;
  });

  const instructorDocumentNotifications = params.documents.flatMap<NotificationWriteInput>((document) => {
    if (document.ownerType !== 'INSTRUCTOR') {
      return [];
    }

    if (
      document.status !== 'EXPIRING_SOON' &&
      document.status !== 'EXPIRED'
    ) {
      return [];
    }

    const isExpired = document.status === 'EXPIRED';
    const expiryDate = document.expiryDate ?? document.issueDate;
    const normalizedDaysLeft = Math.max(document.daysUntilExpiry, 0);

    return [
      {
        signalKey: `instructor-document-expiry:${document.id}:${document.status}`,
        kind: 'INSTRUCTOR_DOCUMENT_EXPIRY',
        severity: isExpired ? 'ERROR' : 'WARNING',
        deliveryStatus: 'PENDING',
        channel: 'SYSTEM',
        title: `${isExpired ? 'Изтекъл документ' : 'Изтичащ документ'} · ${document.ownerName}`,
        message: isExpired
          ? `${document.name} на ${document.ownerName} е изтекъл на ${expiryDate}.`
          : `${document.name} на ${document.ownerName} изтича на ${expiryDate}. Остават ${normalizedDaysLeft} дни.`,
        audienceLabel: 'Администрация и собственик',
        actionLabel: 'Отвори инструктор',
        actionTarget: document.ownerRef
          ? `/instructors/${document.ownerRef}`
          : '/instructors',
        eventTime: new Date(`${expiryDate}T00:00:00`),
        metadata: {
          ownerType: document.ownerType,
          ownerName: document.ownerName,
          ownerRef: document.ownerRef,
          documentId: document.id,
          documentName: document.name,
          documentStatus: document.status,
          expiryDate: document.expiryDate,
          daysUntilExpiry: document.daysUntilExpiry
        }
      }
    ];
  });

  return [
    ...studentNotifications,
    ...lessonNotifications,
    ...instructorDocumentNotifications
  ];
}

function toNotificationResponse(record: NotificationRecord) {
  return {
    id: record.id,
    signalKey: record.signalKey,
    kind: record.kind,
    severity: record.severity,
    deliveryStatus: record.deliveryStatus,
    channel: record.channel,
    title: record.title,
    message: record.message,
    audienceLabel: record.audienceLabel,
    actionLabel: record.actionLabel,
    actionTarget: record.actionTarget,
    studentId: record.studentId,
    practicalLessonId: record.practicalLessonId,
    eventTime: record.eventTime.toISOString(),
    metadata: record.metadata,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}
