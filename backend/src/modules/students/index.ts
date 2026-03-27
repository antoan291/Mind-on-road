import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const studentsModule: BackendModuleDefinition = {
  key: 'students',
  displayName: 'Students',
  description: 'Student profiles, lifecycle and related permissions.',
  boundedContext: 'students'
};
