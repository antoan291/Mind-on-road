import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const paymentsModule: BackendModuleDefinition = {
  key: 'payments',
  displayName: 'Payments',
  description: 'Payment records, status handling and finance workflows.',
  boundedContext: 'payments'
};
