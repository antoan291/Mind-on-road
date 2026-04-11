import express = require("express");
import {
  vehicleCreateRequestSchema,
  vehicleIdParamsSchema,
  vehicleUpdateRequestSchema,
} from "../../../modules/vehicles/presentation/rest/requests/vehicle-write.request";
import { recordMutationAudit } from "../audit";
import {
  buildScopedTenantCacheKey,
  deleteTenantReadCaches,
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
  requireCsrfProtection,
  requirePermission,
} from "../middleware";
import { vehiclesCommandService, vehiclesQueryService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.get(
  "/vehicles",
  requireAuthenticatedSession,
  requirePermission("vehicles.read"),
  async (request: AuthenticatedRequest, response) => {
    const accessScope = await resolveReadAccessScope(request.auth!);
    const cacheKey = buildScopedTenantCacheKey(
      request.auth!,
      accessScope,
      "vehicles",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await vehiclesQueryService.listVehicles({
      tenantId: request.auth!.tenantId,
      scope: toQueryReadAccessScope(accessScope),
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.post(
  "/vehicles",
  requireAuthenticatedSession,
  requirePermission("scheduling.manage"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = vehicleCreateRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid vehicle payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const vehicle = await vehiclesCommandService.createVehicle({
      tenantId: request.auth!.tenantId,
      vehicle: {
        vehicleLabel: parsedRequest.data.vehicleLabel,
        instructorName: parsedRequest.data.instructorName,
        categoryCode: parsedRequest.data.categoryCode,
        status: parsedRequest.data.status,
        nextInspection: new Date(
          `${parsedRequest.data.nextInspection}T00:00:00.000Z`,
        ),
        activeLessons: parsedRequest.data.activeLessons,
        operationalNote: parsedRequest.data.operationalNote,
      },
    });

    await recordMutationAudit(request, "vehicles.create", {
      vehicleId: vehicle.id,
      vehicleLabel: vehicle.vehicleLabel,
      instructorName: vehicle.instructorName,
      status: vehicle.status,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(201).json(vehicle);
  },
);

router.put(
  "/vehicles/:vehicleId",
  requireAuthenticatedSession,
  requirePermission("scheduling.manage"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = vehicleIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid vehicle id." });
      return;
    }

    const parsedRequest = vehicleUpdateRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid vehicle payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const vehicle = await vehiclesCommandService.updateVehicle({
      tenantId: request.auth!.tenantId,
      vehicleId: parsedParams.data.vehicleId,
      vehicle: {
        vehicleLabel: parsedRequest.data.vehicleLabel,
        instructorName: parsedRequest.data.instructorName,
        categoryCode: parsedRequest.data.categoryCode,
        status: parsedRequest.data.status,
        nextInspection: parsedRequest.data.nextInspection
          ? new Date(`${parsedRequest.data.nextInspection}T00:00:00.000Z`)
          : undefined,
        activeLessons: parsedRequest.data.activeLessons,
        operationalNote: parsedRequest.data.operationalNote,
      },
    });

    if (!vehicle) {
      response.status(404).json({ error: "Vehicle not found." });
      return;
    }

    await recordMutationAudit(request, "vehicles.update", {
      vehicleId: vehicle.id,
      vehicleLabel: vehicle.vehicleLabel,
      instructorName: vehicle.instructorName,
      status: vehicle.status,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(200).json(vehicle);
  },
);

export { router as vehiclesRouter };
