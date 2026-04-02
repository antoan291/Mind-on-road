import { registeredModules } from './module-registry';
import type { BackendModuleDefinition } from './common/contracts/backend-module-definition';

export interface BackendAppDefinition {
  appName: string;
  modules: readonly BackendModuleDefinition[];
}

export function createAppDefinition(): BackendAppDefinition {
  return {
    appName: 'mindonroad-backend',
    modules: registeredModules
  };
}
