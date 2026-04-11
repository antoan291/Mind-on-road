import express = require("express");
import { ExamApplicationValidationError } from "../../../modules/exam-applications/application/services/exam-applications-command.service";
import {
  examApplicationGenerateRequestSchema,
  examApplicationIdParamsSchema,
  examApplicationStatusUpdateRequestSchema,
} from "../../../modules/exam-applications/presentation/rest/requests/exam-application-write.request";
import { recordMutationAudit } from "../audit";
import {
  buildTenantCacheKey,
  deleteTenantReadCaches,
  readCacheJson,
  writeCacheJson,
  TENANT_CACHE_TTL_SECONDS,
} from "../cache";
import {
  requireAuthenticatedSession,
  requireCsrfProtection,
  requirePermission,
} from "../middleware";
import {
  examApplicationsCommandService,
  examApplicationsQueryService,
} from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.get(
  "/exam-applications",
  requireAuthenticatedSession,
  requirePermission("students.manage_register"),
  async (request: AuthenticatedRequest, response) => {
    const cacheKey = buildTenantCacheKey(
      request.auth!.tenantId,
      "exam-applications",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await examApplicationsQueryService.listExamApplications({
      tenantId: request.auth!.tenantId,
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.post(
  "/exam-applications/generate",
  requireAuthenticatedSession,
  requirePermission("students.manage_register"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = examApplicationGenerateRequestSchema.safeParse(
      request.body,
    );

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid exam application generation payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const application =
      await examApplicationsCommandService.generateApplication({
        tenantId: request.auth!.tenantId,
        studentId: parsedRequest.data.studentId,
        actorName: request.auth!.user.displayName,
      });

    if (!application) {
      response.status(404).json({
        error: "Student or enrollment not found for exam application.",
      });
      return;
    }

    await recordMutationAudit(request, "exam_applications.generate", {
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      studentId: application.studentId,
      status: application.status,
      missingRequirementsCount: application.missingRequirements.length,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(201).json(application);
  },
);

router.put(
  "/exam-applications/:applicationId",
  requireAuthenticatedSession,
  requirePermission("students.manage_register"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = examApplicationIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid exam application id." });
      return;
    }

    const parsedRequest = examApplicationStatusUpdateRequestSchema.safeParse(
      request.body,
    );

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid exam application status payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    try {
      const application =
        await examApplicationsCommandService.updateApplicationStatus({
          tenantId: request.auth!.tenantId,
          applicationId: parsedParams.data.applicationId,
          status: parsedRequest.data.status,
          statusNote: parsedRequest.data.statusNote ?? null,
          actorName: request.auth!.user.displayName,
        });

      if (!application) {
        response.status(404).json({ error: "Exam application not found." });
        return;
      }

      await recordMutationAudit(request, "exam_applications.update_status", {
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
        studentId: application.studentId,
        status: application.status,
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(application);
    } catch (error) {
      if (error instanceof ExamApplicationValidationError) {
        response.status(409).json({ error: error.message });
        return;
      }

      throw error;
    }
  },
);

export { router as examApplicationsRouter };
