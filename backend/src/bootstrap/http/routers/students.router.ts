import express = require("express");
import { z } from "zod";
import { prismaClient } from "../../../infrastructure/database/prisma/prisma-client";
import { StudentAlreadyExistsError } from "../../../modules/students/application/services/students-command.service";
import type { StudentWriteInput } from "../../../modules/students/domain/repositories/students.repository";
import { studentOcrAutofillQuerySchema } from "../../../modules/students/presentation/rest/requests/student-ocr-autofill.request";
import { studentMutationRequestSchema } from "../../../modules/students/presentation/rest/requests/student-mutation.request";
import { mapOcrDataToStudentAutofillResponse } from "../../../modules/students/presentation/rest/responses/student-ocr-autofill.response";
import { recordMutationAudit } from "../audit";
import {
  buildScopedTenantCacheKey,
  deleteTenantReadCaches,
  readCacheJson,
  writeCacheJson,
  TENANT_CACHE_TTL_SECONDS,
} from "../cache";
import {
  isStudentVisibleForScope,
  resolveReadAccessScope,
  toQueryReadAccessScope,
} from "../access-scope";
import {
  requireAnyRole,
  requireAuthenticatedSession,
  requireCsrfProtection,
  requirePermission,
} from "../middleware";
import {
  mapOcrWorkerErrorStatusCode,
  runDocumentOcrUploadExtraction,
} from "../ocr";
import { ocrRunRateLimiter } from "../rate-limiters";
import {
  studentsCommandService,
  studentsQueryService,
} from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

const studentIdParamsSchema = z.object({
  studentId: z.string().uuid(),
});

function toStudentWriteInput(
  studentRequest: z.infer<typeof studentMutationRequestSchema>,
): StudentWriteInput {
  return {
    firstName: studentRequest.firstName,
    lastName: studentRequest.lastName,
    displayName:
      `${studentRequest.firstName} ${studentRequest.lastName}`.trim(),
    phone: studentRequest.phone,
    email: studentRequest.email ?? null,
    nationalId: studentRequest.nationalId ?? null,
    birthDate: studentRequest.birthDate
      ? new Date(`${studentRequest.birthDate}T00:00:00.000Z`)
      : null,
    address: studentRequest.address ?? null,
    educationLevel: studentRequest.educationLevel ?? null,
    parentName: studentRequest.parentName ?? null,
    parentPhone: studentRequest.parentPhone ?? null,
    parentEmail: studentRequest.parentEmail ?? null,
    parentContactStatus: studentRequest.parentContactStatus,
    status: studentRequest.status,
    enrollment: {
      categoryCode: studentRequest.enrollment.categoryCode,
      status: studentRequest.enrollment.status,
      trainingMode: studentRequest.enrollment.trainingMode,
      registerMode: studentRequest.enrollment.registerMode,
      theoryGroupNumber: studentRequest.enrollment.theoryGroupNumber ?? null,
      assignedInstructorName:
        studentRequest.enrollment.assignedInstructorName ?? null,
      enrollmentDate: new Date(
        `${studentRequest.enrollment.enrollmentDate}T00:00:00.000Z`,
      ),
      expectedArrivalDate: studentRequest.enrollment.expectedArrivalDate
        ? new Date(
            `${studentRequest.enrollment.expectedArrivalDate}T00:00:00.000Z`,
          )
        : null,
      previousLicenseCategory:
        studentRequest.enrollment.previousLicenseCategory ?? null,
      packageHours: studentRequest.enrollment.packageHours,
      additionalHours: studentRequest.enrollment.additionalHours,
      completedHours: studentRequest.enrollment.completedHours,
      failedExamAttempts: studentRequest.enrollment.failedExamAttempts,
      lastPracticeAt: studentRequest.enrollment.lastPracticeAt
        ? new Date(studentRequest.enrollment.lastPracticeAt)
        : null,
      notes: studentRequest.enrollment.notes ?? null,
    },
    initialPayment: studentRequest.initialPayment
      ? {
          amount: studentRequest.initialPayment.amount,
          paidAmount: studentRequest.initialPayment.paidAmount,
          method: studentRequest.initialPayment.method,
          status: studentRequest.initialPayment.status,
          paidAt: new Date(
            `${studentRequest.initialPayment.paidAt}T00:00:00.000Z`,
          ),
          note: studentRequest.initialPayment.note ?? null,
        }
      : null,
  };
}

