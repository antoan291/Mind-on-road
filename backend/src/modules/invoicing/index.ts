import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const invoicingModule: BackendModuleDefinition = {
  key: 'invoicing',
  displayName: 'Invoicing',
  description: 'Invoice creation, status tracking and accounting hooks.',
  boundedContext: 'invoicing'
};
