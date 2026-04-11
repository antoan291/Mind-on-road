import express = require("express");
import { z } from "zod";
import {
  PracticalLessonInstructorScheduleConflictError,
  PracticalLessonStudentScheduleConflictError,
  PracticalLessonVehicleScheduleConflictError,
} from "../../../modules/practice/domain/practical-lessons.errors";
import { practicalLessonCreateRequestSchema } from "../../../modules/practice/presentation/rest/requests/practical-lesson-create.request";
import { practicalLessonParentFeedbackRequestSchema } from "../../../modules/practice/presentation/rest/requests/practical-lesson-parent-feedback.request";
import { practicalLessonStudentFeedbackRequestSchema } from "../../../modules/practice/presentation/rest/requests/practical-lesson-feedback.request";
import { practicalLessonUpdateRequestSchema } from "../../../modules/practice/presentation/rest/requests/practical-lesson-update.request";
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
import {
  practicalLessonsCommandService,
  practicalLessonsQueryService,
} from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

const lessonIdParamsSchema = z.object({
  lessonId: z.string().uuid(),
});

router.get(
  "/practical-lessons",
  requireAuthenticatedSession,
  requirePermission("scheduling.read"),
  async (request: AuthenticatedRequest, response) => {
    const accessScope = await resolveReadAccessScope(request.auth!);
    const cacheKey = buildScopedTenantCacheKey(
      request.auth!,
      accessScope,
      "practical-lessons",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await practicalLessonsQueryService.listLessons({
      tenantId: request.auth!.tenantId,
      scope: toQueryReadAccessScope(accessScope),
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.post(
  "/practical-lessons",
  requireAuthenticatedSession,
  requirePermission("scheduling.manage"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = practicalLessonCreateRequestSchema.safeParse(
      request.body,
    );

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid practical lesson payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const accessScope = await resolveReadAccessScope(request.auth!);

    if (
      accessScope.mode === "student" ||
      accessScope.mode === "parent" ||
      (accessScope.mode === "instructor" &&
        !accessScope.studentIds.has(parsedRequest.data.studentId))
    ) {
      response.status(403).json({ error: "Forbidden." });
      return;
    }

    let lesson;

    try {
      lesson = await practicalLessonsCommandService.createLesson({
        tenantId: request.auth!.tenantId,
        lesson: {
          ...parsedRequest.data,
          lessonDate: new Date(
            `${parsedRequest.data.lessonDate}T00:00:00.000Z`,
          ),
          parentFeedbackRating: null,
          parentFeedbackComment: null,
          parentFeedbackSubmittedAt: null,
          createdBy: request.auth!.user.displayName,
          updatedBy: request.auth!.user.displayName,
        },
      });
    } catch (error) {
      if (
        error instanceof PracticalLessonStudentScheduleConflictError ||
        error instanceof PracticalLessonInstructorScheduleConflictError ||
        error instanceof PracticalLessonVehicleScheduleConflictError
      ) {
        response.status(409).json({ error: error.message });
        return;
      }

      throw error;
    }

    if (!lesson) {
      response.status(404).json({
        error: "Student not found for practical lesson.",
      });
      return;
    }

    await recordMutationAudit(request, "practical_lessons.create", {
      lessonId: lesson.id,
      studentId: lesson.studentId,
      studentName: lesson.studentName,
      instructorName: lesson.instructorName,
      vehicleLabel: lesson.vehicleLabel,
      lessonDate: lesson.lessonDate,
      startTimeLabel: lesson.startTimeLabel,
      endTimeLabel: lesson.endTimeLabel,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(201).json(lesson);
  },
);

router.put(
  "/practical-lessons/:lessonId",
  requireAuthenticatedSession,
  requirePermission("scheduling.manage"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = lessonIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid practical lesson id." });
      return;
    }

    const parsedRequest = practicalLessonUpdateRequestSchema.safeParse(
      request.body,
    );

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid practical lesson payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const accessScope = await resolveReadAccessScope(request.auth!);

    if (accessScope.mode !== "tenant") {
      const visibleLesson = (
        await practicalLessonsQueryService.listLessons({
          tenantId: request.auth!.tenantId,
          scope: toQueryReadAccessScope(accessScope),
        })
      ).find((lessonItem) => lessonItem.id === parsedParams.data.lessonId);

      if (!visibleLesson) {
        response.status(404).json({ error: "Practical lesson not found." });
        return;
      }

      if (
        accessScope.mode === "instructor" &&
        parsedRequest.data.instructorName &&
        parsedRequest.data.instructorName !== accessScope.instructorName
      ) {
        response.status(403).json({ error: "Forbidden." });
        return;
      }
    }

    let lesson;

    try {
      lesson = await practicalLessonsCommandService.updateLesson({
        tenantId: request.auth!.tenantId,
        lessonId: parsedParams.data.lessonId,
        lesson: {
          ...parsedRequest.data,
          lessonDate: parsedRequest.data.lessonDate
            ? new Date(`${parsedRequest.data.lessonDate}T00:00:00.000Z`)
            : undefined,
          studentFeedbackSubmittedAt:
            parsedRequest.data.studentFeedbackSubmittedAt === undefined
              ? undefined
              : parsedRequest.data.studentFeedbackSubmittedAt === null
                ? null
                : new Date(parsedRequest.data.studentFeedbackSubmittedAt),
          parentFeedbackSubmittedAt:
            parsedRequest.data.parentFeedbackSubmittedAt === undefined
              ? undefined
              : parsedRequest.data.parentFeedbackSubmittedAt === null
                ? null
                : new Date(parsedRequest.data.parentFeedbackSubmittedAt),
          updatedBy: request.auth!.user.displayName,
        },
      });
    } catch (error) {
      if (
        error instanceof PracticalLessonStudentScheduleConflictError ||
        error instanceof PracticalLessonInstructorScheduleConflictError ||
        error instanceof PracticalLessonVehicleScheduleConflictError
      ) {
        response.status(409).json({ error: error.message });
        return;
      }

      throw error;
    }

    if (!lesson) {
      response.status(404).json({ error: "Practical lesson not found." });
      return;
    }

    await recordMutationAudit(request, "practical_lessons.update", {
      lessonId: lesson.id,
      studentId: lesson.studentId,
      studentName: lesson.studentName,
      instructorName: lesson.instructorName,
      vehicleLabel: lesson.vehicleLabel,
      status: lesson.status,
      paymentStatus: lesson.paymentStatus,
      evaluationStatus: lesson.evaluationStatus,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(200).json(lesson);
  },
);

router.post(
  "/practical-lessons/:lessonId/parent-feedback",
  requireAuthenticatedSession,
  requirePermission("scheduling.read"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    if (!request.auth!.user.roleKeys.includes("parent")) {
      response.status(403).json({ error: "Forbidden." });
      return;
    }

    const parsedParams = lessonIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid practical lesson id." });
      return;
    }

    const parsedRequest =
      practicalLessonParentFeedbackRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid parent feedback payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const accessScope = await resolveReadAccessScope(request.auth!);
    const visibleLesson = (
      await practicalLessonsQueryService.listLessons({
        tenantId: request.auth!.tenantId,
        scope: toQueryReadAccessScope(accessScope),
      })
    ).find((lessonItem) => lessonItem.id === parsedParams.data.lessonId);

    if (!visibleLesson) {
      response.status(404).json({ error: "Practical lesson not found." });
      return;
    }

    if (visibleLesson.status !== "COMPLETED") {
      response.status(409).json({
        error: "Parent feedback can only be submitted for completed lessons.",
      });
      return;
    }

    const lesson = await practicalLessonsCommandService.updateLesson({
      tenantId: request.auth!.tenantId,
      lessonId: parsedParams.data.lessonId,
      lesson: {
        parentFeedbackRating: parsedRequest.data.parentFeedbackRating,
        parentFeedbackComment: parsedRequest.data.parentFeedbackComment,
        parentFeedbackSubmittedAt: new Date(),
        updatedBy: request.auth!.user.displayName,
      },
    });

    if (!lesson) {
      response.status(404).json({ error: "Practical lesson not found." });
      return;
    }

    await recordMutationAudit(request, "practical_lessons.parent_feedback", {
      lessonId: lesson.id,
      studentId: lesson.studentId,
      parentFeedbackRating: lesson.parentFeedbackRating,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(200).json(lesson);
  },
);

router.post(
  "/practical-lessons/:lessonId/student-feedback",
  requireAuthenticatedSession,
  requirePermission("scheduling.read"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    if (!request.auth!.user.roleKeys.includes("student")) {
      response.status(403).json({ error: "Forbidden." });
      return;
    }

    const parsedParams = lessonIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid practical lesson id." });
      return;
    }

    const parsedRequest =
      practicalLessonStudentFeedbackRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid student feedback payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const accessScope = await resolveReadAccessScope(request.auth!);
    const visibleLesson = (
      await practicalLessonsQueryService.listLessons({
        tenantId: request.auth!.tenantId,
        scope: toQueryReadAccessScope(accessScope),
      })
    ).find((lessonItem) => lessonItem.id === parsedParams.data.lessonId);

    if (!visibleLesson) {
      response.status(404).json({ error: "Practical lesson not found." });
      return;
    }

    if (visibleLesson.status !== "COMPLETED") {
      response.status(409).json({
        error: "Student feedback can only be submitted for completed lessons.",
      });
      return;
    }

    const lesson = await practicalLessonsCommandService.updateLesson({
      tenantId: request.auth!.tenantId,
      lessonId: parsedParams.data.lessonId,
      lesson: {
        studentFeedbackRating: parsedRequest.data.studentFeedbackRating,
        studentFeedbackComment: parsedRequest.data.studentFeedbackComment,
        studentFeedbackSubmittedAt: new Date(),
        updatedBy: request.auth!.user.displayName,
      },
    });

    if (!lesson) {
      response.status(404).json({ error: "Practical lesson not found." });
      return;
    }

    await recordMutationAudit(request, "practical_lessons.student_feedback", {
      lessonId: lesson.id,
      studentId: lesson.studentId,
      studentFeedbackRating: lesson.studentFeedbackRating,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(200).json(lesson);
  },
);

router.delete(
  "/practical-lessons/:lessonId",
  requireAuthenticatedSession,
  requirePermission("scheduling.manage"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = lessonIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid practical lesson id." });
      return;
    }

    const accessScope = await resolveReadAccessScope(request.auth!);

    if (accessScope.mode !== "tenant") {
      const visibleLesson = (
        await practicalLessonsQueryService.listLessons({
          tenantId: request.auth!.tenantId,
          scope: toQueryReadAccessScope(accessScope),
        })
      ).find((lessonItem) => lessonItem.id === parsedParams.data.lessonId);

      if (!visibleLesson) {
        response.status(404).json({ error: "Practical lesson not found." });
        return;
      }
    }

    const deleted = await practicalLessonsCommandService.deleteLesson({
      tenantId: request.auth!.tenantId,
      lessonId: parsedParams.data.lessonId,
    });

    if (!deleted) {
      response.status(404).json({ error: "Practical lesson not found." });
      return;
    }

    await recordMutationAudit(request, "practical_lessons.delete", {
      lessonId: parsedParams.data.lessonId,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(204).send();
  },
);

export { router as practicalLessonsRouter };
