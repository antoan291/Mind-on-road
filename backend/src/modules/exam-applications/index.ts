import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const examApplicationsModule: BackendModuleDefinition = {
  key: 'exam-applications',
  displayName: 'Exam Applications',
  description: 'Exam application generation, validation and status workflows.',
  boundedContext: 'exam-applications'
};
