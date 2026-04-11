import express = require("express");
import {
  buildScopedTenantCacheKey,
  readCacheJson,
  writeCacheJson,
  TENANT_CACHE_TTL_SECONDS,
} from "../cache";
import {
  resolveReadAccessScope,
  toQueryReadAccessScope,
} from "../access-scope";
import {
  requireAuthenticatedSession,
  requirePermission,
} from "../middleware";
import { notificationsQueryService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.get(
  "/notifications",
  requireAuthenticatedSession,
  requirePermission("students.read"),
  async (request: AuthenticatedRequest, response) => {
    const accessScope = await resolveReadAccessScope(request.auth!);
    const cacheKey = buildScopedTenantCacheKey(
      request.auth!,
      accessScope,
      "notifications",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await notificationsQueryService.listNotifications({
      tenantId: request.auth!.tenantId,
      scope: toQueryReadAccessScope(accessScope),
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

export { router as notificationsRouter };
