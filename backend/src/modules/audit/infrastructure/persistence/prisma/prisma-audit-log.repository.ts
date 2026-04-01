import { AuditActorType, AuditOutcome } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import type {
  AuditLogRecord,
  AuditLogRepository,
  CreateAuditLogInput
} from '../../../domain/repositories/audit-log.repository';

export class PrismaAuditLogRepository implements AuditLogRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async create(input: CreateAuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        sessionId: input.sessionId,
        actorType: input.actorType as AuditActorType,
        actionKey: input.actionKey,
        outcome: input.outcome as AuditOutcome,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: input.metadata as Prisma.InputJsonValue | undefined
      }
    });
  }

  public async listRecentByTenant(params: {
    tenantId: string;
    limit: number;
  }): Promise<AuditLogRecord[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        tenantId: params.tenantId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: params.limit,
      select: {
        id: true,
        actionKey: true,
        outcome: true,
        actorType: true,
        ipAddress: true,
        userAgent: true,
        metadata: true,
        createdAt: true
      }
    });

    return auditLogs.map((auditLog) => ({
      id: auditLog.id,
      actionKey: auditLog.actionKey,
      outcome: auditLog.outcome,
      actorType: auditLog.actorType,
      ipAddress: auditLog.ipAddress ?? undefined,
      userAgent: auditLog.userAgent ?? undefined,
      metadata:
        auditLog.metadata && typeof auditLog.metadata === 'object'
          ? (auditLog.metadata as Record<string, unknown>)
          : undefined,
      createdAt: auditLog.createdAt.toISOString()
    }));
  }
}
