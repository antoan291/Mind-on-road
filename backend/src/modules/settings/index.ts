import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const settingsModule: BackendModuleDefinition = {
  key: 'settings',
  displayName: 'Settings',
  description: 'Tenant-level feature settings and operational configuration.',
  boundedContext: 'settings'
};
