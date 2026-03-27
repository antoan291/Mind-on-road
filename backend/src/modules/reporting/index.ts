import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const reportingModule: BackendModuleDefinition = {
  key: 'reporting',
  displayName: 'Reporting',
  description: 'Financial and operational reporting read models.',
  boundedContext: 'reporting'
};
