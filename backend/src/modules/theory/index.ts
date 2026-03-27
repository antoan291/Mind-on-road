import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const theoryModule: BackendModuleDefinition = {
  key: 'theory',
  displayName: 'Theory',
  description: 'Theory groups, lectures and attendance flows.',
  boundedContext: 'theory'
};
