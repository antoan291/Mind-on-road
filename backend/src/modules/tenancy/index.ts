import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const tenancyModule: BackendModuleDefinition = {
  key: 'tenancy',
  displayName: 'Tenancy',
  description: 'Tenant isolation, tenant metadata and tenant policies.',
  boundedContext: 'tenancy'
};
