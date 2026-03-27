import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const schedulingModule: BackendModuleDefinition = {
  key: 'scheduling',
  displayName: 'Scheduling',
  description: 'Calendar logic, lesson slots and scheduling constraints.',
  boundedContext: 'scheduling'
};
