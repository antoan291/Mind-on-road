import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const vehiclesModule: BackendModuleDefinition = {
  key: 'vehicles',
  displayName: 'Vehicles',
  description: 'Vehicle records, assignments and compliance details.',
  boundedContext: 'vehicles'
};
