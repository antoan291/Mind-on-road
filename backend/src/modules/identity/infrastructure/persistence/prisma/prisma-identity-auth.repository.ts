import type { PrismaClient } from '@prisma/client';
import { SessionStatus, TenantMembershipStatus, UserStatus } from '@prisma/client';

import type {
  AuthenticatedSessionRecord,
  CreateSessionInput,
  CreatedSessionRecord,
  IdentityAuthRepository,
  LoginIdentityRecord,
  UpdatePasswordInput
} from '../../../domain/repositories/identity-auth.repository';

export class PrismaIdentityAuthRepository implements IdentityAuthRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findLoginIdentity(params: {
    tenantSlug: string;
    email: string;
  }): Promise<LoginIdentityRecord | null> {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        status: TenantMembershipStatus.ACTIVE,
        tenant: {
          slug: params.tenantSlug
        },
        user: {
          email: params.email,
          status: UserStatus.ACTIVE
        }
      },
      select: {
        id: true,
        tenantId: true,
        tenant: {
          select: {
            slug: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            passwordHash: true,
            displayName: true,
            mustChangePassword: true
          }
        },
        roles: {
          select: {
            role: {
              select: {
                key: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        key: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!membership) {
      return null;
    }

    return {
      userId: membership.user.id,
      userEmail: membership.user.email,
      passwordHash: membership.user.passwordHash,
      displayName: membership.user.displayName,
      membershipId: membership.id,
      tenantId: membership.tenantId,
      tenantSlug: membership.tenant.slug,
      roleKeys: membership.roles.map((membershipRole) => membershipRole.role.key),
      permissionKeys: membership.roles.flatMap((membershipRole) =>
        membershipRole.role.permissions.map(
          (rolePermission) => rolePermission.permission.key
        )
      ),
      mustChangePassword: membership.user.mustChangePassword
    };
  }

  public async findAuthenticatedSessionByTokenHash(
    sessionTokenHash: string
  ): Promise<AuthenticatedSessionRecord | null> {
    const session = await this.prisma.userSession.findFirst({
      where: {
        sessionTokenHash,
        status: SessionStatus.ACTIVE,
        expiresAt: {
          gt: new Date()
        },
        tenantMembership: {
          status: TenantMembershipStatus.ACTIVE,
          user: {
            status: UserStatus.ACTIVE
          }
        }
      },
      select: {
        id: true,
        expiresAt: true,
        tenantMembershipId: true,
        tenantMembership: {
          select: {
            tenantId: true,
            tenant: {
              select: {
                slug: true
              }
            },
            roles: {
              select: {
                role: {
                  select: {
                    key: true,
                    permissions: {
                      select: {
                        permission: {
                          select: {
                            key: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                mustChangePassword: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return null;
    }

    return {
      sessionId: session.id,
      userId: session.tenantMembership.user.id,
      userEmail: session.tenantMembership.user.email,
      displayName: session.tenantMembership.user.displayName,
      membershipId: session.tenantMembershipId,
      tenantId: session.tenantMembership.tenantId,
      tenantSlug: session.tenantMembership.tenant.slug,
      roleKeys: session.tenantMembership.roles.map(
        (membershipRole) => membershipRole.role.key
      ),
      permissionKeys: session.tenantMembership.roles.flatMap((membershipRole) =>
        membershipRole.role.permissions.map(
          (rolePermission) => rolePermission.permission.key
        )
      ),
      expiresAt: session.expiresAt,
      mustChangePassword: session.tenantMembership.user.mustChangePassword
    };
  }

  public async createSession(
    input: CreateSessionInput
  ): Promise<CreatedSessionRecord> {
    const session = await this.prisma.userSession.create({
      data: {
        userId: input.userId,
        tenantMembershipId: input.tenantMembershipId,
        sessionTokenHash: input.sessionTokenHash,
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        status: SessionStatus.ACTIVE
      },
      select: {
        id: true,
        expiresAt: true
      }
    });

    return {
      sessionId: session.id,
      expiresAt: session.expiresAt
    };
  }

  public async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        id: sessionId,
        status: SessionStatus.ACTIVE
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date()
      }
    });
  }

  public async revokeUserSessions(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date()
      }
    });
  }

  public async updateSessionActivity(sessionId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        id: sessionId,
        status: SessionStatus.ACTIVE
      },
      data: {
        lastSeenAt: new Date()
      }
    });
  }

  public async updatePassword(input: UpdatePasswordInput): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: input.userId
      },
      data: {
        passwordHash: input.passwordHash,
        mustChangePassword: false,
        passwordChangedAt: new Date()
      }
    });
  }
}
