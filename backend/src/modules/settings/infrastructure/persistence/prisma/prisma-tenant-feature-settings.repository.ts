import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  TenantFeatureKey,
  TenantFeatureSettingsRepository,
  TenantFeatureSettingRecord
} from '../../../domain/repositories/tenant-feature-settings.repository';
import { TENANT_FEATURE_KEYS } from '../../../domain/repositories/tenant-feature-settings.repository';

const tenantFeatureSettingSelect = {
  id: true,
  featureKey: true,
  enabled: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.TenantFeatureSettingSelect;

export class PrismaTenantFeatureSettingsRepository
  implements TenantFeatureSettingsRepository
{
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
  }): Promise<TenantFeatureSettingRecord[]> {
    const settings = await this.prisma.tenantFeatureSetting.findMany({
      where: {
        tenantId: params.tenantId
      },
      orderBy: {
        featureKey: 'asc'
      },
      select: tenantFeatureSettingSelect
    });

    return settings.map((setting) => ({
      ...setting,
      featureKey: setting.featureKey as TenantFeatureKey
    }));
  }

  public async replaceForTenant(params: {
    tenantId: string;
    updatedBy: string;
    settings: Array<{
      featureKey: TenantFeatureKey;
      enabled: boolean;
    }>;
  }): Promise<TenantFeatureSettingRecord[]> {
    await this.prisma.$transaction(
      TENANT_FEATURE_KEYS.map((featureKey) => {
        const nextValue =
          params.settings.find((setting) => setting.featureKey === featureKey)
            ?.enabled ?? true;

        return this.prisma.tenantFeatureSetting.upsert({
          where: {
            tenantId_featureKey: {
              tenantId: params.tenantId,
              featureKey
            }
          },
          create: {
            tenantId: params.tenantId,
            featureKey,
            enabled: nextValue,
            updatedBy: params.updatedBy
          },
          update: {
            enabled: nextValue,
            updatedBy: params.updatedBy
          }
        });
      })
    );

    return this.listByTenant({ tenantId: params.tenantId });
  }
}
