import express = require("express");
import { createHash } from "node:crypto";
import { appConfig } from "../../../config/app.config";
import { businessAssistantRequestSchema } from "../../../modules/ai/presentation/rest/requests/business-assistant.request";
import {
  buildTenantCacheKey,
  readCacheJson,
  writeCacheJson,
  TENANT_CACHE_TTL_SECONDS,
} from "../cache";
import {
  requireAnyRole,
  requireAuthenticatedSession,
  requireCsrfProtection,
} from "../middleware";
import { aiAssistantRateLimiter } from "../rate-limiters";
import { businessAssistantService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.post(
  "/ai/business-assistant",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer"]),
  aiAssistantRateLimiter,
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = businessAssistantRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid AI assistant payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const questionHash = createHash("sha256")
      .update(parsedRequest.data.question.trim().toLowerCase())
      .digest("hex")
      .slice(0, 24);
    const cacheKey = buildTenantCacheKey(
      request.auth!.tenantId,
      `ai-business:${questionHash}`,
    );
    const cachedAnswer = await readCacheJson<unknown>(cacheKey);

    if (cachedAnswer) {
      response.status(200).json(cachedAnswer);
      return;
    }

    const answer = await businessAssistantService.answerQuestion({
      tenantId: request.auth!.tenantId,
      question: parsedRequest.data.question,
      openAiApiKey: appConfig.openAiApiKey,
    });

    await writeCacheJson(cacheKey, answer, TENANT_CACHE_TTL_SECONDS);

    response.status(200).json(answer);
  },
);

export { router as aiRouter };
