import type { BackendModuleDefinition } from './common/contracts/backend-module-definition';
import { aiModule } from './modules/ai';
import { auditModule } from './modules/audit';
import { documentsModule } from './modules/documents';
import { identityModule } from './modules/identity';
import { instructorsModule } from './modules/instructors';
import { invoicingModule } from './modules/invoicing';
import { notificationsModule } from './modules/notifications';
import { paymentsModule } from './modules/payments';
import { platformAdminModule } from './modules/platform-admin';
import { practiceModule } from './modules/practice';
import { reportingModule } from './modules/reporting';
import { schedulingModule } from './modules/scheduling';
import { studentsModule } from './modules/students';
import { tenancyModule } from './modules/tenancy';
import { theoryModule } from './modules/theory';
import { vehiclesModule } from './modules/vehicles';

export const registeredModules: readonly BackendModuleDefinition[] = [
  identityModule,
  tenancyModule,
  platformAdminModule,
  studentsModule,
  instructorsModule,
  vehiclesModule,
  schedulingModule,
  theoryModule,
  practiceModule,
  paymentsModule,
  invoicingModule,
  documentsModule,
  notificationsModule,
  reportingModule,
  auditModule,
  aiModule
];
