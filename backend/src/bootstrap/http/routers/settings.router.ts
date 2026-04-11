import express = require("express");
import {
  deleteCacheByPrefix,
  readCacheJson,
  writeCacheJson,
  TENANT_CACHE_TTL_SECONDS,
  buildTenantCacheKey,
} from "../cache";
import {
  requireAuthenticatedSession,
  requireCsrfProtection,
  requireDeveloperRole,
} from "../middleware";
import { tenantFeatureSettingsService } from "../services";
import type { AuthenticatedRequest } from "../types";
import { recordMutationAudit } from "../audit";
import { deleteTenantReadCaches } from "../cache";
import { tenantFeatureSettingsRequestSchema } from "../../../modules/settings/presentation/rest/requests/tenant-feature-settings.request";

const router = express.Router();

router.get(
  "/settings/features",
  requireAuthenticatedSession,
  async (request: AuthenticatedRequest, response) => {
    const cacheKey = buildTenantCacheKey(
      request.auth!.tenantId,
      "settings-features",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await tenantFeatureSettingsService.listSettings({
      tenantId: request.auth!.tenantId,
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.put(
  "/settings/features",
  requireAuthenticatedSession,
  requireDeveloperRole,
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = tenantFeatureSettingsRequestSchema.safeParse(
      request.body,
    );

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid settings payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const items = await tenantFeatureSettingsService.saveSettings({
      tenantId: request.auth!.tenantId,
      updatedBy: request.auth!.user.displayName,
      settings: parsedRequest.data.settings,
    });

    await recordMutationAudit(request, "settings.features.update", {
      settingsCount: items.length,
      featureKeys: items.map((item) => item.key),
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(200).json({ items });
  },
);

export { router as settingsRouter };
