export const TENANT_FEATURE_KEYS = [
  'payments',
  'invoices',
  'documents',
  'theory',
  'practical',
  'reports',
  'ai'
] as const;

export type TenantFeatureKey = (typeof TENANT_FEATURE_KEYS)[number];

export interface TenantFeatureSettingRecord {
  id: string;
  featureKey: TenantFeatureKey;
  enabled: boolean;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantFeatureSettingsRepository {
  listByTenant(params: {
    tenantId: string;
  }): Promise<TenantFeatureSettingRecord[]>;
  replaceForTenant(params: {
    tenantId: string;
    updatedBy: string;
    settings: Array<{
      featureKey: TenantFeatureKey;
      enabled: boolean;
    }>;
  }): Promise<TenantFeatureSettingRecord[]>;
}