router.get(
  "/students",
  requireAuthenticatedSession,
  requirePermission("students.read"),
  async (request: AuthenticatedRequest, response) => {
    const accessScope = await resolveReadAccessScope(request.auth!);
    const cacheKey = buildScopedTenantCacheKey(
      request.auth!,
      accessScope,
      "students",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await studentsQueryService.listStudents({
      tenantId: request.auth!.tenantId,
      scope: toQueryReadAccessScope(accessScope),
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.get(
  "/students/instructor-options",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer", "administration"]),
  async (request: AuthenticatedRequest, response) => {
    const items = await prismaClient.tenantMembership.findMany({
      where: {
        tenantId: request.auth!.tenantId,
        status: {
          in: ["ACTIVE", "INVITED"],
        },
        roles: {
          some: {
            role: {
              key: {
                in: ["instructor", "simulator_instructor"],
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          displayName: "asc",
        },
      },
      select: {
        id: true,
        user: {
          select: {
            displayName: true,
          },
        },
        roles: {
          select: {
            role: {
              select: {
                key: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    const instructorNames = items.map((item) => item.user.displayName);
    let assignedStudentsCountByInstructorName = new Map<string, number>();

    if (instructorNames.length > 0) {
      const rows = await prismaClient.studentEnrollment.groupBy({
        by: ["assignedInstructorName"],
        where: {
          tenantId: request.auth!.tenantId,
          assignedInstructorName: { in: instructorNames },
        },
        _count: { assignedInstructorName: true },
      });

      assignedStudentsCountByInstructorName = new Map(
        rows
          .filter(
            (row): row is (typeof rows)[number] & { assignedInstructorName: string } =>
              row.assignedInstructorName !== null,
          )
          .map((row) => [
            row.assignedInstructorName,
            row._count.assignedInstructorName,
          ]),
      );
    }

    response.status(200).json({
      items: items.map((item) => ({
        membershipId: item.id,
        displayName: item.user.displayName,
        roleKeys: item.roles.map((membershipRole) => membershipRole.role.key),
        roleLabels: item.roles.map(
          (membershipRole) => membershipRole.role.displayName,
        ),
        assignedStudentsCount:
          assignedStudentsCountByInstructorName.get(item.user.displayName) ?? 0,
      })),
    });
  },
);

router.get(
  "/students/:studentId",
  requireAuthenticatedSession,
  requirePermission("students.read"),
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = studentIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid student id." });
      return;
    }

    const accessScope = await resolveReadAccessScope(request.auth!);

    const student = await studentsQueryService.getStudentById({
      tenantId: request.auth!.tenantId,
      studentId: parsedParams.data.studentId,
      scope: toQueryReadAccessScope(accessScope),
    });

    if (!student || !isStudentVisibleForScope(student, accessScope)) {
      response.status(404).json({ error: "Student not found." });
      return;
    }

    response.status(200).json(student);
  },
);

router.post(
  "/students/ocr-autofill",
  requireAuthenticatedSession,
  requirePermission("students.create"),
  ocrRunRateLimiter,
  requireCsrfProtection,
  express.raw({
    type: ["application/pdf", "application/octet-stream", "image/*"],
    limit: "10mb",
  }),
  async (request: AuthenticatedRequest, response) => {
    const parsedQuery = studentOcrAutofillQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      response.status(400).json({
        error: "Invalid OCR upload query.",
        details: parsedQuery.error.flatten(),
      });
      return;
    }

    if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
      response.status(400).json({ error: "OCR upload body is required." });
      return;
    }

    try {
      const extraction = await runDocumentOcrUploadExtraction({
        fileName: parsedQuery.data.fileName,
        fileBuffer: request.body,
      });
      const autofill = mapOcrDataToStudentAutofillResponse(extraction.data);

      await recordMutationAudit(request, "students.ocr_autofill", {
        sourceFileName: parsedQuery.data.fileName,
        documentType: autofill.documentType,
        documentNumber: autofill.documentNumber,
        manualReviewRequired: autofill.manualReviewRequired,
      });

      response.status(200).json(autofill);
    } catch (error) {
      const statusCode = mapOcrWorkerErrorStatusCode(error);

      response.status(statusCode).json({
        error:
          statusCode === 400
            ? "The provided file is invalid for OCR processing."
            : "OCR processing failed. Please try again later.",
      });
    }
  },
);

router.post(
  "/students",
  requireAuthenticatedSession,
  requirePermission("students.create"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = studentMutationRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid student payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    if (!parsedRequest.data.portalPassword) {
      response.status(400).json({
        error:
          "Паролата за portal профила е задължителна при създаване на курсист.",
      });
      return;
    }

    try {
      const student = await studentsCommandService.createStudent({
        tenantId: request.auth!.tenantId,
        student: toStudentWriteInput(parsedRequest.data),
        portalPassword: parsedRequest.data.portalPassword,
      });

      await recordMutationAudit(request, "students.create", {
        studentId: student.id,
        studentName: student.name,
        categoryCode: student.enrollment?.categoryCode ?? null,
        portalAccessStatus: student.portalAccess?.status ?? null,
        initialPaymentAmount: parsedRequest.data.initialPayment?.amount ?? null,
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(201).json(student);
    } catch (error) {
      if (error instanceof StudentAlreadyExistsError) {
        response.status(409).json({ error: error.message });
        return;
      }

      response.status(500).json({ error: "Student creation failed." });
    }
  },
);

router.put(
  "/students/:studentId",
  requireAuthenticatedSession,
  requirePermission("students.update"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = studentIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid student id." });
      return;
    }

    const parsedRequest = studentMutationRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid student payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    if (parsedRequest.data.portalPassword) {
      response.status(400).json({
        error: "Паролата се сменя от самия курсист след вход.",
      });
      return;
    }

    try {
      const accessScope = await resolveReadAccessScope(request.auth!);

      if (
        accessScope.mode !== "tenant" &&
        !accessScope.studentIds.has(parsedParams.data.studentId)
      ) {
        response.status(404).json({ error: "Student not found." });
        return;
      }

      const student = await studentsCommandService.updateStudent({
        tenantId: request.auth!.tenantId,
        studentId: parsedParams.data.studentId,
        student: toStudentWriteInput(parsedRequest.data),
      });

      if (!student) {
        response.status(404).json({ error: "Student not found." });
        return;
      }

      await recordMutationAudit(request, "students.update", {
        studentId: student.id,
        studentName: student.name,
        categoryCode: student.enrollment?.categoryCode ?? null,
        portalAccessStatus: student.portalAccess?.status ?? null,
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(student);
    } catch (error) {
      if (error instanceof StudentAlreadyExistsError) {
        response.status(409).json({ error: error.message });
        return;
      }

      response.status(500).json({ error: "Student update failed." });
    }
  },
);

router.delete(
  "/students/:studentId",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer", "administration"]),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = studentIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid student id." });
      return;
    }

    const deleted = await studentsCommandService.deleteStudent({
      tenantId: request.auth!.tenantId,
      studentId: parsedParams.data.studentId,
    });

    if (!deleted) {
      response.status(404).json({ error: "Student not found." });
      return;
    }

    await recordMutationAudit(request, "students.delete", {
      studentId: parsedParams.data.studentId,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(204).send();
  },
);

export { router as studentsRouter };
