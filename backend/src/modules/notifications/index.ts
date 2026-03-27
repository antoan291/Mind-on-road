import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const notificationsModule: BackendModuleDefinition = {
  key: 'notifications',
  displayName: 'Notifications',
  description: 'Message delivery, reminders and notification policies.',
  boundedContext: 'notifications'
};
