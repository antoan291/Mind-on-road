export interface CreateAuditLogInput {
  tenantId?: string;
  userId?: string;
  sessionId?: string;
  actorType: 'ANONYMOUS' | 'USER' | 'SYSTEM';
  actionKey: string;
  outcome: 'SUCCESS' | 'FAILURE';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogRecord {
  id: string;
  actionKey: string;
  outcome: 'SUCCESS' | 'FAILURE';
  actorType: 'ANONYMOUS' | 'USER' | 'SYSTEM';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogRepository {
  create(input: CreateAuditLogInput): Promise<void>;
  listRecentByTenant(params: {
    tenantId: string;
    limit: number;
  }): Promise<AuditLogRecord[]>;
}
