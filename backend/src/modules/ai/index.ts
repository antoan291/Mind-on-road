import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const aiModule: BackendModuleDefinition = {
  key: 'ai',
  displayName: 'AI',
  description: 'AI assistant, OCR and prediction flows.',
  boundedContext: 'ai'
};
