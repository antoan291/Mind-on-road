import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

export class AuthAuditService {
  public constructor(private readonly auditLogRepository: AuditLogRepository) {}

  public async record(params: {
    tenantId?: string;
    userId?: string;
    sessionId?: string;
    actorType: 'ANONYMOUS' | 'USER' | 'SYSTEM';
    actionKey: string;
    outcome: 'SUCCESS' | 'FAILURE';
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.auditLogRepository.create(params);
  }

  public async listRecentTenantEvents(params: {
    tenantId: string;
    limit?: number;
  }) {
    return this.auditLogRepository.listRecentByTenant({
      tenantId: params.tenantId,
      limit: params.limit ?? 20
    });
  }
}
