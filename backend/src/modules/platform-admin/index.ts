import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const platformAdminModule: BackendModuleDefinition = {
  key: 'platform-admin',
  displayName: 'Platform Admin',
  description: 'Platform-level administration, licensing and feature control.',
  boundedContext: 'platform-admin'
};
