import type { PrismaClient } from '@prisma/client';
import { SessionStatus, TenantMembershipStatus, UserStatus } from '@prisma/client';

import type {
  AuthenticatedSessionRecord,
  CreateSessionInput,
  CreatedSessionRecord,
  IdentityAuthRepository,
  LoginIdentityRecord,
  ProvisionTenantPortalIdentityInput,
  ProvisionTenantPortalIdentityResult,
  UpdatePasswordInput
} from '../../../domain/repositories/identity-auth.repository';
import {
  generateSessionToken,
  hashPassword
} from '../../../domain/services/password-security';

const loginMembershipSelect = {
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
} as const;

export class PrismaIdentityAuthRepository implements IdentityAuthRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findLoginIdentity(params: {
    tenantSlug: string;
    email: string;
  }): Promise<LoginIdentityRecord | null> {
    const normalizedIdentifier = params.email.trim();

    const membership =
      (await this.findTenantMembershipByIdentifier({
        tenantSlug: params.tenantSlug,
        normalizedIdentifier
      })) ??
      (await this.ensureDeveloperTenantMembership({
        tenantSlug: params.tenantSlug,
        normalizedIdentifier
      }));

    if (!membership) {
      return null;
    }

    return this.mapLoginIdentity(membership);
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

  public async provisionTenantPortalIdentity(
    input: ProvisionTenantPortalIdentityInput
  ): Promise<ProvisionTenantPortalIdentityResult> {
    const normalizedPhone = input.phone.trim();
    const normalizedEmail =
      input.email?.trim().toLowerCase() ??
      buildSyntheticPortalEmail(input.tenantId, normalizedPhone);
    const loginIdentifier = input.email ? normalizedEmail : normalizedPhone;

    const role = await this.prisma.role.findUniqueOrThrow({
      where: {
        tenantId_key: {
          tenantId: input.tenantId,
          key: input.roleKey
        }
      },
      select: {
        id: true
      }
    });

    if (input.existingMembershipId) {
      const existingMembership = await this.prisma.tenantMembership.findFirst({
        where: {
          id: input.existingMembershipId,
          tenantId: input.tenantId
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      });

      if (existingMembership) {
        await this.prisma.user.update({
          where: {
            id: existingMembership.user.id
          },
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            displayName: input.displayName,
            phone: normalizedPhone,
            ...(input.password
              ? {
                  passwordHash: hashPassword(input.password),
                  mustChangePassword:
                    input.requirePasswordChangeOnFirstLogin ?? false,
                  passwordChangedAt: new Date()
                }
              : {}),
            ...(shouldReplaceEmail(existingMembership.user.email, input.email)
              ? { email: normalizedEmail }
              : {}),
            status: UserStatus.ACTIVE
          }
        });

        await this.prisma.membershipRole.upsert({
          where: {
            membershipId_roleId: {
              membershipId: existingMembership.id,
              roleId: role.id
            }
          },
          update: {},
          create: {
            membershipId: existingMembership.id,
            roleId: role.id
          }
        });

        return {
          userId: existingMembership.user.id,
          membershipId: existingMembership.id,
          loginIdentifier,
          temporaryPassword: null,
          status: 'updated_existing'
        };
      }
    }

    const existingUser = input.email
      ? await this.prisma.user.findFirst({
          where: {
            email: normalizedEmail
          },
          select: {
            id: true,
            email: true,
            memberships: {
              where: {
                tenantId: input.tenantId
              },
              select: {
                id: true
              },
              take: 1
            }
          }
        })
      : null;

    if (existingUser) {
      await this.prisma.user.update({
        where: {
          id: existingUser.id
        },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          displayName: input.displayName,
          phone: normalizedPhone,
          ...(input.password
            ? {
                passwordHash: hashPassword(input.password),
                mustChangePassword:
                  input.requirePasswordChangeOnFirstLogin ?? false,
                passwordChangedAt: new Date()
              }
            : {}),
          ...(shouldReplaceEmail(existingUser.email, input.email)
            ? { email: normalizedEmail }
            : {}),
          status: UserStatus.ACTIVE
        }
      });

      const membership = await this.prisma.tenantMembership.upsert({
        where: {
          tenantId_userId: {
            tenantId: input.tenantId,
            userId: existingUser.id
          }
        },
        update: {
          status: TenantMembershipStatus.ACTIVE,
          joinedAt: new Date()
        },
        create: {
          tenantId: input.tenantId,
          userId: existingUser.id,
          status: TenantMembershipStatus.ACTIVE,
          joinedAt: new Date()
        },
        select: {
          id: true
        }
      });

      await this.prisma.membershipRole.upsert({
        where: {
          membershipId_roleId: {
            membershipId: membership.id,
            roleId: role.id
          }
        },
        update: {},
        create: {
          membershipId: membership.id,
          roleId: role.id
        }
      });

      return {
        userId: existingUser.id,
        membershipId: membership.id,
        loginIdentifier,
        temporaryPassword: null,
        status: existingUser.memberships[0]
          ? 'already_linked'
          : 'linked_existing'
      };
    }

    const temporaryPassword = input.password ? null : generateSessionToken();
    const createdUser = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashPassword(input.password ?? temporaryPassword!),
        firstName: input.firstName,
        lastName: input.lastName,
        displayName: input.displayName,
        phone: normalizedPhone,
        status: UserStatus.ACTIVE,
        mustChangePassword:
          input.password
            ? input.requirePasswordChangeOnFirstLogin ?? false
            : true
      },
      select: {
        id: true
      }
    });

    const membership = await this.prisma.tenantMembership.create({
      data: {
        tenantId: input.tenantId,
        userId: createdUser.id,
        status: TenantMembershipStatus.ACTIVE,
        joinedAt: new Date()
      },
      select: {
        id: true
      }
    });

    await this.prisma.membershipRole.create({
      data: {
        membershipId: membership.id,
        roleId: role.id
      }
    });

    return {
      userId: createdUser.id,
      membershipId: membership.id,
      loginIdentifier,
      temporaryPassword,
      status: 'created'
    };
  }
  private async findTenantMembershipByIdentifier(params: {
    tenantSlug: string;
    normalizedIdentifier: string;
  }) {
    return this.prisma.tenantMembership.findFirst({
      where: {
        status: TenantMembershipStatus.ACTIVE,
        tenant: {
          slug: params.tenantSlug
        },
        user: {
          OR: [
            {
              email: params.normalizedIdentifier
            },
            {
              phone: params.normalizedIdentifier
            }
          ],
          status: UserStatus.ACTIVE
        }
      },
      select: loginMembershipSelect
    });
  }

  private async ensureDeveloperTenantMembership(params: {
    tenantSlug: string;
    normalizedIdentifier: string;
  }) {
    const developerUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: params.normalizedIdentifier
          },
          {
            phone: params.normalizedIdentifier
          }
        ],
        status: UserStatus.ACTIVE,
        memberships: {
          some: {
            status: TenantMembershipStatus.ACTIVE,
            roles: {
              some: {
                role: {
                  key: 'developer'
                }
              }
            }
          }
        }
      },
      select: {
        id: true
      }
    });

    if (!developerUser) {
      return null;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: {
        slug: params.tenantSlug
      },
      select: {
        id: true
      }
    });

    if (!tenant) {
      return null;
    }

    const developerRole = await this.prisma.role.findUnique({
      where: {
        tenantId_key: {
          tenantId: tenant.id,
          key: 'developer'
        }
      },
      select: {
        id: true
      }
    });

    if (!developerRole) {
      return null;
    }

    const membership = await this.prisma.tenantMembership.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: developerUser.id
        }
      },
      update: {
        status: TenantMembershipStatus.ACTIVE,
        joinedAt: new Date()
      },
      create: {
        tenantId: tenant.id,
        userId: developerUser.id,
        status: TenantMembershipStatus.ACTIVE,
        joinedAt: new Date()
      },
      select: {
        id: true
      }
    });

    await this.prisma.membershipRole.upsert({
      where: {
        membershipId_roleId: {
          membershipId: membership.id,
          roleId: developerRole.id
        }
      },
      update: {},
      create: {
        membershipId: membership.id,
        roleId: developerRole.id
      }
    });

    return this.findTenantMembershipByIdentifier({
      tenantSlug: params.tenantSlug,
      normalizedIdentifier: params.normalizedIdentifier
    });
  }

  private mapLoginIdentity(
    membership: Awaited<
      ReturnType<PrismaIdentityAuthRepository['findTenantMembershipByIdentifier']>
    >
  ): LoginIdentityRecord | null {
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
}

function buildSyntheticPortalEmail(tenantId: string, phone: string) {
  const normalizedPhone = phone.replace(/[^0-9a-z]/gi, '').toLowerCase();

  return `student+${tenantId.slice(0, 8)}.${normalizedPhone}@portal.mindonroad.local`;
}

function shouldReplaceEmail(
  currentEmail: string,
  nextEmail: string | null
) {
  if (!nextEmail) {
    return false;
  }

  return (
    currentEmail === nextEmail ||
    currentEmail.endsWith('@portal.mindonroad.local')
  );
}
