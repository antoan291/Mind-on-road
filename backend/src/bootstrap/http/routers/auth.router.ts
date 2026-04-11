import express = require("express");
import { appConfig } from "../../../config/app.config";
import {
  AuthenticationError,
  PasswordPolicyError,
  SessionAuthenticationError,
} from "../../../modules/identity/application/services/login.service";
import { changePasswordRequestSchema } from "../../../modules/identity/presentation/rest/requests/change-password.request";
import { loginRequestSchema } from "../../../modules/identity/presentation/rest/requests/login.request";
import type { LoginResponse } from "../../../modules/identity/presentation/rest/responses/login.response";
import { recordMutationAudit } from "../audit";
import {
  readAccessTokenFromCookie,
  requireAuthenticatedSession,
  requireCsrfProtection,
} from "../middleware";
import { changePasswordRateLimiter, loginRateLimiter } from "../rate-limiters";
import { loginService, sessionService } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

router.post("/auth/login", loginRateLimiter, async (request, response) => {
  const parsedRequest = loginRequestSchema.safeParse(request.body);

  if (!parsedRequest.success) {
    response.status(400).json({ error: "Invalid login payload." });
    return;
  }

  try {
    const result = await loginService.execute({
      ...parsedRequest.data,
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? undefined,
    });

    response.cookie(appConfig.authCookieName, result.accessToken, {
      httpOnly: true,
      secure: appConfig.env !== "development",
      sameSite: "strict",
      path: "/",
      maxAge: appConfig.sessionTtlHours * 60 * 60 * 1000,
    });

    const loginResponse: LoginResponse = {
      csrfToken: result.csrfToken,
      sessionId: result.sessionId,
      expiresAt: result.expiresAt,
      tenantSlug: result.tenantSlug,
      mustChangePassword: result.mustChangePassword,
      user: result.user,
    };

    response.status(200).json(loginResponse);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      response.status(401).json({
        error: "Грешни данни за вход, моля опитайте отново.",
      });
      return;
    }

    response.status(500).json({ error: "Login failed." });
  }
});

router.get(
  "/auth/me",
  requireAuthenticatedSession,
  (request: AuthenticatedRequest, response) => {
    response.status(200).json(request.auth);
  },
);

router.post(
  "/auth/logout",
  requireAuthenticatedSession,
  requireCsrfProtection,
  async (request, response) => {
    const accessToken = readAccessTokenFromCookie(request);

    if (accessToken) {
      await sessionService.logout(accessToken);
    }

    response.clearCookie(appConfig.authCookieName, {
      httpOnly: true,
      secure: appConfig.env !== "development",
      sameSite: "strict",
      path: "/",
    });

    response.status(204).send();
  },
);

router.post(
  "/auth/change-password",
  requireAuthenticatedSession,
  requireCsrfProtection,
  changePasswordRateLimiter,
  async (request, response) => {
    const parsedRequest = changePasswordRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({ error: "Invalid password change payload." });
      return;
    }

    const accessToken = readAccessTokenFromCookie(request);

    if (!accessToken) {
      response.status(401).json({ error: "Unauthenticated." });
      return;
    }

    try {
      await sessionService.changePassword({
        accessToken,
        currentPassword: parsedRequest.data.currentPassword,
        newPassword: parsedRequest.data.newPassword,
      });

      response.clearCookie(appConfig.authCookieName, {
        httpOnly: true,
        secure: appConfig.env !== "development",
        sameSite: "strict",
        path: "/",
      });

      response.status(204).send();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        response.status(401).json({ error: "Грешни данни" });
        return;
      }

      if (error instanceof PasswordPolicyError) {
        response.status(400).json({ error: error.message });
        return;
      }

      if (error instanceof SessionAuthenticationError) {
        response.status(401).json({ error: "Unauthenticated." });
        return;
      }

      response.status(500).json({ error: "Password change failed." });
    }
  },
);

export { router as authRouter };
