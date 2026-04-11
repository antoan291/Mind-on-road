import express = require("express");
import { prismaClient } from "../../../infrastructure/database/prisma/prisma-client";
import {
  personnelIdParamsSchema,
  personnelRoleKeys,
  personnelWriteRequestSchema,
} from "../../../modules/identity/presentation/rest/requests/personnel.request";
import { recordMutationAudit } from "../audit";
import { fullAccessRoleKeys, staffRoleKeys } from "../constants";
import {
  requireAnyRole,
  requireAuthenticatedSession,
  requireCsrfProtection,
} from "../middleware";
import { identityAuthRepository } from "../services";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

async function findPersonnelByMembershipId(params: {
  tenantId: string;
  membershipId: string;
}) {
  const item = await prismaClient.tenantMembership.findFirstOrThrow({
    where: {
      id: params.membershipId,
      tenantId: params.tenantId,
    },
    select: {
      id: true,
      status: true,
      joinedAt: true,
      invitedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          displayName: true,
          phone: true,
          status: true,
          mustChangePassword: true,
        },
      },
      roles: {
        where: {
          role: {
            key: {
              in: staffRoleKeys,
            },
          },
        },
        select: {
          role: {
            select: {
              key: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  const assignedStudentsCount = await prismaClient.studentEnrollment.count({
    where: {
      tenantId: params.tenantId,
      assignedInstructorName: item.user.displayName,
    },
  });

  return {
    membershipId: item.id,
    userId: item.user.id,
    firstName: item.user.firstName,
    lastName: item.user.lastName,
    displayName: item.user.displayName,
    email: item.user.email,
    phone: item.user.phone,
    userStatus: item.user.status,
    membershipStatus: item.status,
    mustChangePassword: item.user.mustChangePassword,
    joinedAt: item.joinedAt?.toISOString() ?? item.invitedAt.toISOString(),
    roleKeys: item.roles.map((membershipRole) => membershipRole.role.key),
    roleLabels: item.roles.map(
      (membershipRole) => membershipRole.role.displayName,
    ),
    assignedStudentsCount,
  };
}

async function syncPersonnelRoles(params: {
  tenantId: string;
  membershipId: string;
  roleKeys: string[];
}) {
  await prismaClient.membershipRole.deleteMany({
    where: {
      membershipId: params.membershipId,
      role: {
        tenantId: params.tenantId,
        key: {
          in: staffRoleKeys.filter(
            (roleKey) => !params.roleKeys.includes(roleKey),
          ),
        },
      },
    },
  });
}

async function listAssignedStudentsCountByInstructorName(params: {
  tenantId: string;
  instructorNames: string[];
}) {
  if (params.instructorNames.length === 0) {
    return new Map<string, number>();
  }

  const rows = await prismaClient.studentEnrollment.groupBy({
    by: ["assignedInstructorName"],
    where: {
      tenantId: params.tenantId,
      assignedInstructorName: {
        in: params.instructorNames,
      },
    },
    _count: {
      assignedInstructorName: true,
    },
  });

  return new Map(
    rows
      .filter(
        (
          row,
        ): row is (typeof rows)[number] & { assignedInstructorName: string } =>
          row.assignedInstructorName !== null,
      )
      .map((row) => [
        row.assignedInstructorName,
        row._count.assignedInstructorName,
      ]),
  );
}

router.get(
  "/personnel",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer"]),
  async (request: AuthenticatedRequest, response) => {
    const items = await prismaClient.tenantMembership.findMany({
      where: {
        tenantId: request.auth!.tenantId,
        status: {
          in: ["ACTIVE", "INVITED"],
        },
        roles: {
          some: {
            role: {
              key: {
                in: staffRoleKeys,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          displayName: "asc",
        },
      },
      select: {
        id: true,
        status: true,
        joinedAt: true,
        invitedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
            phone: true,
            status: true,
            mustChangePassword: true,
          },
        },
        roles: {
          select: {
            role: {
              select: {
                key: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    const assignedStudentsCountByInstructorName =
      await listAssignedStudentsCountByInstructorName({
        tenantId: request.auth!.tenantId,
        instructorNames: items.map((item) => item.user.displayName),
      });

    response.status(200).json({
      items: items.map((item) => ({
        membershipId: item.id,
        userId: item.user.id,
        firstName: item.user.firstName,
        lastName: item.user.lastName,
        displayName: item.user.displayName,
        email: item.user.email,
        phone: item.user.phone,
        userStatus: item.user.status,
        membershipStatus: item.status,
        mustChangePassword: item.user.mustChangePassword,
        joinedAt:
          item.joinedAt?.toISOString() ?? item.invitedAt.toISOString(),
        roleKeys: item.roles.map((membershipRole) => membershipRole.role.key),
        roleLabels: item.roles.map(
          (membershipRole) => membershipRole.role.displayName,
        ),
        assignedStudentsCount:
          assignedStudentsCountByInstructorName.get(item.user.displayName) ??
          0,
      })),
    });
  },
);

router.post(
  "/personnel",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer"]),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedRequest = personnelWriteRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid personnel payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const existingMembership = await prismaClient.tenantMembership.findFirst({
      where: {
        tenantId: request.auth!.tenantId,
        user: {
          OR: [
            { email: parsedRequest.data.email },
            { phone: parsedRequest.data.phone },
          ],
        },
      },
      select: {
        id: true,
        roles: {
          select: {
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
    });

    if (
      existingMembership?.roles.some(
        (membershipRole) => membershipRole.role.key === "owner",
      )
    ) {
      response.status(409).json({
        error: "Owner profile cannot be converted to personnel.",
      });
      return;
    }

    if (!parsedRequest.data.password) {
      response.status(400).json({
        error: "Password is required when creating personnel.",
      });
      return;
    }

    let latestProvisionResult: Awaited<
      ReturnType<typeof identityAuthRepository.provisionTenantPortalIdentity>
    > | null = null;
    let membershipId = existingMembership?.id ?? null;

    for (const roleKey of parsedRequest.data.roleKeys) {
      latestProvisionResult =
        await identityAuthRepository.provisionTenantPortalIdentity({
          tenantId: request.auth!.tenantId,
          roleKey,
          firstName: parsedRequest.data.firstName,
          lastName: parsedRequest.data.lastName,
          displayName: `${parsedRequest.data.firstName} ${parsedRequest.data.lastName}`,
          phone: parsedRequest.data.phone,
          email: parsedRequest.data.email,
          password: parsedRequest.data.password,
          existingMembershipId: membershipId,
        });
      membershipId = latestProvisionResult.membershipId;
    }

    if (!membershipId || !latestProvisionResult) {
      response.status(500).json({ error: "Personnel provisioning failed." });
      return;
    }

    await syncPersonnelRoles({
      membershipId,
      tenantId: request.auth!.tenantId,
      roleKeys: parsedRequest.data.roleKeys,
    });

    const staffRecord = await findPersonnelByMembershipId({
      tenantId: request.auth!.tenantId,
      membershipId,
    });

    await recordMutationAudit(request, "personnel.create", {
      membershipId,
      roleKeys: parsedRequest.data.roleKeys,
    });

    response.status(201).json({
      item: staffRecord,
      portalAccess: {
        loginIdentifier: latestProvisionResult.loginIdentifier,
        temporaryPassword: latestProvisionResult.temporaryPassword,
        status: latestProvisionResult.status,
      },
    });
  },
);

router.put(
  "/personnel/:membershipId",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer"]),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = personnelIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid personnel id." });
      return;
    }

    const parsedRequest = personnelWriteRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: "Invalid personnel payload.",
        details: parsedRequest.error.flatten(),
      });
      return;
    }

    const targetMembership = await prismaClient.tenantMembership.findFirst({
      where: {
        id: parsedParams.data.membershipId,
        tenantId: request.auth!.tenantId,
      },
      select: {
        id: true,
        roles: {
          select: {
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
    });

    if (!targetMembership) {
      response.status(404).json({ error: "Personnel member not found." });
      return;
    }

    if (
      targetMembership.roles.some(
        (membershipRole) => membershipRole.role.key === "owner",
      )
    ) {
      response.status(403).json({
        error: "Owner profile cannot be edited from personnel.",
      });
      return;
    }

    if (parsedRequest.data.password) {
      response.status(400).json({
        error: "Паролата се сменя от самия служител след вход.",
      });
      return;
    }

    let latestProvisionResult: Awaited<
      ReturnType<typeof identityAuthRepository.provisionTenantPortalIdentity>
    > | null = null;

    for (const roleKey of parsedRequest.data.roleKeys) {
      latestProvisionResult =
        await identityAuthRepository.provisionTenantPortalIdentity({
          tenantId: request.auth!.tenantId,
          roleKey,
          firstName: parsedRequest.data.firstName,
          lastName: parsedRequest.data.lastName,
          displayName: `${parsedRequest.data.firstName} ${parsedRequest.data.lastName}`,
          phone: parsedRequest.data.phone,
          email: parsedRequest.data.email,
          existingMembershipId: targetMembership.id,
        });
    }

    await syncPersonnelRoles({
      membershipId: targetMembership.id,
      tenantId: request.auth!.tenantId,
      roleKeys: parsedRequest.data.roleKeys,
    });

    const staffRecord = await findPersonnelByMembershipId({
      tenantId: request.auth!.tenantId,
      membershipId: targetMembership.id,
    });

    await recordMutationAudit(request, "personnel.update", {
      membershipId: targetMembership.id,
      roleKeys: parsedRequest.data.roleKeys,
    });

    response.status(200).json({
      item: staffRecord,
      portalAccess: latestProvisionResult
        ? {
            loginIdentifier: latestProvisionResult.loginIdentifier,
            temporaryPassword: latestProvisionResult.temporaryPassword,
            status: latestProvisionResult.status,
          }
        : null,
    });
  },
);

router.delete(
  "/personnel/:membershipId",
  requireAuthenticatedSession,
  requireAnyRole(["owner", "developer"]),
  requireCsrfProtection,
  async (request: AuthenticatedRequest, response) => {
    const parsedParams = personnelIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      response.status(400).json({ error: "Invalid personnel id." });
      return;
    }

    const targetMembership = await prismaClient.tenantMembership.findFirst({
      where: {
        id: parsedParams.data.membershipId,
        tenantId: request.auth!.tenantId,
        roles: {
          some: {
            role: {
              key: {
                in: staffRoleKeys,
              },
            },
          },
        },
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            email: true,
          },
        },
        roles: {
          select: {
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
    });

    if (!targetMembership) {
      response.status(404).json({ error: "Personnel member not found." });
      return;
    }

    if (
      targetMembership.roles.some((membershipRole) =>
        fullAccessRoleKeys.includes(
          membershipRole.role.key as (typeof fullAccessRoleKeys)[number],
        ),
      )
    ) {
      response.status(403).json({
        error: "Owner or developer profile cannot be deleted from personnel.",
      });
      return;
    }

    const otherMembershipsCount = await prismaClient.tenantMembership.count({
      where: {
        userId: targetMembership.userId,
        id: {
          not: targetMembership.id,
        },
      },
    });

    await prismaClient.$transaction(async (tx) => {
      await tx.userSession.updateMany({
        where: {
          tenantMembershipId: targetMembership.id,
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
        },
      });

      await tx.tenantMembership.delete({
        where: {
          id: targetMembership.id,
        },
      });

      if (otherMembershipsCount === 0) {
        await tx.user.delete({
          where: {
            id: targetMembership.userId,
          },
        });
      }
    });

    await recordMutationAudit(request, "personnel.delete", {
      membershipId: targetMembership.id,
      deletedUserId: targetMembership.userId,
      deletedEmail: targetMembership.user.email,
      removedLoginAccess: otherMembershipsCount === 0,
    });

    response.status(204).send();
  },
);

export { router as personnelRouter };
