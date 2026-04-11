import cookie = require("cookie");
import express = require("express");
import { appConfig } from "../../config/app.config";
import {
  SessionAuthenticationError,
} from "../../modules/identity/application/services/login.service";
import {
  deriveCsrfToken,
  isMatchingCsrfToken,
} from "../../modules/identity/domain/services/password-security";
import { fullAccessRoleKeys } from "./constants";
import { authAuditService, sessionService } from "./services";
import type { AuthenticatedRequest } from "./types";

export function readAccessTokenFromCookie(request: express.Request): string | null {
  const rawCookieHeader = request.headers.cookie;

  if (!rawCookieHeader) {
    return null;
  }

  const parsedCookies = cookie.parse(rawCookieHeader);

  return parsedCookies[appConfig.authCookieName] ?? null;
}

export async function requireAuthenticatedSession(
  request: AuthenticatedRequest,
  response: express.Response,
  next: express.NextFunction,
) {
  const accessToken = readAccessTokenFromCookie(request);

  if (!accessToken) {
    response.status(401).json({ error: "Unauthenticated." });
    return;
  }

  try {
    request.auth = await sessionService.authenticate(accessToken);
    next();
  } catch (error) {
    if (error instanceof SessionAuthenticationError) {
      response.clearCookie(appConfig.authCookieName, {
        httpOnly: true,
        secure: appConfig.env !== "development",
        sameSite: "strict",
        path: "/",
      });
      response.status(401).json({ error: "Unauthenticated." });
      return;
    }

    response.status(500).json({ error: "Authentication failed." });
  }
}

export function requirePermission(permissionKey: string) {
  return (
    request: AuthenticatedRequest,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    const permissionKeys = request.auth?.user.permissionKeys ?? [];

    if (!permissionKeys.includes(permissionKey)) {
      void authAuditService.record({
        tenantId: request.auth?.tenantId,
        userId: request.auth?.user.id,
        sessionId: request.auth?.sessionId,
        actorType: "USER",
        actionKey: "authz.permission_denied",
        outcome: "FAILURE",
        ipAddress: request.ip,
        userAgent: request.get("user-agent") ?? undefined,
        metadata: { requiredPermission: permissionKey, path: request.path },
      });
      response.status(403).json({ error: "Forbidden." });
      return;
    }

    next();
  };
}

export function requireAnyRole(roleKeys: string[]) {
  return (
    request: AuthenticatedRequest,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    const userRoleKeys = request.auth?.user.roleKeys ?? [];

    if (!roleKeys.some((roleKey) => userRoleKeys.includes(roleKey))) {
      void authAuditService.record({
        tenantId: request.auth?.tenantId,
        userId: request.auth?.user.id,
        sessionId: request.auth?.sessionId,
        actorType: "USER",
        actionKey: "authz.role_denied",
        outcome: "FAILURE",
        ipAddress: request.ip,
        userAgent: request.get("user-agent") ?? undefined,
        metadata: { requiredRoles: roleKeys, path: request.path },
      });
      response.status(403).json({ error: "Forbidden." });
      return;
    }

    next();
  };
}

export function requireOwnerRole(
  request: AuthenticatedRequest,
  response: express.Response,
  next: express.NextFunction,
) {
  const roleKeys = request.auth?.user.roleKeys ?? [];

  if (!fullAccessRoleKeys.some((roleKey) => roleKeys.includes(roleKey))) {
    void authAuditService.record({
      tenantId: request.auth?.tenantId,
      userId: request.auth?.user.id,
      sessionId: request.auth?.sessionId,
      actorType: "USER",
      actionKey: "authz.owner_role_denied",
      outcome: "FAILURE",
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? undefined,
      metadata: { path: request.path },
    });
    response.status(403).json({ error: "Forbidden." });
    return;
  }

  next();
}

export function requireDeveloperRole(
  request: AuthenticatedRequest,
  response: express.Response,
  next: express.NextFunction,
) {
  const roleKeys = request.auth?.user.roleKeys ?? [];

  if (!roleKeys.includes("developer")) {
    void authAuditService.record({
      tenantId: request.auth?.tenantId,
      userId: request.auth?.user.id,
      sessionId: request.auth?.sessionId,
      actorType: "USER",
      actionKey: "authz.developer_role_denied",
      outcome: "FAILURE",
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? undefined,
      metadata: { path: request.path },
    });
    response.status(403).json({ error: "Forbidden." });
    return;
  }

  next();
}

export function requireCsrfProtection(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction,
) {
  const accessToken = readAccessTokenFromCookie(request);
  const csrfHeader = request.get("x-csrf-token");

  if (!accessToken || !csrfHeader) {
    response.status(403).json({ error: "CSRF validation failed." });
    return;
  }

  const expectedCsrfToken = deriveCsrfToken(accessToken, appConfig.sessionSecret);

  if (!isMatchingCsrfToken(csrfHeader, expectedCsrfToken)) {
    response.status(403).json({ error: "CSRF validation failed." });
    return;
  }

  next();
}
