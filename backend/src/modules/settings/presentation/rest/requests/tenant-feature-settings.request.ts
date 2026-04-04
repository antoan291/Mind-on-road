import { z } from 'zod';

import { TENANT_FEATURE_KEYS } from '../../../domain/repositories/tenant-feature-settings.repository';

export const tenantFeatureSettingsRequestSchema = z.object({
  settings: z
    .array(
      z.object({
        featureKey: z.enum(TENANT_FEATURE_KEYS),
        enabled: z.coerce.boolean()
      })
    )
    .min(1)
    .max(TENANT_FEATURE_KEYS.length)
});
