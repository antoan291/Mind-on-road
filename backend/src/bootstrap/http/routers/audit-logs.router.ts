import express = require("express");
import { requireAuthenticatedSession, requirePermission } from "../middleware";
import { authAuditService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.get(
  "/audit/logs",
  requireAuthenticatedSession,
  requirePermission("audit.read"),
  async (request: AuthenticatedRequest, response) => {
    const auditLogs = await authAuditService.listRecentTenantEvents({
      tenantId: request.auth!.tenantId,
      limit: 20,
    });

    response.status(200).json({ items: auditLogs });
  },
);

export { router as auditLogsRouter };
