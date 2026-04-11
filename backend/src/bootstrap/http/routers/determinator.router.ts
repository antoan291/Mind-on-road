import express = require("express");
import {
  determinatorSessionRequestSchema,
  determinatorSessionsQuerySchema,
} from "../../../modules/students/presentation/rest/requests/determinator-session.request";
import { recordMutationAudit } from "../audit";
import {
  buildScopedTenantCacheKey,
  deleteCacheByPrefix,
  buildTenantCacheKey,
  readCacheJson,
  writeCacheJson,
  TENANT_CACHE_TTL_SECONDS,
} from "../cache";
import {
  resolveReadAccessScope,
  toQueryReadAccessScope,
} from "../access-scope";
import {
  requireAnyRole,
  requireAuthenticatedSession,
  requireCsrfProtection,
} from "../middleware";
import { studentsDeterminatorService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.get(
  "/determinator/sessions",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer", "administration"]),
  async (request: AuthenticatedRequest, response) => {
    const parsedQuery = determinatorSessionsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      response.status(400).json({ error: "Invalid determinator query." });
      return;
    }

    const accessScope = await resolveReadAccessScope(request.auth!);
    const cacheKey = buildScopedTenantCacheKey(
      request.auth!,
      accessScope,
      `determinator:${parsedQuery.data.studentId ?? "all"}`,
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await studentsDeterminatorService.listSessions({
      tenantId: request.auth!.tenantId,
      studentId: parsedQuery.data.studentId,
      scope: toQueryReadAccessScope(accessScope),
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.post(
  "/determinator/sessions",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer", "administration"]),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = determinatorSessionRequestSchema.safeParse(
      request.body,
    );

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid determinator payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const accessScope = await resolveReadAccessScope(request.auth!);

    if (
      accessScope.mode !== "tenant" &&
      !accessScope.studentIds.has(parsedRequest.data.studentId)
    ) {
      response.status(404).json({ error: "Student not found." });
      return;
    }

    const session = await studentsDeterminatorService.createSession({
      tenantId: request.auth!.tenantId,
      session: {
        ...parsedRequest.data,
        overallResult: parsedRequest.data.overallResult ?? null,
        instructorNote: parsedRequest.data.instructorNote ?? null,
      },
    });

    if (!session) {
      response.status(404).json({ error: "Student not found." });
      return;
    }

    await recordMutationAudit(request, "determinator.sessions.create", {
      determinatorSessionId: session.id,
      studentId: session.studentId,
      studentName: session.studentName,
      registrationNumber: session.registrationNumber,
    });
    await deleteCacheByPrefix(
      buildTenantCacheKey(request.auth!.tenantId, "determinator"),
    );

    response.status(201).json(session);
  },
);

export { router as determinatorRouter };
