import express = require("express");
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { z } from "zod";
import { documentOcrRunRequestSchema } from "../../../modules/documents/presentation/rest/requests/document-ocr.request";
import {
  documentIdParamsSchema,
  documentWriteRequestSchema,
} from "../../../modules/documents/presentation/rest/requests/document-write.request";
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
  requireAnyRole,
  requireAuthenticatedSession,
  requireCsrfProtection,
  requirePermission,
} from "../middleware";
import {
  extractOcrField,
  listDocumentOcrExtractions,
  listDocumentOcrSourceFiles,
  mapOcrWorkerErrorStatusCode,
  runDocumentOcrExtraction,
} from "../ocr";
import { ocrRunRateLimiter } from "../rate-limiters";
import { documentsCommandService, documentsQueryService } from "../services";
import type { AuthenticatedRequest } from "../types";

export const localDocumentUploadRoot = resolve(process.cwd(), "storage", "uploads");

const router = express.Router();

const documentFileUploadQuerySchema = z.object({
  fileName: z.string().trim().min(1).max(255),
});

router.get(
  "/documents",
  requireAuthenticatedSession,
  requirePermission("documents.read"),
  async (request: AuthenticatedRequest, response) => {
    const accessScope = await resolveReadAccessScope(request.auth!);
    const cacheKey = buildScopedTenantCacheKey(
      request.auth!,
      accessScope,
      "documents",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await documentsQueryService.listDocuments({
      tenantId: request.auth!.tenantId,
      scope: toQueryReadAccessScope(accessScope),
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.get(
  "/documents/ocr-extractions",
  requireAuthenticatedSession,
  requirePermission("documents.read"),
  async (_request: AuthenticatedRequest, response) => {
    const items = await listDocumentOcrExtractions();
    response.status(200).json({ items });
  },
);

router.get(
  "/documents/ocr-source-files",
  requireAuthenticatedSession,
  requirePermission("documents.read"),
  async (_request: AuthenticatedRequest, response) => {
    const items = await listDocumentOcrSourceFiles();
    response.status(200).json({ items });
  },
);

router.post(
  "/documents/upload",
  requireAuthenticatedSession,
  requirePermission("documents.manage"),
  requireCsrfProtection,
  express.raw({
    type: ["application/pdf", "application/octet-stream", "image/*"],
    limit: "15mb",
  }),
  async (request: AuthenticatedRequest, response) => {
    const parsedQuery = documentFileUploadQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      response.status(400).json({
        error: "Invalid document upload query.",
        details: parsedQuery.error.flatten(),
      });
      return;
    }

    if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
      response.status(400).json({ error: "Document file body is required." });
      return;
    }

    const originalFileName = parsedQuery.data.fileName.trim();
    const fileExt = extname(originalFileName).toLowerCase() || ".bin";
    const safeBaseName =
      originalFileName
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "document";
    const contentHash = createHash("sha256")
      .update(request.body)
      .digest("hex")
      .slice(0, 16);
    const relativePath = `documents/${request.auth!.tenantId}/${Date.now()}-${contentHash}-${safeBaseName}${fileExt}`;
    const absolutePath = resolve(localDocumentUploadRoot, relativePath);

    await mkdir(resolve(absolutePath, ".."), { recursive: true });
    await writeFile(absolutePath, request.body);

    response.status(201).json({
      fileName: originalFileName,
      fileUrl: `/uploads/${relativePath}`,
    });
  },
);

router.post(
  "/documents/ocr-extractions/run",
  requireAuthenticatedSession,
  requirePermission("documents.manage"),
  ocrRunRateLimiter,
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = documentOcrRunRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid OCR extraction payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    try {
      const extraction = await runDocumentOcrExtraction(
        parsedRequest.data.sourceFileName,
      );

      await recordMutationAudit(request, "documents.ocr_extract", {
        sourceFileName: parsedRequest.data.sourceFileName,
        outputFileName: extraction.outputFileName,
        documentType: extractOcrField(extraction.data, "тип_документ"),
        documentNumber:
          extractOcrField(extraction.data, "номер_на_документа") ||
          extractOcrField(extraction.data, "номер_на_документ"),
      });

      response.status(201).json(extraction);
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
  "/documents",
  requireAuthenticatedSession,
  requirePermission("documents.manage"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = documentWriteRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid document payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const docAccessScope = await resolveReadAccessScope(request.auth!);
    if (
      parsedRequest.data.studentId &&
      docAccessScope.mode !== "tenant" &&
      !docAccessScope.studentIds.has(parsedRequest.data.studentId)
    ) {
      response.status(403).json({ error: "Forbidden." });
      return;
    }

    const document = await documentsCommandService.createDocument({
      tenantId: request.auth!.tenantId,
      document: {
        studentId: parsedRequest.data.studentId ?? null,
        name: parsedRequest.data.name,
        ownerType: parsedRequest.data.ownerType,
        ownerName: parsedRequest.data.ownerName,
        ownerRef: parsedRequest.data.ownerRef ?? null,
        category: parsedRequest.data.category,
        documentNo: parsedRequest.data.documentNo ?? null,
        issueDate: new Date(`${parsedRequest.data.issueDate}T00:00:00.000Z`),
        expiryDate: parsedRequest.data.expiryDate
          ? new Date(`${parsedRequest.data.expiryDate}T00:00:00.000Z`)
          : null,
        status: parsedRequest.data.status,
        fileUrl: parsedRequest.data.fileUrl ?? null,
        notes: parsedRequest.data.notes ?? null,
      },
    });

    if (!document) {
      response.status(404).json({
        error: "Document owner student not found.",
      });
      return;
    }

    await recordMutationAudit(request, "documents.create", {
      documentId: document.id,
      studentId: document.studentId,
      ownerType: document.ownerType,
      ownerName: document.ownerName,
      status: document.status,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(201).json(document);
  },
);

router.put(
  "/documents/:documentId",
  requireAuthenticatedSession,
  requirePermission("documents.manage"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = documentIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid document id." });
      return;
    }

    const parsedRequest = documentWriteRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid document payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const document = await documentsCommandService.updateDocument({
      tenantId: request.auth!.tenantId,
      documentId: parsedParams.data.documentId,
      document: {
        studentId: parsedRequest.data.studentId ?? null,
        name: parsedRequest.data.name,
        ownerType: parsedRequest.data.ownerType,
        ownerName: parsedRequest.data.ownerName,
        ownerRef: parsedRequest.data.ownerRef ?? null,
        category: parsedRequest.data.category,
        documentNo: parsedRequest.data.documentNo ?? null,
        issueDate: new Date(`${parsedRequest.data.issueDate}T00:00:00.000Z`),
        expiryDate: parsedRequest.data.expiryDate
          ? new Date(`${parsedRequest.data.expiryDate}T00:00:00.000Z`)
          : null,
        status: parsedRequest.data.status,
        fileUrl: parsedRequest.data.fileUrl ?? null,
        notes: parsedRequest.data.notes ?? null,
      },
    });

    if (!document) {
      response.status(404).json({
        error: "Document or owner student not found.",
      });
      return;
    }

    await recordMutationAudit(request, "documents.update", {
      documentId: document.id,
      studentId: document.studentId,
      ownerType: document.ownerType,
      ownerName: document.ownerName,
      status: document.status,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(200).json(document);
  },
);

router.delete(
  "/documents/:documentId",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer", "administration"]),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = documentIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid document id." });
      return;
    }

    const deleted = await documentsCommandService.deleteDocument({
      tenantId: request.auth!.tenantId,
      documentId: parsedParams.data.documentId,
    });

    if (!deleted) {
      response.status(404).json({ error: "Document not found." });
      return;
    }

    await recordMutationAudit(request, "documents.delete", {
      documentId: parsedParams.data.documentId,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(204).send();
  },
);

export { router as documentsRouter };
