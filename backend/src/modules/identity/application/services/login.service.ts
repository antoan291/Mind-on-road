import { appConfig } from '../../../../config/app.config';
import type { AuthAuditService } from '../../../audit/application/services/auth-audit.service';
import type { IdentityAuthRepository } from '../../domain/repositories/identity-auth.repository';
import {
  deriveCsrfToken,
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPasswordHash
} from '../../domain/services/password-security';

export interface LoginCommand {
  tenantSlug: string;
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  accessToken: string;
  csrfToken: string;
  sessionId: string;
  expiresAt: string;
  tenantSlug: string;
  mustChangePassword: boolean;
  user: {
    email: string;
    displayName: string;
    roleKeys: string[];
    permissionKeys: string[];
  };
}

export class AuthenticationError extends Error {
  public constructor() {
    super('Invalid credentials.');
  }
}

export class PasswordPolicyError extends Error {
  public constructor(message: string) {
    super(message);
  }
}

export class LoginService {
  public constructor(
    private readonly identityAuthRepository: IdentityAuthRepository,
    private readonly authAuditService: AuthAuditService
  ) {}

  public async execute(command: LoginCommand): Promise<LoginResult> {
    const identity = await this.identityAuthRepository.findLoginIdentity({
      tenantSlug: command.tenantSlug,
      email: command.email
    });

    if (!identity) {
      await this.authAuditService.record({
        actorType: 'ANONYMOUS',
        actionKey: 'auth.login',
        outcome: 'FAILURE',
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        metadata: {
          tenantSlug: command.tenantSlug,
          email: command.email,
          reason: 'identity_not_found'
        }
      });
      throw new AuthenticationError();
    }

    const isPasswordValid = verifyPasswordHash(
      command.password,
      identity.passwordHash
    );

    if (!isPasswordValid) {
      await this.authAuditService.record({
        tenantId: identity.tenantId,
        userId: identity.userId,
        actorType: 'ANONYMOUS',
        actionKey: 'auth.login',
        outcome: 'FAILURE',
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        metadata: {
          tenantSlug: identity.tenantSlug,
          email: identity.userEmail,
          reason: 'invalid_password'
        }
      });
      throw new AuthenticationError();
    }

    const accessToken = generateSessionToken();
    const session = await this.identityAuthRepository.createSession({
      userId: identity.userId,
      tenantMembershipId: identity.membershipId,
      sessionTokenHash: hashSessionToken(accessToken),
      expiresAt: new Date(
        Date.now() + appConfig.sessionTtlHours * 60 * 60 * 1000
      ),
      ipAddress: command.ipAddress,
      userAgent: command.userAgent
    });

    await this.authAuditService.record({
      tenantId: identity.tenantId,
      userId: identity.userId,
      sessionId: session.sessionId,
      actorType: 'USER',
      actionKey: 'auth.login',
      outcome: 'SUCCESS',
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      metadata: {
        tenantSlug: identity.tenantSlug,
        email: identity.userEmail,
        mustChangePassword: identity.mustChangePassword
      }
    });

    return {
      accessToken,
      csrfToken: deriveCsrfToken(accessToken, appConfig.sessionSecret),
      sessionId: session.sessionId,
      expiresAt: session.expiresAt.toISOString(),
      tenantSlug: identity.tenantSlug,
      mustChangePassword: identity.mustChangePassword,
      user: {
        email: identity.userEmail,
        displayName: identity.displayName,
        roleKeys: identity.roleKeys,
        permissionKeys: [...new Set(identity.permissionKeys)]
      }
    };
  }
}

export interface AuthenticatedSession {
  csrfToken: string;
  sessionId: string;
  expiresAt: string;
  tenantId: string;
  tenantSlug: string;
  mustChangePassword: boolean;
  user: {
    id: string;
    email: string;
    displayName: string;
    roleKeys: string[];
    permissionKeys: string[];
  };
}

export class SessionAuthenticationError extends Error {
  public constructor() {
    super('Unauthenticated.');
  }
}

export class SessionService {
  public constructor(
    private readonly identityAuthRepository: IdentityAuthRepository,
    private readonly authAuditService: AuthAuditService
  ) {}

  public async authenticate(accessToken: string): Promise<AuthenticatedSession> {
    const session = await this.identityAuthRepository.findAuthenticatedSessionByTokenHash(
      hashSessionToken(accessToken)
    );

    if (!session) {
      throw new SessionAuthenticationError();
    }

    await this.identityAuthRepository.updateSessionActivity(session.sessionId);

    return {
      csrfToken: deriveCsrfToken(accessToken, appConfig.sessionSecret),
      sessionId: session.sessionId,
      expiresAt: session.expiresAt.toISOString(),
      tenantId: session.tenantId,
      tenantSlug: session.tenantSlug,
      mustChangePassword: session.mustChangePassword,
      user: {
        id: session.userId,
        email: session.userEmail,
        displayName: session.displayName,
        roleKeys: session.roleKeys,
        permissionKeys: [...new Set(session.permissionKeys)]
      }
    };
  }

  public async logout(accessToken: string): Promise<void> {
    const session = await this.identityAuthRepository.findAuthenticatedSessionByTokenHash(
      hashSessionToken(accessToken)
    );

    if (!session) {
      return;
    }

    await this.identityAuthRepository.revokeSession(session.sessionId);
    await this.authAuditService.record({
      tenantId: session.tenantId,
      userId: session.userId,
      sessionId: session.sessionId,
      actorType: 'USER',
      actionKey: 'auth.logout',
      outcome: 'SUCCESS'
    });
  }

  public async changePassword(params: {
    accessToken: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    validatePasswordPolicy(params.newPassword);

    const session = await this.identityAuthRepository.findAuthenticatedSessionByTokenHash(
      hashSessionToken(params.accessToken)
    );

    if (!session) {
      throw new SessionAuthenticationError();
    }

    const identity = await this.identityAuthRepository.findLoginIdentity({
      tenantSlug: session.tenantSlug,
      email: session.userEmail
    });

    if (!identity) {
      throw new SessionAuthenticationError();
    }

    const isPasswordValid = verifyPasswordHash(
      params.currentPassword,
      identity.passwordHash
    );

    if (!isPasswordValid) {
      await this.authAuditService.record({
        tenantId: session.tenantId,
        userId: session.userId,
        sessionId: session.sessionId,
        actorType: 'USER',
        actionKey: 'auth.change_password',
        outcome: 'FAILURE',
        metadata: {
          reason: 'invalid_current_password'
        }
      });
      throw new AuthenticationError();
    }

    await this.identityAuthRepository.updatePassword({
      userId: session.userId,
      passwordHash: hashPassword(params.newPassword)
    });

    await this.identityAuthRepository.revokeUserSessions(session.userId);
    await this.authAuditService.record({
      tenantId: session.tenantId,
      userId: session.userId,
      sessionId: session.sessionId,
      actorType: 'USER',
      actionKey: 'auth.change_password',
      outcome: 'SUCCESS'
    });
  }
}

function validatePasswordPolicy(password: string) {
  if (password.length < 15) {
    throw new PasswordPolicyError(
      'Password must be at least 15 characters long.'
    );
  }

  if (password.length > 64) {
    throw new PasswordPolicyError(
      'Password must be at most 64 characters long.'
    );
  }
}
