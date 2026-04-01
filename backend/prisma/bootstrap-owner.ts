import { randomBytes } from 'node:crypto';

import { PrismaClient, TenantMembershipStatus, UserStatus } from '@prisma/client';
import { z } from 'zod';

import { seedPermissions, seedRolesForTenant } from './identity-seed-service';
import { hashPassword } from '../src/modules/identity/domain/services/password-security';

const bootstrapEnvSchema = z.object({
  BOOTSTRAP_TENANT_NAME: z.string().trim().min(1).default('MindOnRoad Demo School'),
  BOOTSTRAP_TENANT_SLUG: z.string().trim().min(1).default('mindonroad-demo-school'),
  BOOTSTRAP_OWNER_FIRST_NAME: z.string().trim().min(1).default('System'),
  BOOTSTRAP_OWNER_LAST_NAME: z.string().trim().min(1).default('Owner'),
  BOOTSTRAP_OWNER_EMAIL: z.string().trim().email().default('owner@mindonroad.local'),
  BOOTSTRAP_OWNER_PHONE: z.string().trim().min(1).default('+359700000001'),
  BOOTSTRAP_OWNER_PASSWORD: z.string().trim().min(12).optional()
});

const prisma = new PrismaClient();

function normalizeTenantSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function generateTemporaryPassword() {
  return randomBytes(12).toString('base64url');
}

async function main() {
  const config = bootstrapEnvSchema.parse(process.env);
  const password = config.BOOTSTRAP_OWNER_PASSWORD ?? generateTemporaryPassword();
  const normalizedTenantSlug = normalizeTenantSlug(config.BOOTSTRAP_TENANT_SLUG);

  if (normalizedTenantSlug.length === 0) {
    throw new Error('Bootstrap tenant slug became empty after normalization.');
  }

  await seedPermissions(prisma);

  const tenant = await prisma.tenant.upsert({
    where: {
      slug: normalizedTenantSlug
    },
    update: {
      name: config.BOOTSTRAP_TENANT_NAME
    },
    create: {
      name: config.BOOTSTRAP_TENANT_NAME,
      slug: normalizedTenantSlug
    }
  });

  await seedRolesForTenant(prisma, tenant.id);

  const existingOwnerUser = await prisma.user.findUnique({
    where: {
      email: config.BOOTSTRAP_OWNER_EMAIL
    },
    select: {
      id: true
    }
  });

  const ownerUser = await prisma.user.upsert({
    where: {
      email: config.BOOTSTRAP_OWNER_EMAIL
    },
    update: {
      firstName: config.BOOTSTRAP_OWNER_FIRST_NAME,
      lastName: config.BOOTSTRAP_OWNER_LAST_NAME,
      displayName: `${config.BOOTSTRAP_OWNER_FIRST_NAME} ${config.BOOTSTRAP_OWNER_LAST_NAME}`,
      phone: config.BOOTSTRAP_OWNER_PHONE,
      status: UserStatus.ACTIVE,
      mustChangePassword: !config.BOOTSTRAP_OWNER_PASSWORD
    },
    create: {
      email: config.BOOTSTRAP_OWNER_EMAIL,
      passwordHash: hashPassword(password),
      firstName: config.BOOTSTRAP_OWNER_FIRST_NAME,
      lastName: config.BOOTSTRAP_OWNER_LAST_NAME,
      displayName: `${config.BOOTSTRAP_OWNER_FIRST_NAME} ${config.BOOTSTRAP_OWNER_LAST_NAME}`,
      phone: config.BOOTSTRAP_OWNER_PHONE,
      status: UserStatus.ACTIVE,
      mustChangePassword: !config.BOOTSTRAP_OWNER_PASSWORD
    }
  });

  const membership = await prisma.tenantMembership.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: ownerUser.id
      }
    },
    update: {
      status: TenantMembershipStatus.ACTIVE,
      joinedAt: new Date()
    },
    create: {
      tenantId: tenant.id,
      userId: ownerUser.id,
      status: TenantMembershipStatus.ACTIVE,
      joinedAt: new Date()
    }
  });

  const ownerRole = await prisma.role.findUniqueOrThrow({
    where: {
      tenantId_key: {
        tenantId: tenant.id,
        key: 'owner'
      }
    }
  });

  await prisma.membershipRole.upsert({
    where: {
      membershipId_roleId: {
        membershipId: membership.id,
        roleId: ownerRole.id
      }
    },
    update: {},
    create: {
      membershipId: membership.id,
      roleId: ownerRole.id
    }
  });

  console.info('[bootstrap] tenant and owner are ready');
  console.info(`[bootstrap] tenant slug: ${tenant.slug}`);
  console.info(`[bootstrap] owner email: ${ownerUser.email}`);

  if (!config.BOOTSTRAP_OWNER_PASSWORD && !existingOwnerUser) {
    console.info(`[bootstrap] generated temporary owner password: ${password}`);
    console.info(
      '[bootstrap] save this password now; only the password hash is stored in the database'
    );
  }
}

void main()
  .catch((error) => {
    console.error('[bootstrap] failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
