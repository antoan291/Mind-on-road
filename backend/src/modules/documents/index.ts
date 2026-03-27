import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const documentsModule: BackendModuleDefinition = {
  key: 'documents',
  displayName: 'Documents',
  description: 'Document metadata, uploads and document workflows.',
  boundedContext: 'documents'
};
