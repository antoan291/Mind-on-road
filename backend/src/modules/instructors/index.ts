import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const instructorsModule: BackendModuleDefinition = {
  key: 'instructors',
  displayName: 'Instructors',
  description: 'Instructor profiles, assignments and permissions.',
  boundedContext: 'instructors'
};
