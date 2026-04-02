import type { PrismaClient } from '@prisma/client';

import { permissionSeeds, roleTemplateSeeds } from './identity-seed-data';

export async function seedPermissions(prisma: PrismaClient) {
  for (const permission of permissionSeeds) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        displayName: permission.displayName,
        description: permission.description
      },
      create: permission
    });
  }
}

export async function seedRolesForTenant(prisma: PrismaClient, tenantId: string) {
  for (const roleTemplate of roleTemplateSeeds) {
    const role = await prisma.role.upsert({
      where: {
        tenantId_key: {
          tenantId,
          key: roleTemplate.key
        }
      },
      update: {
        displayName: roleTemplate.displayName,
        description: roleTemplate.description,
        isSystemTemplate: true
      },
      create: {
        tenantId,
        key: roleTemplate.key,
        displayName: roleTemplate.displayName,
        description: roleTemplate.description,
        isSystemTemplate: true
      }
    });

    const permissions = await prisma.permission.findMany({
      where: {
        key: {
          in: roleTemplate.permissionKeys
        }
      },
      select: {
        id: true,
        key: true
      }
    });

    const foundPermissionKeys = new Set(
      permissions.map((permission) => permission.key)
    );

    const missingPermissionKeys = roleTemplate.permissionKeys.filter(
      (permissionKey) => !foundPermissionKeys.has(permissionKey)
    );

    if (missingPermissionKeys.length > 0) {
      throw new Error(
        `Role template "${roleTemplate.key}" references missing permissions: ${missingPermissionKeys.join(', ')}`
      );
    }

    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }
}
