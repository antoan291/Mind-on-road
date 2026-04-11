import type { AuthenticatedRequest } from "./types";
import { authAuditService } from "./services";

export async function recordMutationAudit(
  request: AuthenticatedRequest,
  actionKey: string,
  metadata: Record<string, unknown>,
) {
  await authAuditService.record({
    tenantId: request.auth!.tenantId,
    userId: request.auth!.user.id,
    sessionId: request.auth!.sessionId,
    actorType: "USER",
    actionKey,
    outcome: "SUCCESS",
    ipAddress: request.ip,
    userAgent: request.get("user-agent") ?? undefined,
    metadata,
  });
}
