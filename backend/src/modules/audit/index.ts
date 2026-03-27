import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const auditModule: BackendModuleDefinition = {
  key: 'audit',
  displayName: 'Audit',
  description: 'Audit trail and sensitive change tracking.',
  boundedContext: 'audit'
};
