import express = require("express");
import {
  invoiceCreateRequestSchema,
  invoiceIdParamsSchema,
  invoiceUpdateRequestSchema,
} from "../../../modules/invoicing/presentation/rest/requests/invoice-write.request";
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
import { invoicesCommandService, invoicesQueryService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.get(
  "/invoices",
  requireAuthenticatedSession,
  requirePermission("invoices.read"),
  async (request: AuthenticatedRequest, response) => {
    const accessScope = await resolveReadAccessScope(request.auth!);
    const cacheKey = buildScopedTenantCacheKey(
      request.auth!,
      accessScope,
      "invoices",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await invoicesQueryService.listInvoices({
      tenantId: request.auth!.tenantId,
      scope: toQueryReadAccessScope(accessScope),
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.post(
  "/invoices",
  requireAuthenticatedSession,
  requirePermission("payments.record"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = invoiceCreateRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid invoice payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const invoiceNumber =
      parsedRequest.data.invoiceNumber ??
      `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now()
        .toString()
        .slice(-6)}`;
    const subtotalAmount = Math.round(parsedRequest.data.totalAmount / 1.2);
    const vatAmount = parsedRequest.data.totalAmount - subtotalAmount;

    const invoice = await invoicesCommandService.createInvoice({
      tenantId: request.auth!.tenantId,
      invoice: {
        studentId: parsedRequest.data.studentId,
        invoiceNumber,
        invoiceDate: new Date(
          `${parsedRequest.data.invoiceDate}T00:00:00.000Z`,
        ),
        recipientName: parsedRequest.data.recipientName,
        categoryCode: parsedRequest.data.categoryCode,
        invoiceReason: parsedRequest.data.invoiceReason,
        packageType: parsedRequest.data.packageType,
        totalAmount: parsedRequest.data.totalAmount,
        currency: "EUR",
        status: parsedRequest.data.status,
        paymentLinkStatus: parsedRequest.data.paymentLinkStatus,
        paymentNumber: parsedRequest.data.paymentNumber ?? null,
        paymentStatus: parsedRequest.data.paymentStatus ?? null,
        createdBy: request.auth!.user.displayName,
        createdDate: new Date(
          `${parsedRequest.data.invoiceDate}T00:00:00.000Z`,
        ),
        lastUpdatedBy: request.auth!.user.displayName,
        notes: parsedRequest.data.notes ?? null,
        issuedDate: parsedRequest.data.issuedDate
          ? new Date(`${parsedRequest.data.issuedDate}T00:00:00.000Z`)
          : null,
        dueDate: parsedRequest.data.dueDate
          ? new Date(`${parsedRequest.data.dueDate}T00:00:00.000Z`)
          : null,
        vatAmount,
        subtotalAmount,
        wasCorrected: false,
        correctionReason: null,
      },
    });

    if (!invoice) {
      response.status(404).json({ error: "Invoice student not found." });
      return;
    }

    await recordMutationAudit(request, "invoices.create", {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      studentId: invoice.studentId,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(201).json(invoice);
  },
);

router.put(
  "/invoices/:invoiceId",
  requireAuthenticatedSession,
  requirePermission("payments.record"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = invoiceIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid invoice id." });
      return;
    }

    const parsedRequest = invoiceUpdateRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid invoice payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const subtotalAmount =
      parsedRequest.data.totalAmount === undefined
        ? undefined
        : Math.round(parsedRequest.data.totalAmount / 1.2);
    const vatAmount =
      parsedRequest.data.totalAmount === undefined ||
      subtotalAmount === undefined
        ? undefined
        : parsedRequest.data.totalAmount - subtotalAmount;
    const issuedDate =
      parsedRequest.data.issuedDate === undefined
        ? undefined
        : parsedRequest.data.issuedDate === null
          ? null
          : new Date(`${parsedRequest.data.issuedDate}T00:00:00.000Z`);
    const dueDate =
      parsedRequest.data.dueDate === undefined
        ? undefined
        : parsedRequest.data.dueDate === null
          ? null
          : new Date(`${parsedRequest.data.dueDate}T00:00:00.000Z`);

    const invoice = await invoicesCommandService.updateInvoice({
      tenantId: request.auth!.tenantId,
      invoiceId: parsedParams.data.invoiceId,
      invoice: {
        invoiceDate: parsedRequest.data.invoiceDate
          ? new Date(`${parsedRequest.data.invoiceDate}T00:00:00.000Z`)
          : undefined,
        recipientName: parsedRequest.data.recipientName,
        categoryCode: parsedRequest.data.categoryCode,
        invoiceReason: parsedRequest.data.invoiceReason,
        packageType: parsedRequest.data.packageType,
        totalAmount: parsedRequest.data.totalAmount,
        status: parsedRequest.data.status,
        paymentLinkStatus: parsedRequest.data.paymentLinkStatus,
        paymentNumber: parsedRequest.data.paymentNumber ?? undefined,
        paymentStatus: parsedRequest.data.paymentStatus ?? undefined,
        lastUpdatedBy: request.auth!.user.displayName,
        notes: parsedRequest.data.notes ?? undefined,
        issuedDate,
        dueDate,
        vatAmount,
        subtotalAmount,
        wasCorrected: parsedRequest.data.wasCorrected,
        correctionReason: parsedRequest.data.correctionReason ?? undefined,
      },
    });

    if (!invoice) {
      response.status(404).json({ error: "Invoice not found." });
      return;
    }

    await recordMutationAudit(request, "invoices.update", {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      studentId: invoice.studentId,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      wasCorrected: invoice.wasCorrected,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(200).json(invoice);
  },
);

router.delete(
  "/invoices/:invoiceId",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer", "administration"]),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = invoiceIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid invoice id." });
      return;
    }

    const deleted = await invoicesCommandService.deleteInvoice({
      tenantId: request.auth!.tenantId,
      invoiceId: parsedParams.data.invoiceId,
    });

    if (!deleted) {
      response.status(404).json({ error: "Invoice not found." });
      return;
    }

    await recordMutationAudit(request, "invoices.delete", {
      invoiceId: parsedParams.data.invoiceId,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(204).send();
  },
);

export { router as invoicesRouter };
