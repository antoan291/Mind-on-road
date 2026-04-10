import { Prisma, type PrismaClient } from '@prisma/client';

import type {
  NotificationRecord,
  NotificationsRepository,
  NotificationWriteInput
} from '../../../domain/repositories/notifications.repository';

const notificationSelect = {
  id: true,
  signalKey: true,
  kind: true,
  severity: true,
  deliveryStatus: true,
  channel: true,
  title: true,
  message: true,
  audienceLabel: true,
  actionLabel: true,
  actionTarget: true,
  studentId: true,
  practicalLessonId: true,
  eventTime: true,
  metadata: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.NotificationRecordSelect;

export class PrismaNotificationsRepository implements NotificationsRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async upsertManyForTenant(params: {
    tenantId: string;
    notifications: NotificationWriteInput[];
  }): Promise<void> {
    const signalKeys = params.notifications.map((notification) => notification.signalKey);

    await this.prisma.$transaction(
      [
        this.prisma.notificationRecord.deleteMany({
          where: {
            tenantId: params.tenantId,
            ...(signalKeys.length > 0
              ? {
                  signalKey: {
                    notIn: signalKeys
                  }
                }
              : {})
          }
        }),
        ...params.notifications.map((notification) =>
          this.prisma.notificationRecord.upsert({
            where: {
              tenantId_signalKey: {
                tenantId: params.tenantId,
                signalKey: notification.signalKey
              }
            },
            create: {
              tenantId: params.tenantId,
              signalKey: notification.signalKey,
              kind: notification.kind,
              severity: notification.severity,
              deliveryStatus: notification.deliveryStatus,
              channel: notification.channel,
              title: notification.title,
              message: notification.message,
              audienceLabel: notification.audienceLabel,
              actionLabel: notification.actionLabel ?? null,
              actionTarget: notification.actionTarget ?? null,
              studentId: notification.studentId ?? null,
              practicalLessonId: notification.practicalLessonId ?? null,
              eventTime: notification.eventTime,
              metadata: (notification.metadata ??
                Prisma.JsonNull) as Prisma.InputJsonValue
            },
            update: {
              kind: notification.kind,
              severity: notification.severity,
              deliveryStatus: notification.deliveryStatus,
              channel: notification.channel,
              title: notification.title,
              message: notification.message,
              audienceLabel: notification.audienceLabel,
              actionLabel: notification.actionLabel ?? null,
              actionTarget: notification.actionTarget ?? null,
              studentId: notification.studentId ?? null,
              practicalLessonId: notification.practicalLessonId ?? null,
              eventTime: notification.eventTime,
              metadata: (notification.metadata ??
                Prisma.JsonNull) as Prisma.InputJsonValue
            }
          })
        )
      ]
    );
  }

  public async listByTenant(params: {
    tenantId: string;
  }): Promise<NotificationRecord[]> {
    const records = await this.prisma.notificationRecord.findMany({
      where: {
        tenantId: params.tenantId
      },
      orderBy: [
        {
          eventTime: 'desc'
        },
        {
          createdAt: 'desc'
        }
      ],
      select: notificationSelect
    });

    return records.map((record) => ({
      ...record,
      metadata:
        record.metadata && typeof record.metadata === 'object'
          ? (record.metadata as Record<string, unknown>)
          : null
    }));
  }
}
