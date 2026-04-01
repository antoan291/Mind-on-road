import { PrismaClient } from '@prisma/client';

import { permissionSeeds, roleTemplateSeeds } from './identity-seed-data';
import { seedPermissions, seedRolesForTenant } from './identity-seed-service';

const prisma = new PrismaClient();

async function main() {
  await seedPermissions(prisma);

  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      slug: true
    }
  });

  for (const tenant of tenants) {
    await seedRolesForTenant(prisma, tenant.id);
    console.info(`[seed] seeded roles for tenant ${tenant.slug}`);
  }

  console.info(
    `[seed] seeded ${permissionSeeds.length} permissions and ${roleTemplateSeeds.length} role templates`
  );

  if (tenants.length === 0) {
    console.info(
      '[seed] no tenants exist yet, so tenant-scoped roles were not materialized'
    );
  }
}

void main()
  .catch((error) => {
    console.error('[seed] failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
