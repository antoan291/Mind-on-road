import type { BackendModuleDefinition } from '../../common/contracts/backend-module-definition';

export const expensesModule: BackendModuleDefinition = {
  key: 'expenses',
  displayName: 'Expenses',
  description: 'Expense records, VAT handling and operational finance rows.',
  boundedContext: 'expenses'
};
