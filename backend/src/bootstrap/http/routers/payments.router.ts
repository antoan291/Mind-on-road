import express = require("express");
import { z } from "zod";
import { paymentCreateRequestSchema } from "../../../modules/payments/presentation/rest/requests/payment-write.request";
import {
  paymentIdParamsSchema,
  paymentUpdateRequestSchema,
} from "../../../modules/payments/presentation/rest/requests/payment-write.request";
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
import { paymentsCommandService, paymentsQueryService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.get(
  "/payments",
  requireAuthenticatedSession,
  requirePermission("payments.read"),
  async (request: AuthenticatedRequest, response) => {
    const accessScope = await resolveReadAccessScope(request.auth!);
    const cacheKey = buildScopedTenantCacheKey(
      request.auth!,
      accessScope,
      "payments",
    );
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await paymentsQueryService.listPayments({
      tenantId: request.auth!.tenantId,
      scope: toQueryReadAccessScope(accessScope),
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.post(
  "/payments",
  requireAuthenticatedSession,
  requirePermission("payments.record"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = paymentCreateRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid payment payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const paymentAccessScope = await resolveReadAccessScope(request.auth!);
    if (
      paymentAccessScope.mode !== "tenant" &&
      !paymentAccessScope.studentIds.has(parsedRequest.data.studentId)
    ) {
      response.status(403).json({ error: "Forbidden." });
      return;
    }

    const paymentNumber =
      parsedRequest.data.paymentNumber ??
      `PAY-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${Date.now().toString().slice(-6)}`;

    const payment = await paymentsCommandService.createPayment({
      tenantId: request.auth!.tenantId,
      payment: {
        studentId: parsedRequest.data.studentId,
        studentName: "",
        paymentNumber,
        amount: parsedRequest.data.amount,
        paidAmount:
          parsedRequest.data.paidAmount ??
          (parsedRequest.data.status === "PAID" ||
          parsedRequest.data.status === "PARTIAL"
            ? parsedRequest.data.amount
            : 0),
        method: parsedRequest.data.method,
        status: parsedRequest.data.status,
        paidAt: new Date(`${parsedRequest.data.paidAt}T00:00:00.000Z`),
        note: parsedRequest.data.note ?? null,
      },
    });

    if (!payment) {
      response.status(404).json({ error: "Payment student not found." });
      return;
    }

    await recordMutationAudit(request, "payments.create", {
      paymentId: payment.id,
      paymentNumber: payment.paymentNumber,
      studentId: payment.studentId,
      amount: payment.amount,
      status: payment.status,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(201).json(payment);
  },
);

router.put(
  "/payments/:paymentId",
  requireAuthenticatedSession,
  requirePermission("payments.record"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = paymentIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid payment id." });
      return;
    }

    const parsedRequest = paymentUpdateRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid payment payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const payment = await paymentsCommandService.updatePayment({
      tenantId: request.auth!.tenantId,
      paymentId: parsedParams.data.paymentId,
      payment: {
        studentId: parsedRequest.data.studentId,
        paymentNumber: parsedRequest.data.paymentNumber,
        amount: parsedRequest.data.amount,
        paidAmount:
          parsedRequest.data.paidAmount ??
          (parsedRequest.data.status === "PAID" &&
          parsedRequest.data.amount !== undefined
            ? parsedRequest.data.amount
            : parsedRequest.data.status === "PENDING" ||
                parsedRequest.data.status === "OVERDUE" ||
                parsedRequest.data.status === "CANCELED"
              ? 0
              : undefined),
        method: parsedRequest.data.method,
        status: parsedRequest.data.status,
        paidAt: parsedRequest.data.paidAt
          ? new Date(`${parsedRequest.data.paidAt}T00:00:00.000Z`)
          : undefined,
        note: parsedRequest.data.note ?? undefined,
      },
    });

    if (!payment) {
      response.status(404).json({ error: "Payment not found." });
      return;
    }

    await recordMutationAudit(request, "payments.update", {
      paymentId: payment.id,
      paymentNumber: payment.paymentNumber,
      studentId: payment.studentId,
      amount: payment.amount,
      status: payment.status,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(200).json(payment);
  },
);

router.delete(
  "/payments/:paymentId",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer", "administration"]),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = paymentIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid payment id." });
      return;
    }

    const deleted = await paymentsCommandService.deletePayment({
      tenantId: request.auth!.tenantId,
      paymentId: parsedParams.data.paymentId,
    });

    if (!deleted) {
      response.status(404).json({ error: "Payment not found." });
      return;
    }

    await recordMutationAudit(request, "payments.delete", {
      paymentId: parsedParams.data.paymentId,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(204).send();
  },
);

export { router as paymentsRouter };
