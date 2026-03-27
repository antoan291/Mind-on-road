import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const identityModule: BackendModuleDefinition = {
  key: 'identity',
  displayName: 'Identity',
  description: 'Authentication, sessions and identity policies.',
  boundedContext: 'identity'
};
