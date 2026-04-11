import { prismaClient } from "../../infrastructure/database/prisma/prisma-client";
import { BusinessAssistantService } from "../../modules/ai/application/services/business-assistant.service";
import { AuthAuditService } from "../../modules/audit/application/services/auth-audit.service";
import { PrismaAuditLogRepository } from "../../modules/audit/infrastructure/persistence/prisma/prisma-audit-log.repository";
import { DocumentsCommandService } from "../../modules/documents/application/services/documents-command.service";
import { DocumentsQueryService } from "../../modules/documents/application/services/documents-query.service";
import { PrismaDocumentsRepository } from "../../modules/documents/infrastructure/persistence/prisma/prisma-documents.repository";
import { ExamApplicationsCommandService } from "../../modules/exam-applications/application/services/exam-applications-command.service";
import { ExamApplicationsQueryService } from "../../modules/exam-applications/application/services/exam-applications-query.service";
import { PrismaExamApplicationsRepository } from "../../modules/exam-applications/infrastructure/persistence/prisma/prisma-exam-applications.repository";
import { ExpensesCommandService } from "../../modules/expenses/application/services/expenses-command.service";
import { ExpensesQueryService } from "../../modules/expenses/application/services/expenses-query.service";
import { PrismaExpensesRepository } from "../../modules/expenses/infrastructure/persistence/prisma/prisma-expenses.repository";
import {
  LoginService,
  SessionService,
} from "../../modules/identity/application/services/login.service";
import { PrismaIdentityAuthRepository } from "../../modules/identity/infrastructure/persistence/prisma/prisma-identity-auth.repository";
import { InvoicesCommandService } from "../../modules/invoicing/application/services/invoices-command.service";
import { InvoicesQueryService } from "../../modules/invoicing/application/services/invoices-query.service";
import { PrismaInvoicesRepository } from "../../modules/invoicing/infrastructure/persistence/prisma/prisma-invoices.repository";
import { NotificationsQueryService } from "../../modules/notifications/application/services/notifications-query.service";
import { PrismaNotificationsRepository } from "../../modules/notifications/infrastructure/persistence/prisma/prisma-notifications.repository";
import { PaymentsCommandService } from "../../modules/payments/application/services/payments-command.service";
import { PaymentsQueryService } from "../../modules/payments/application/services/payments-query.service";
import { PrismaPaymentsRepository } from "../../modules/payments/infrastructure/persistence/prisma/prisma-payments.repository";
import { PracticalLessonsCommandService } from "../../modules/practice/application/services/practical-lessons-command.service";
import { PracticalLessonsQueryService } from "../../modules/practice/application/services/practical-lessons-query.service";
import { PrismaPracticalLessonsRepository } from "../../modules/practice/infrastructure/persistence/prisma/prisma-practical-lessons.repository";
import { FinanceReportQueryService } from "../../modules/reporting/application/services/finance-report-query.service";
import { TenantFeatureSettingsService } from "../../modules/settings/application/services/tenant-feature-settings.service";
import { PrismaTenantFeatureSettingsRepository } from "../../modules/settings/infrastructure/persistence/prisma/prisma-tenant-feature-settings.repository";
import { StudentsCommandService } from "../../modules/students/application/services/students-command.service";
import { StudentsDeterminatorService } from "../../modules/students/application/services/students-determinator.service";
import { StudentsQueryService } from "../../modules/students/application/services/students-query.service";
import { PrismaStudentsRepository } from "../../modules/students/infrastructure/persistence/prisma/prisma-students.repository";
import { TheoryGroupsCommandService } from "../../modules/theory/application/services/theory-groups-command.service";
import { TheoryGroupsQueryService } from "../../modules/theory/application/services/theory-groups-query.service";
import { PrismaTheoryGroupsRepository } from "../../modules/theory/infrastructure/persistence/prisma/prisma-theory-groups.repository";
import { VehiclesCommandService } from "../../modules/vehicles/application/services/vehicles-command.service";
import { VehiclesQueryService } from "../../modules/vehicles/application/services/vehicles-query.service";
import { PrismaVehiclesRepository } from "../../modules/vehicles/infrastructure/persistence/prisma/prisma-vehicles.repository";

export const identityAuthRepository = new PrismaIdentityAuthRepository(prismaClient);

export const authAuditService = new AuthAuditService(
  new PrismaAuditLogRepository(prismaClient),
);

export const loginService = new LoginService(identityAuthRepository, authAuditService);

export const sessionService = new SessionService(identityAuthRepository, authAuditService);

export const studentsQueryService = new StudentsQueryService(
  new PrismaStudentsRepository(prismaClient),
);

export const studentsCommandService = new StudentsCommandService(
  new PrismaStudentsRepository(prismaClient),
  identityAuthRepository,
);

export const studentsDeterminatorService = new StudentsDeterminatorService(
  new PrismaStudentsRepository(prismaClient),
);

const paymentsRepository = new PrismaPaymentsRepository(prismaClient);
export const paymentsQueryService = new PaymentsQueryService(paymentsRepository);
export const paymentsCommandService = new PaymentsCommandService(paymentsRepository);

const expensesRepository = new PrismaExpensesRepository(prismaClient);
export const expensesQueryService = new ExpensesQueryService(expensesRepository);
export const expensesCommandService = new ExpensesCommandService(expensesRepository);

export const financeReportQueryService = new FinanceReportQueryService(
  paymentsQueryService,
  expensesQueryService,
);

const practicalLessonsRepository = new PrismaPracticalLessonsRepository(prismaClient);
export const practicalLessonsQueryService = new PracticalLessonsQueryService(
  practicalLessonsRepository,
);
export const practicalLessonsCommandService = new PracticalLessonsCommandService(
  practicalLessonsRepository,
);

const documentsRepository = new PrismaDocumentsRepository(prismaClient);
export const documentsQueryService = new DocumentsQueryService(documentsRepository);
export const documentsCommandService = new DocumentsCommandService(documentsRepository);

export const notificationsQueryService = new NotificationsQueryService(
  new PrismaNotificationsRepository(prismaClient),
  studentsQueryService,
  practicalLessonsQueryService,
  documentsQueryService,
);

const examApplicationsRepository = new PrismaExamApplicationsRepository(prismaClient);
export const examApplicationsQueryService = new ExamApplicationsQueryService(
  examApplicationsRepository,
);
export const examApplicationsCommandService = new ExamApplicationsCommandService(
  examApplicationsRepository,
);

const invoicesRepository = new PrismaInvoicesRepository(prismaClient);
export const invoicesQueryService = new InvoicesQueryService(invoicesRepository);
export const invoicesCommandService = new InvoicesCommandService(invoicesRepository);

const theoryGroupsRepository = new PrismaTheoryGroupsRepository(prismaClient);
export const theoryGroupsQueryService = new TheoryGroupsQueryService(theoryGroupsRepository);
export const theoryGroupsCommandService = new TheoryGroupsCommandService(theoryGroupsRepository);

const vehiclesRepository = new PrismaVehiclesRepository(prismaClient);
export const vehiclesQueryService = new VehiclesQueryService(vehiclesRepository);
export const vehiclesCommandService = new VehiclesCommandService(vehiclesRepository);

export const tenantFeatureSettingsService = new TenantFeatureSettingsService(
  new PrismaTenantFeatureSettingsRepository(prismaClient),
);

export const businessAssistantService = new BusinessAssistantService(
  studentsQueryService,
  paymentsQueryService,
  expensesQueryService,
  documentsQueryService,
  invoicesQueryService,
  theoryGroupsQueryService,
  practicalLessonsQueryService,
  vehiclesQueryService,
);
