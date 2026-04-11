import express = require("express");
import { z } from "zod";
import { expenseCreateRequestSchema } from "../../../modules/expenses/presentation/rest/requests/expense-create.request";
import { recordMutationAudit } from "../audit";
import {
  buildTenantCacheKey,
  deleteTenantReadCaches,
  readCacheJson,
  writeCacheJson,
  TENANT_CACHE_TTL_SECONDS,
} from "../cache";
import {
  requireAnyRole,
  requireAuthenticatedSession,
  requireCsrfProtection,
  requirePermission,
} from "../middleware";
import { expensesCommandService, expensesQueryService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

const expenseIdParamsSchema = z.object({
  expenseId: z.string().uuid(),
});

router.get(
  "/expenses",
  requireAuthenticatedSession,
  requirePermission("payments.read"),
  async (request: AuthenticatedRequest, response) => {
    const cacheKey = buildTenantCacheKey(request.auth!.tenantId, "expenses");
    const cachedItems = await readCacheJson<unknown[]>(cacheKey);

    if (cachedItems) {
      response.status(200).json({ items: cachedItems });
      return;
    }

    const items = await expensesQueryService.listExpenses({
      tenantId: request.auth!.tenantId,
    });

    await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json({ items });
  },
);

router.post(
  "/expenses",
  requireAuthenticatedSession,
  requirePermission("payments.record"),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = expenseCreateRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid expense payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const expense = await expensesCommandService.createExpense({
      tenantId: request.auth!.tenantId,
      expense: {
        expenseType: parsedRequest.data.type,
        title: parsedRequest.data.title,
        category: parsedRequest.data.category,
        amount: parsedRequest.data.amount,
        vatAmount: parsedRequest.data.vatAmount,
        paymentMethod: parsedRequest.data.paymentMethod,
        source: parsedRequest.data.source,
        counterparty: parsedRequest.data.counterparty,
        note: parsedRequest.data.note,
        status: parsedRequest.data.status,
        affectsOperationalExpense:
          parsedRequest.data.type === "friend-vat-expense"
            ? false
            : parsedRequest.data.affectsOperationalExpense,
        entryDate: new Date(`${parsedRequest.data.date}T00:00:00.000Z`),
      },
    });

    await recordMutationAudit(request, "expenses.create", {
      expenseId: expense.id,
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      affectsOperationalExpense: expense.affectsOperationalExpense,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(201).json(expense);
  },
);

router.delete(
  "/expenses/:expenseId",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer", "administration"]),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = expenseIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid expense id." });
      return;
    }

    const deleted = await expensesCommandService.deleteExpense({
      tenantId: request.auth!.tenantId,
      expenseId: parsedParams.data.expenseId,
    });

    if (!deleted) {
      response.status(404).json({ error: "Expense not found." });
      return;
    }

    await recordMutationAudit(request, "expenses.delete", {
      expenseId: parsedParams.data.expenseId,
    });
    await deleteTenantReadCaches(request.auth!.tenantId);

    response.status(204).send();
  },
);

export { router as expensesRouter };
