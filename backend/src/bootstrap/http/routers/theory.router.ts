import express = require("express");
import { TheoryGroupDuplicateDaiCodeError } from "../../../modules/theory/domain/theory-groups.errors";
import {
  theoryAttendanceSaveParamsSchema,
  theoryAttendanceSaveRequestSchema,
} from "../../../modules/theory/presentation/rest/requests/theory-attendance-save.request";
import { theoryGroupCreateRequestSchema } from "../../../modules/theory/presentation/rest/requests/theory-group-create.request";
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
import { theoryGroupsCommandService, theoryGroupsQueryService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.get(
  "/theory/groups",
  requireAuthenticatedSession,
  requirePermission("scheduling.read"),
  async (request: AuthenticatedRequest, response) => {
    const accessScope = await resolveReadAccessScope(request.auth!);
    const cacheKey = buildScopedTenantCacheKey(
      request.auth!,
      accessScope,
      "theory-groups",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await theoryGroupsQueryService.listGroups({
      tenantId: request.auth!.tenantId,
      scope: toQueryReadAccessScope(accessScope),
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.post(
  "/theory/groups",
  requireAuthenticatedSession,
  requireCsrfProtection,
  requirePermission("scheduling.manage"),
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = theoryGroupCreateRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid theory group payload.",
        issues: parsedRequest.error.flatten(),
      });
      return;
    }

    try {
      const group = await theoryGroupsCommandService.createGroup({
        tenantId: request.auth!.tenantId,
        group: {
          ...parsedRequest.data,
          endDate: parsedRequest.data.endDate ?? null,
        },
      });

      await recordMutationAudit(request, "theory.groups.create", {
        theoryGroupId: group.id,
        daiCode: group.daiCode,
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(201).json({ item: group });
    } catch (error) {
      if (error instanceof TheoryGroupDuplicateDaiCodeError) {
        response.status(409).json({
          error: "Вече има теоретична група с този ДАИ код.",
        });
        return;
      }

      throw error;
    }
  },
);

router.put(
  "/theory/groups/:theoryGroupId/lectures/:theoryLectureId/attendance",
  requireAuthenticatedSession,
  requirePermission("scheduling.manage"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = theoryAttendanceSaveParamsSchema.safeParse(
      request.params,
    );

    if (!parsedParams.success) {
      response.status(400).json({
        error: "Invalid theory group or lecture id.",
      });
      return;
    }

    const parsedRequest = theoryAttendanceSaveRequestSchema.safeParse(
      request.body,
    );

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid theory attendance payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const group = await theoryGroupsCommandService.saveLectureAttendance({
      tenantId: request.auth!.tenantId,
      theoryGroupId: parsedParams.data.theoryGroupId,
      theoryLectureId: parsedParams.data.theoryLectureId,
      attendanceRecords: parsedRequest.data.attendanceRecords,
      markedBy: request.auth!.user.displayName,
    });

    if (!group) {
      response.status(404).json({
        error: "Theory group, lecture, or student not found.",
      });
      return;
    }

    await recordMutationAudit(request, "theory.attendance.save", {
      theoryGroupId: group.id,
      theoryLectureId: parsedParams.data.theoryLectureId,
      attendanceCount: parsedRequest.data.attendanceRecords.length,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(200).json(group);
  },
);

export { router as theoryRouter };
