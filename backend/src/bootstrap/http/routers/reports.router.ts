import express = require("express");
import {
  buildTenantCacheKey,
  readCacheJson,
  writeCacheJson,
  TENANT_CACHE_TTL_SECONDS,
} from "../cache";
import {
  requireAuthenticatedSession,
  requirePermission,
} from "../middleware";
import { financeReportQueryService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.get(
  "/reports/finance-ledger",
  requireAuthenticatedSession,
  requirePermission("reports.read"),
  async (request: AuthenticatedRequest, response) => {
    const cacheKey = buildTenantCacheKey(
      request.auth!.tenantId,
      "reports:finance-ledger",
    );
    const cachedReport = await readCacheJson<unknown>(cacheKey);

    if (cachedReport) {
      response.status(200).json(cachedReport);
      return;
    }

    const report = await financeReportQueryService.getFinanceReport({
      tenantId: request.auth!.tenantId,
    });

    await writeCacheJson(cacheKey, report, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json(report);
  },
);

export { router as reportsRouter };
