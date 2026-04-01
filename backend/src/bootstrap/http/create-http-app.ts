import express = require('express');
import cookie = require('cookie');
import cors = require('cors');

import { appConfig } from '../../config/app.config';
import { prismaClient } from '../../infrastructure/database/prisma/prisma-client';
import {
  AuthenticationError,
  LoginService,
  PasswordPolicyError,
  SessionAuthenticationError,
  SessionService
} from '../../modules/identity/application/services/login.service';
import { PrismaIdentityAuthRepository } from '../../modules/identity/infrastructure/persistence/prisma/prisma-identity-auth.repository';
import { changePasswordRequestSchema } from '../../modules/identity/presentation/rest/requests/change-password.request';
import { loginRequestSchema } from '../../modules/identity/presentation/rest/requests/login.request';
import type { LoginResponse } from '../../modules/identity/presentation/rest/responses/login.response';

const rateLimitModule = require('express-rate-limit') as typeof import('express-rate-limit');
const helmetModule = require('helmet') as typeof import('helmet');
const identityAuthRepository = new PrismaIdentityAuthRepository(prismaClient);
const loginService = new LoginService(identityAuthRepository);
const sessionService = new SessionService(identityAuthRepository);
const rateLimit = rateLimitModule.rateLimit ?? rateLimitModule.default;
const helmet = helmetModule.default;
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts. Try again later.'
  }
});

interface AuthenticatedRequest extends express.Request {
  auth?: Awaited<ReturnType<SessionService['authenticate']>>;
}

export function createHttpApp() {
  const app = express();

  if (appConfig.env === 'production' || appConfig.env === 'staging') {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');
  app.use(
    cors({
      origin: appConfig.webAppUrl,
      credentials: true
    })
  );
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' }
    })
  );
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));

  app.get('/health', (_request, response) => {
    response.json({
      status: 'ok'
    });
  });

  app.post('/auth/login', loginRateLimiter, async (request, response) => {
    const parsedRequest = loginRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: 'Invalid login payload.'
      });
      return;
    }

    try {
      const result = await loginService.execute({
        ...parsedRequest.data,
        ipAddress: request.ip,
        userAgent: request.get('user-agent') ?? undefined
      });

      response.cookie(appConfig.authCookieName, result.accessToken, {
        httpOnly: true,
        secure: appConfig.env === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: appConfig.sessionTtlHours * 60 * 60 * 1000
      });

      const loginResponse: LoginResponse = {
        sessionId: result.sessionId,
        expiresAt: result.expiresAt,
        tenantSlug: result.tenantSlug,
        mustChangePassword: result.mustChangePassword,
        user: result.user
      };

      response.status(200).json(loginResponse);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        response.status(401).json({
          error: 'Invalid credentials.'
        });
        return;
      }

      response.status(500).json({
        error: 'Login failed.'
      });
    }
  });

  app.get('/auth/me', requireAuthenticatedSession, (request: AuthenticatedRequest, response) => {
    response.status(200).json(request.auth);
  });

  app.post('/auth/logout', requireAuthenticatedSession, async (request, response) => {
    const accessToken = readAccessTokenFromCookie(request);

    if (accessToken) {
      await sessionService.logout(accessToken);
    }

    response.clearCookie(appConfig.authCookieName, {
      httpOnly: true,
      secure: appConfig.env === 'production',
      sameSite: 'strict',
      path: '/'
    });

    response.status(204).send();
  });

  app.post('/auth/change-password', requireAuthenticatedSession, async (request, response) => {
    const parsedRequest = changePasswordRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: 'Invalid password change payload.'
      });
      return;
    }

    const accessToken = readAccessTokenFromCookie(request);

    if (!accessToken) {
      response.status(401).json({
        error: 'Unauthenticated.'
      });
      return;
    }

    try {
      await sessionService.changePassword({
        accessToken,
        currentPassword: parsedRequest.data.currentPassword,
        newPassword: parsedRequest.data.newPassword
      });

      response.clearCookie(appConfig.authCookieName, {
        httpOnly: true,
        secure: appConfig.env === 'production',
        sameSite: 'strict',
        path: '/'
      });

      response.status(204).send();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        response.status(401).json({
          error: 'Invalid credentials.'
        });
        return;
      }

      if (error instanceof PasswordPolicyError) {
        response.status(400).json({
          error: error.message
        });
        return;
      }

      if (error instanceof SessionAuthenticationError) {
        response.status(401).json({
          error: 'Unauthenticated.'
        });
        return;
      }

      response.status(500).json({
        error: 'Password change failed.'
      });
    }
  });

  return app;
}

function readAccessTokenFromCookie(request: express.Request) {
  const rawCookieHeader = request.headers.cookie;

  if (!rawCookieHeader) {
    return null;
  }

  const parsedCookies = cookie.parse(rawCookieHeader);

  return parsedCookies[appConfig.authCookieName] ?? null;
}

async function requireAuthenticatedSession(
  request: AuthenticatedRequest,
  response: express.Response,
  next: express.NextFunction
) {
  const accessToken = readAccessTokenFromCookie(request);

  if (!accessToken) {
    response.status(401).json({
      error: 'Unauthenticated.'
    });
    return;
  }

  try {
    request.auth = await sessionService.authenticate(accessToken);
    next();
  } catch (error) {
    if (error instanceof SessionAuthenticationError) {
      response.clearCookie(appConfig.authCookieName, {
        httpOnly: true,
        secure: appConfig.env === 'production',
        sameSite: 'strict',
        path: '/'
      });
      response.status(401).json({
        error: 'Unauthenticated.'
      });
      return;
    }

    response.status(500).json({
      error: 'Authentication failed.'
    });
  }
}
