import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const practiceModule: BackendModuleDefinition = {
  key: 'practice',
  displayName: 'Practice',
  description: 'Practical lessons, feedback and attendance logic.',
  boundedContext: 'practice'
};
