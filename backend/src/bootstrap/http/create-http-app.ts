import express = require('express');
import cookie = require('cookie');
import cors = require('cors');
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { z } from 'zod';

import { appConfig } from '../../config/app.config';
import {
  deleteCacheByPrefix,
  readCacheJson,
  writeCacheJson
} from '../../infrastructure/cache/redis/redis-cache-client';
import { prismaClient } from '../../infrastructure/database/prisma/prisma-client';
import { BusinessAssistantService } from '../../modules/ai/application/services/business-assistant.service';
import { businessAssistantRequestSchema } from '../../modules/ai/presentation/rest/requests/business-assistant.request';
import { AuthAuditService } from '../../modules/audit/application/services/auth-audit.service';
import { PrismaAuditLogRepository } from '../../modules/audit/infrastructure/persistence/prisma/prisma-audit-log.repository';
import { DocumentsCommandService } from '../../modules/documents/application/services/documents-command.service';
import { DocumentsQueryService } from '../../modules/documents/application/services/documents-query.service';
import { PrismaDocumentsRepository } from '../../modules/documents/infrastructure/persistence/prisma/prisma-documents.repository';
import { documentOcrRunRequestSchema } from '../../modules/documents/presentation/rest/requests/document-ocr.request';
import {
  documentIdParamsSchema,
  documentWriteRequestSchema
} from '../../modules/documents/presentation/rest/requests/document-write.request';
import {
  ExamApplicationsCommandService,
  ExamApplicationValidationError
} from '../../modules/exam-applications/application/services/exam-applications-command.service';
import { ExamApplicationsQueryService } from '../../modules/exam-applications/application/services/exam-applications-query.service';
import { PrismaExamApplicationsRepository } from '../../modules/exam-applications/infrastructure/persistence/prisma/prisma-exam-applications.repository';
import {
  examApplicationGenerateRequestSchema,
  examApplicationIdParamsSchema,
  examApplicationStatusUpdateRequestSchema
} from '../../modules/exam-applications/presentation/rest/requests/exam-application-write.request';
import { ExpensesCommandService } from '../../modules/expenses/application/services/expenses-command.service';
import { ExpensesQueryService } from '../../modules/expenses/application/services/expenses-query.service';
import { PrismaExpensesRepository } from '../../modules/expenses/infrastructure/persistence/prisma/prisma-expenses.repository';
import { expenseCreateRequestSchema } from '../../modules/expenses/presentation/rest/requests/expense-create.request';
import {
  AuthenticationError,
  LoginService,
  PasswordPolicyError,
  SessionAuthenticationError,
  SessionService
} from '../../modules/identity/application/services/login.service';
import {
  deriveCsrfToken,
  isMatchingCsrfToken
} from '../../modules/identity/domain/services/password-security';
import { PrismaIdentityAuthRepository } from '../../modules/identity/infrastructure/persistence/prisma/prisma-identity-auth.repository';
import { changePasswordRequestSchema } from '../../modules/identity/presentation/rest/requests/change-password.request';
import { loginRequestSchema } from '../../modules/identity/presentation/rest/requests/login.request';
import type { LoginResponse } from '../../modules/identity/presentation/rest/responses/login.response';
import { InvoicesCommandService } from '../../modules/invoicing/application/services/invoices-command.service';
import { InvoicesQueryService } from '../../modules/invoicing/application/services/invoices-query.service';
import { PrismaInvoicesRepository } from '../../modules/invoicing/infrastructure/persistence/prisma/prisma-invoices.repository';
import {
  invoiceCreateRequestSchema,
  invoiceIdParamsSchema,
  invoiceUpdateRequestSchema
} from '../../modules/invoicing/presentation/rest/requests/invoice-write.request';
import { NotificationsQueryService } from '../../modules/notifications/application/services/notifications-query.service';
import { PrismaNotificationsRepository } from '../../modules/notifications/infrastructure/persistence/prisma/prisma-notifications.repository';
import { PaymentsCommandService } from '../../modules/payments/application/services/payments-command.service';
import { PaymentsQueryService } from '../../modules/payments/application/services/payments-query.service';
import { PrismaPaymentsRepository } from '../../modules/payments/infrastructure/persistence/prisma/prisma-payments.repository';
import {
  paymentCreateRequestSchema,
  paymentIdParamsSchema,
  paymentUpdateRequestSchema
} from '../../modules/payments/presentation/rest/requests/payment-write.request';
import { PracticalLessonsCommandService } from '../../modules/practice/application/services/practical-lessons-command.service';
import {
  PracticalLessonInstructorScheduleConflictError,
  PracticalLessonStudentScheduleConflictError,
  PracticalLessonVehicleScheduleConflictError
} from '../../modules/practice/domain/practical-lessons.errors';
import { PracticalLessonsQueryService } from '../../modules/practice/application/services/practical-lessons-query.service';
import { PrismaPracticalLessonsRepository } from '../../modules/practice/infrastructure/persistence/prisma/prisma-practical-lessons.repository';
import { practicalLessonCreateRequestSchema } from '../../modules/practice/presentation/rest/requests/practical-lesson-create.request';
import { practicalLessonParentFeedbackRequestSchema } from '../../modules/practice/presentation/rest/requests/practical-lesson-parent-feedback.request';
import { practicalLessonStudentFeedbackRequestSchema } from '../../modules/practice/presentation/rest/requests/practical-lesson-feedback.request';
import { practicalLessonUpdateRequestSchema } from '../../modules/practice/presentation/rest/requests/practical-lesson-update.request';
import { FinanceReportQueryService } from '../../modules/reporting/application/services/finance-report-query.service';
import {
  StudentAlreadyExistsError,
  StudentsCommandService
} from '../../modules/students/application/services/students-command.service';
import { StudentsDeterminatorService } from '../../modules/students/application/services/students-determinator.service';
import { StudentsQueryService } from '../../modules/students/application/services/students-query.service';
import type { StudentWriteInput } from '../../modules/students/domain/repositories/students.repository';
import { PrismaStudentsRepository } from '../../modules/students/infrastructure/persistence/prisma/prisma-students.repository';
import {
  determinatorSessionRequestSchema,
  determinatorSessionsQuerySchema
} from '../../modules/students/presentation/rest/requests/determinator-session.request';
import { studentMutationRequestSchema } from '../../modules/students/presentation/rest/requests/student-mutation.request';
import { TenantFeatureSettingsService } from '../../modules/settings/application/services/tenant-feature-settings.service';
import { PrismaTenantFeatureSettingsRepository } from '../../modules/settings/infrastructure/persistence/prisma/prisma-tenant-feature-settings.repository';
import { tenantFeatureSettingsRequestSchema } from '../../modules/settings/presentation/rest/requests/tenant-feature-settings.request';
import { TheoryGroupsCommandService } from '../../modules/theory/application/services/theory-groups-command.service';
import { TheoryGroupsQueryService } from '../../modules/theory/application/services/theory-groups-query.service';
import { PrismaTheoryGroupsRepository } from '../../modules/theory/infrastructure/persistence/prisma/prisma-theory-groups.repository';
import {
  theoryAttendanceSaveParamsSchema,
  theoryAttendanceSaveRequestSchema
} from '../../modules/theory/presentation/rest/requests/theory-attendance-save.request';
import { VehiclesCommandService } from '../../modules/vehicles/application/services/vehicles-command.service';
import { VehiclesQueryService } from '../../modules/vehicles/application/services/vehicles-query.service';
import { PrismaVehiclesRepository } from '../../modules/vehicles/infrastructure/persistence/prisma/prisma-vehicles.repository';
import {
  vehicleCreateRequestSchema,
  vehicleIdParamsSchema,
  vehicleUpdateRequestSchema
} from '../../modules/vehicles/presentation/rest/requests/vehicle-write.request';

const rateLimitModule = require('express-rate-limit') as typeof import('express-rate-limit');
const helmetModule = require('helmet') as typeof import('helmet');
const identityAuthRepository = new PrismaIdentityAuthRepository(prismaClient);
const authAuditService = new AuthAuditService(
  new PrismaAuditLogRepository(prismaClient)
);
const loginService = new LoginService(identityAuthRepository, authAuditService);
const sessionService = new SessionService(
  identityAuthRepository,
  authAuditService
);
const studentsQueryService = new StudentsQueryService(
  new PrismaStudentsRepository(prismaClient)
);
const studentsCommandService = new StudentsCommandService(
  new PrismaStudentsRepository(prismaClient),
  identityAuthRepository
);
const studentsDeterminatorService = new StudentsDeterminatorService(
  new PrismaStudentsRepository(prismaClient)
);
const paymentsRepository = new PrismaPaymentsRepository(prismaClient);
const paymentsQueryService = new PaymentsQueryService(paymentsRepository);
const paymentsCommandService = new PaymentsCommandService(paymentsRepository);
const expensesRepository = new PrismaExpensesRepository(prismaClient);
const expensesQueryService = new ExpensesQueryService(expensesRepository);
const expensesCommandService = new ExpensesCommandService(expensesRepository);
const financeReportQueryService = new FinanceReportQueryService(
  paymentsQueryService,
  expensesQueryService
);
const practicalLessonsRepository = new PrismaPracticalLessonsRepository(
  prismaClient
);
const practicalLessonsQueryService = new PracticalLessonsQueryService(
  practicalLessonsRepository
);
const practicalLessonsCommandService = new PracticalLessonsCommandService(
  practicalLessonsRepository
);
const notificationsQueryService = new NotificationsQueryService(
  new PrismaNotificationsRepository(prismaClient),
  studentsQueryService,
  practicalLessonsQueryService
);
const documentsRepository = new PrismaDocumentsRepository(prismaClient);
const documentsQueryService = new DocumentsQueryService(documentsRepository);
const documentsCommandService = new DocumentsCommandService(
  documentsRepository
);
const examApplicationsRepository = new PrismaExamApplicationsRepository(
  prismaClient
);
const examApplicationsQueryService = new ExamApplicationsQueryService(
  examApplicationsRepository
);
const examApplicationsCommandService = new ExamApplicationsCommandService(
  examApplicationsRepository
);
const invoicesRepository = new PrismaInvoicesRepository(prismaClient);
const invoicesQueryService = new InvoicesQueryService(invoicesRepository);
const invoicesCommandService = new InvoicesCommandService(invoicesRepository);
const theoryGroupsRepository = new PrismaTheoryGroupsRepository(prismaClient);
const theoryGroupsQueryService = new TheoryGroupsQueryService(
  theoryGroupsRepository
);
const theoryGroupsCommandService = new TheoryGroupsCommandService(
  theoryGroupsRepository
);
const vehiclesRepository = new PrismaVehiclesRepository(prismaClient);
const vehiclesQueryService = new VehiclesQueryService(vehiclesRepository);
const vehiclesCommandService = new VehiclesCommandService(vehiclesRepository);
const tenantFeatureSettingsService = new TenantFeatureSettingsService(
  new PrismaTenantFeatureSettingsRepository(prismaClient)
);
const businessAssistantService = new BusinessAssistantService(
  studentsQueryService,
  paymentsQueryService,
  expensesQueryService,
  documentsQueryService,
  invoicesQueryService,
  theoryGroupsQueryService,
  practicalLessonsQueryService,
  vehiclesQueryService
);
const rateLimit = rateLimitModule.rateLimit ?? rateLimitModule.default;
const helmet = helmetModule.default;
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts. Try again later.'
  }
});
const changePasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many password change attempts. Try again later.'
  }
});
const aiAssistantRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI assistant requests. Try again later.'
  }
});
const ocrRunRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many OCR requests. Try again later.'
  }
});
const globalMutationRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS',
  message: {
    error: 'Too many requests. Please slow down.'
  }
});

interface AuthenticatedRequest extends express.Request {
  auth?: Awaited<ReturnType<SessionService['authenticate']>>;
}

const studentIdParamsSchema = z.object({
  studentId: z.string().uuid()
});

const expenseIdParamsSchema = z.object({
  expenseId: z.string().uuid()
});

const lessonIdParamsSchema = z.object({
  lessonId: z.string().uuid()
});

const TENANT_CACHE_TTL_SECONDS = 20;

export function createHttpApp() {
  const app = express();

  if (appConfig.env === 'production' || appConfig.env === 'staging') {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');
  app.use(globalMutationRateLimiter);
  app.use((req, res, next) => {
    if (
      req.path.startsWith('/auth/') ||
      req.path.startsWith('/reports/') ||
      req.path.startsWith('/ai/')
    ) {
      res.set('Cache-Control', 'no-store');
      res.set('Pragma', 'no-cache');
    }
    next();
  });
  app.use(
    cors({
      origin: appConfig.webAppUrl,
      credentials: true
    })
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    })
  );
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));

  app.get('/health', (_request, response) => {
    response.json({
      status: 'ok'
    });
  });

  app.post('/auth/login', loginRateLimiter, async (request, response) => {
    const parsedRequest = loginRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: 'Invalid login payload.'
      });
      return;
    }

    try {
      const result = await loginService.execute({
        ...parsedRequest.data,
        ipAddress: request.ip,
        userAgent: request.get('user-agent') ?? undefined
      });

      response.cookie(appConfig.authCookieName, result.accessToken, {
        httpOnly: true,
        secure: appConfig.env !== 'development',
        sameSite: 'strict',
        path: '/',
        maxAge: appConfig.sessionTtlHours * 60 * 60 * 1000
      });

      const loginResponse: LoginResponse = {
        csrfToken: result.csrfToken,
        sessionId: result.sessionId,
        expiresAt: result.expiresAt,
        tenantSlug: result.tenantSlug,
        mustChangePassword: result.mustChangePassword,
        user: result.user
      };

      response.status(200).json(loginResponse);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        response.status(401).json({
          error: 'Invalid credentials.'
        });
        return;
      }

      response.status(500).json({
        error: 'Login failed.'
      });
    }
  });

  app.get('/auth/me', requireAuthenticatedSession, (request: AuthenticatedRequest, response) => {
    response.status(200).json(request.auth);
  });

  app.get(
    '/settings/features',
    requireAuthenticatedSession,
    async (request: AuthenticatedRequest, response) => {
      const cacheKey = buildTenantCacheKey(
        request.auth!.tenantId,
        'settings-features'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = await tenantFeatureSettingsService.listSettings({
        tenantId: request.auth!.tenantId
      });

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.put(
    '/settings/features',
    requireAuthenticatedSession,
    requireOwnerRole,
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = tenantFeatureSettingsRequestSchema.safeParse(
        request.body
      );

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid settings payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const items = await tenantFeatureSettingsService.saveSettings({
        tenantId: request.auth!.tenantId,
        updatedBy: request.auth!.user.displayName,
        settings: parsedRequest.data.settings
      });

      await recordMutationAudit(request, 'settings.features.update', {
        settingsCount: items.length,
        featureKeys: items.map((item) => item.key)
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json({
        items
      });
    }
  );

  app.get(
    '/audit/logs',
    requireAuthenticatedSession,
    requirePermission('audit.read'),
    async (request: AuthenticatedRequest, response) => {
      const auditLogs = await authAuditService.listRecentTenantEvents({
        tenantId: request.auth!.tenantId,
        limit: 20
      });

      response.status(200).json({
        items: auditLogs
      });
    }
  );

  app.get(
    '/students',
    requireAuthenticatedSession,
    requirePermission('students.read'),
    async (request: AuthenticatedRequest, response) => {
      const accessScope = await resolveReadAccessScope(request.auth!);
      const cacheKey = buildScopedTenantCacheKey(
        request.auth!,
        accessScope,
        'students'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = filterStudentsForScope(
        await studentsQueryService.listStudents({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      );

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.get(
    '/students/:studentId',
    requireAuthenticatedSession,
    requirePermission('students.read'),
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = studentIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid student id.'
        });
        return;
      }

      const student = await studentsQueryService.getStudentById({
        tenantId: request.auth!.tenantId,
        studentId: parsedParams.data.studentId
      });

      const accessScope = await resolveReadAccessScope(request.auth!);

      if (!student || !isStudentVisibleForScope(student, accessScope)) {
        response.status(404).json({
          error: 'Student not found.'
        });
        return;
      }

      response.status(200).json(student);
    }
  );

  app.post(
    '/students',
    requireAuthenticatedSession,
    requirePermission('students.create'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = studentMutationRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid student payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      try {
        const student = await studentsCommandService.createStudent({
          tenantId: request.auth!.tenantId,
          student: toStudentWriteInput(parsedRequest.data)
        });

        await recordMutationAudit(request, 'students.create', {
          studentId: student.id,
          studentName: student.name,
          categoryCode: student.enrollment?.categoryCode ?? null,
          portalAccessStatus: student.portalAccess?.status ?? null
        });
        await deleteTenantReadCaches(request.auth!.tenantId);

        response.status(201).json(student);
      } catch (error) {
        if (error instanceof StudentAlreadyExistsError) {
          response.status(409).json({
            error: error.message
          });
          return;
        }

        response.status(500).json({
          error: 'Student creation failed.'
        });
      }
    }
  );

  app.put(
    '/students/:studentId',
    requireAuthenticatedSession,
    requirePermission('students.update'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = studentIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid student id.'
        });
        return;
      }

      const parsedRequest = studentMutationRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid student payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      try {
        const accessScope = await resolveReadAccessScope(request.auth!);

        if (
          accessScope.mode !== 'tenant' &&
          !accessScope.studentIds.has(parsedParams.data.studentId)
        ) {
          response.status(404).json({
            error: 'Student not found.'
          });
          return;
        }

        const student = await studentsCommandService.updateStudent({
          tenantId: request.auth!.tenantId,
          studentId: parsedParams.data.studentId,
          student: toStudentWriteInput(parsedRequest.data)
        });

        if (!student) {
          response.status(404).json({
            error: 'Student not found.'
          });
          return;
        }

        await recordMutationAudit(request, 'students.update', {
          studentId: student.id,
          studentName: student.name,
          categoryCode: student.enrollment?.categoryCode ?? null,
          portalAccessStatus: student.portalAccess?.status ?? null
        });
        await deleteTenantReadCaches(request.auth!.tenantId);

        response.status(200).json(student);
      } catch (error) {
        if (error instanceof StudentAlreadyExistsError) {
          response.status(409).json({
            error: error.message
          });
          return;
        }

        response.status(500).json({
          error: 'Student update failed.'
        });
      }
    }
  );

  app.delete(
    '/students/:studentId',
    requireAuthenticatedSession,
    requireAnyRole(['owner', 'admin']),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = studentIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid student id.'
        });
        return;
      }

      const deleted = await studentsCommandService.deleteStudent({
        tenantId: request.auth!.tenantId,
        studentId: parsedParams.data.studentId
      });

      if (!deleted) {
        response.status(404).json({
          error: 'Student not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'students.delete', {
        studentId: parsedParams.data.studentId
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(204).send();
    }
  );

  app.get(
    '/determinator/sessions',
    requireAuthenticatedSession,
    requirePermission('students.read'),
    async (request: AuthenticatedRequest, response) => {
      const parsedQuery = determinatorSessionsQuerySchema.safeParse(
        request.query
      );

      if (!parsedQuery.success) {
        response.status(400).json({
          error: 'Invalid determinator query.'
        });
        return;
      }

      const accessScope = await resolveReadAccessScope(request.auth!);
      const cacheKey = buildScopedTenantCacheKey(
        request.auth!,
        accessScope,
        `determinator:${parsedQuery.data.studentId ?? 'all'}`
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = filterDeterminatorSessionsForScope(
        await studentsDeterminatorService.listSessions({
          tenantId: request.auth!.tenantId,
          studentId: parsedQuery.data.studentId
        }),
        accessScope
      );

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.get(
    '/payments',
    requireAuthenticatedSession,
    requirePermission('payments.read'),
    async (request: AuthenticatedRequest, response) => {
      const accessScope = await resolveReadAccessScope(request.auth!);
      const cacheKey = buildScopedTenantCacheKey(
        request.auth!,
        accessScope,
        'payments'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = filterStudentOwnedRecordsForScope(
        await paymentsQueryService.listPayments({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      );

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.post(
    '/payments',
    requireAuthenticatedSession,
    requirePermission('payments.record'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = paymentCreateRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid payment payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const paymentAccessScope = await resolveReadAccessScope(request.auth!);
      if (
        paymentAccessScope.mode !== 'tenant' &&
        !paymentAccessScope.studentIds.has(parsedRequest.data.studentId)
      ) {
        response.status(403).json({ error: 'Forbidden.' });
        return;
      }

      const paymentNumber =
        parsedRequest.data.paymentNumber ??
        `PAY-${new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '')}-${Date.now().toString().slice(-6)}`;

      const payment = await paymentsCommandService.createPayment({
        tenantId: request.auth!.tenantId,
        payment: {
          studentId: parsedRequest.data.studentId,
          studentName: '',
          paymentNumber,
          amount: parsedRequest.data.amount,
          paidAmount:
            parsedRequest.data.paidAmount ??
            (parsedRequest.data.status === 'PAID' ||
            parsedRequest.data.status === 'PARTIAL'
              ? parsedRequest.data.amount
              : 0),
          method: parsedRequest.data.method,
          status: parsedRequest.data.status,
          paidAt: new Date(`${parsedRequest.data.paidAt}T00:00:00.000Z`),
          note: parsedRequest.data.note ?? null
        }
      });

      if (!payment) {
        response.status(404).json({
          error: 'Payment student not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'payments.create', {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        studentId: payment.studentId,
        amount: payment.amount,
        status: payment.status
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(201).json(payment);
    }
  );

  app.put(
    '/payments/:paymentId',
    requireAuthenticatedSession,
    requirePermission('payments.record'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = paymentIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid payment id.'
        });
        return;
      }

      const parsedRequest = paymentUpdateRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid payment payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const payment = await paymentsCommandService.updatePayment({
        tenantId: request.auth!.tenantId,
        paymentId: parsedParams.data.paymentId,
        payment: {
          studentId: parsedRequest.data.studentId,
          paymentNumber: parsedRequest.data.paymentNumber,
          amount: parsedRequest.data.amount,
          paidAmount:
            parsedRequest.data.paidAmount ??
            (parsedRequest.data.status === 'PAID' &&
            parsedRequest.data.amount !== undefined
              ? parsedRequest.data.amount
              : parsedRequest.data.status === 'PENDING' ||
                  parsedRequest.data.status === 'OVERDUE' ||
                  parsedRequest.data.status === 'CANCELED'
                ? 0
                : undefined),
          method: parsedRequest.data.method,
          status: parsedRequest.data.status,
          paidAt: parsedRequest.data.paidAt
            ? new Date(`${parsedRequest.data.paidAt}T00:00:00.000Z`)
            : undefined,
          note: parsedRequest.data.note ?? undefined
        }
      });

      if (!payment) {
        response.status(404).json({
          error: 'Payment not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'payments.update', {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        studentId: payment.studentId,
        amount: payment.amount,
        status: payment.status
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(payment);
    }
  );

  app.delete(
    '/payments/:paymentId',
    requireAuthenticatedSession,
    requireAnyRole(['owner', 'admin']),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = paymentIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid payment id.'
        });
        return;
      }

      const deleted = await paymentsCommandService.deletePayment({
        tenantId: request.auth!.tenantId,
        paymentId: parsedParams.data.paymentId
      });

      if (!deleted) {
        response.status(404).json({
          error: 'Payment not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'payments.delete', {
        paymentId: parsedParams.data.paymentId
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(204).send();
    }
  );

  app.get(
    '/expenses',
    requireAuthenticatedSession,
    requirePermission('payments.read'),
    async (request: AuthenticatedRequest, response) => {
      const cacheKey = buildTenantCacheKey(request.auth!.tenantId, 'expenses');
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = await expensesQueryService.listExpenses({
        tenantId: request.auth!.tenantId
      });

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.post(
    '/expenses',
    requireAuthenticatedSession,
    requirePermission('payments.record'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = expenseCreateRequestSchema.safeParse(
        request.body
      );

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid expense payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const expense = await expensesCommandService.createExpense({
        tenantId: request.auth!.tenantId,
        expense: {
          expenseType: parsedRequest.data.type,
          title: parsedRequest.data.title,
          category: parsedRequest.data.category,
          amount: parsedRequest.data.amount,
          vatAmount: parsedRequest.data.vatAmount,
          paymentMethod: parsedRequest.data.paymentMethod,
          source: parsedRequest.data.source,
          counterparty: parsedRequest.data.counterparty,
          note: parsedRequest.data.note,
          status: parsedRequest.data.status,
          affectsOperationalExpense:
            parsedRequest.data.type === 'friend-vat-expense'
              ? false
              : parsedRequest.data.affectsOperationalExpense,
          entryDate: new Date(`${parsedRequest.data.date}T00:00:00.000Z`)
        }
      });

      await recordMutationAudit(request, 'expenses.create', {
        expenseId: expense.id,
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        affectsOperationalExpense: expense.affectsOperationalExpense
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(201).json(expense);
    }
  );

  app.delete(
    '/expenses/:expenseId',
    requireAuthenticatedSession,
    requireAnyRole(['owner', 'admin']),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = expenseIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid expense id.'
        });
        return;
      }

      const deleted = await expensesCommandService.deleteExpense({
        tenantId: request.auth!.tenantId,
        expenseId: parsedParams.data.expenseId
      });

      if (!deleted) {
        response.status(404).json({
          error: 'Expense not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'expenses.delete', {
        expenseId: parsedParams.data.expenseId
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(204).send();
    }
  );

  app.get(
    '/theory/groups',
    requireAuthenticatedSession,
    requirePermission('scheduling.read'),
    async (request: AuthenticatedRequest, response) => {
      const accessScope = await resolveReadAccessScope(request.auth!);
      const cacheKey = buildScopedTenantCacheKey(
        request.auth!,
        accessScope,
        'theory-groups'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = filterTheoryGroupsForScope(
        await theoryGroupsQueryService.listGroups({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      );

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.put(
    '/theory/groups/:theoryGroupId/lectures/:theoryLectureId/attendance',
    requireAuthenticatedSession,
    requirePermission('scheduling.manage'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = theoryAttendanceSaveParamsSchema.safeParse(
        request.params
      );

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid theory group or lecture id.'
        });
        return;
      }

      const parsedRequest = theoryAttendanceSaveRequestSchema.safeParse(
        request.body
      );

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid theory attendance payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const group = await theoryGroupsCommandService.saveLectureAttendance({
        tenantId: request.auth!.tenantId,
        theoryGroupId: parsedParams.data.theoryGroupId,
        theoryLectureId: parsedParams.data.theoryLectureId,
        attendanceRecords: parsedRequest.data.attendanceRecords,
        markedBy: request.auth!.user.displayName
      });

      if (!group) {
        response.status(404).json({
          error: 'Theory group, lecture, or student not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'theory.attendance.save', {
        theoryGroupId: group.id,
        theoryLectureId: parsedParams.data.theoryLectureId,
        attendanceCount: parsedRequest.data.attendanceRecords.length
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(group);
    }
  );

  app.get(
    '/practical-lessons',
    requireAuthenticatedSession,
    requirePermission('scheduling.read'),
    async (request: AuthenticatedRequest, response) => {
      const accessScope = await resolveReadAccessScope(request.auth!);
      const cacheKey = buildScopedTenantCacheKey(
        request.auth!,
        accessScope,
        'practical-lessons'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = filterPracticalLessonsForScope(
        await practicalLessonsQueryService.listLessons({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      );

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.post(
    '/practical-lessons',
    requireAuthenticatedSession,
    requirePermission('scheduling.manage'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = practicalLessonCreateRequestSchema.safeParse(
        request.body
      );

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid practical lesson payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      let lesson;
      const accessScope = await resolveReadAccessScope(request.auth!);

      if (
        accessScope.mode === 'student' ||
        accessScope.mode === 'parent' ||
        (accessScope.mode === 'instructor' &&
          !accessScope.studentIds.has(parsedRequest.data.studentId))
      ) {
        response.status(403).json({
          error: 'Forbidden.'
        });
        return;
      }

      try {
        lesson = await practicalLessonsCommandService.createLesson({
          tenantId: request.auth!.tenantId,
          lesson: {
            ...parsedRequest.data,
            lessonDate: new Date(
              `${parsedRequest.data.lessonDate}T00:00:00.000Z`
            ),
            parentFeedbackRating: null,
            parentFeedbackComment: null,
            parentFeedbackSubmittedAt: null,
            createdBy: request.auth!.user.displayName,
            updatedBy: request.auth!.user.displayName
          }
        });
      } catch (error) {
        if (
          error instanceof PracticalLessonStudentScheduleConflictError ||
          error instanceof PracticalLessonInstructorScheduleConflictError ||
          error instanceof PracticalLessonVehicleScheduleConflictError
        ) {
          response.status(409).json({
            error: error.message
          });
          return;
        }

        throw error;
      }

      if (!lesson) {
        response.status(404).json({
          error: 'Student not found for practical lesson.'
        });
        return;
      }

      await recordMutationAudit(request, 'practical_lessons.create', {
        lessonId: lesson.id,
        studentId: lesson.studentId,
        studentName: lesson.studentName,
        instructorName: lesson.instructorName,
        vehicleLabel: lesson.vehicleLabel,
        lessonDate: lesson.lessonDate,
        startTimeLabel: lesson.startTimeLabel,
        endTimeLabel: lesson.endTimeLabel
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(201).json(lesson);
    }
  );

  app.put(
    '/practical-lessons/:lessonId',
    requireAuthenticatedSession,
    requirePermission('scheduling.manage'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = lessonIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid practical lesson id.'
        });
        return;
      }

      const parsedRequest = practicalLessonUpdateRequestSchema.safeParse(
        request.body
      );

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid practical lesson payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      let lesson;
      const accessScope = await resolveReadAccessScope(request.auth!);

      if (accessScope.mode !== 'tenant') {
        const visibleLesson = filterPracticalLessonsForScope(
          await practicalLessonsQueryService.listLessons({
            tenantId: request.auth!.tenantId
          }),
          accessScope
        ).find((lessonItem) => lessonItem.id === parsedParams.data.lessonId);

        if (!visibleLesson) {
          response.status(404).json({
            error: 'Practical lesson not found.'
          });
          return;
        }

        if (
          accessScope.mode === 'instructor' &&
          parsedRequest.data.instructorName &&
          parsedRequest.data.instructorName !== accessScope.instructorName
        ) {
          response.status(403).json({
            error: 'Forbidden.'
          });
          return;
        }
      }

      try {
        lesson = await practicalLessonsCommandService.updateLesson({
          tenantId: request.auth!.tenantId,
          lessonId: parsedParams.data.lessonId,
          lesson: {
            ...parsedRequest.data,
            lessonDate: parsedRequest.data.lessonDate
              ? new Date(`${parsedRequest.data.lessonDate}T00:00:00.000Z`)
              : undefined,
            studentFeedbackSubmittedAt:
              parsedRequest.data.studentFeedbackSubmittedAt === undefined
                ? undefined
                : parsedRequest.data.studentFeedbackSubmittedAt === null
                  ? null
                  : new Date(parsedRequest.data.studentFeedbackSubmittedAt),
            parentFeedbackSubmittedAt:
              parsedRequest.data.parentFeedbackSubmittedAt === undefined
                ? undefined
                : parsedRequest.data.parentFeedbackSubmittedAt === null
                  ? null
                  : new Date(parsedRequest.data.parentFeedbackSubmittedAt),
            updatedBy: request.auth!.user.displayName
          }
        });
      } catch (error) {
        if (
          error instanceof PracticalLessonStudentScheduleConflictError ||
          error instanceof PracticalLessonInstructorScheduleConflictError ||
          error instanceof PracticalLessonVehicleScheduleConflictError
        ) {
          response.status(409).json({
            error: error.message
          });
          return;
        }

        throw error;
      }

      if (!lesson) {
        response.status(404).json({
          error: 'Practical lesson not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'practical_lessons.update', {
        lessonId: lesson.id,
        studentId: lesson.studentId,
        studentName: lesson.studentName,
        instructorName: lesson.instructorName,
        vehicleLabel: lesson.vehicleLabel,
        status: lesson.status,
        paymentStatus: lesson.paymentStatus,
        evaluationStatus: lesson.evaluationStatus
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(lesson);
    }
  );

  app.post(
    '/practical-lessons/:lessonId/parent-feedback',
    requireAuthenticatedSession,
    requirePermission('scheduling.read'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      if (!request.auth!.user.roleKeys.includes('parent')) {
        response.status(403).json({
          error: 'Forbidden.'
        });
        return;
      }

      const parsedParams = lessonIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid practical lesson id.'
        });
        return;
      }

      const parsedRequest =
        practicalLessonParentFeedbackRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid parent feedback payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const accessScope = await resolveReadAccessScope(request.auth!);
      const visibleLesson = filterPracticalLessonsForScope(
        await practicalLessonsQueryService.listLessons({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      ).find((lessonItem) => lessonItem.id === parsedParams.data.lessonId);

      if (!visibleLesson) {
        response.status(404).json({
          error: 'Practical lesson not found.'
        });
        return;
      }

      if (visibleLesson.status !== 'COMPLETED') {
        response.status(409).json({
          error: 'Parent feedback can only be submitted for completed lessons.'
        });
        return;
      }

      const lesson = await practicalLessonsCommandService.updateLesson({
        tenantId: request.auth!.tenantId,
        lessonId: parsedParams.data.lessonId,
        lesson: {
          parentFeedbackRating: parsedRequest.data.parentFeedbackRating,
          parentFeedbackComment: parsedRequest.data.parentFeedbackComment,
          parentFeedbackSubmittedAt: new Date(),
          updatedBy: request.auth!.user.displayName
        }
      });

      if (!lesson) {
        response.status(404).json({
          error: 'Practical lesson not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'practical_lessons.parent_feedback', {
        lessonId: lesson.id,
        studentId: lesson.studentId,
        parentFeedbackRating: lesson.parentFeedbackRating
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(lesson);
    }
  );

  app.post(
    '/practical-lessons/:lessonId/student-feedback',
    requireAuthenticatedSession,
    requirePermission('scheduling.read'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      if (!request.auth!.user.roleKeys.includes('student')) {
        response.status(403).json({
          error: 'Forbidden.'
        });
        return;
      }

      const parsedParams = lessonIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid practical lesson id.'
        });
        return;
      }

      const parsedRequest =
        practicalLessonStudentFeedbackRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid student feedback payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const accessScope = await resolveReadAccessScope(request.auth!);
      const visibleLesson = filterPracticalLessonsForScope(
        await practicalLessonsQueryService.listLessons({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      ).find((lessonItem) => lessonItem.id === parsedParams.data.lessonId);

      if (!visibleLesson) {
        response.status(404).json({
          error: 'Practical lesson not found.'
        });
        return;
      }

      if (visibleLesson.status !== 'COMPLETED') {
        response.status(409).json({
          error: 'Student feedback can only be submitted for completed lessons.'
        });
        return;
      }

      const lesson = await practicalLessonsCommandService.updateLesson({
        tenantId: request.auth!.tenantId,
        lessonId: parsedParams.data.lessonId,
        lesson: {
          studentFeedbackRating: parsedRequest.data.studentFeedbackRating,
          studentFeedbackComment: parsedRequest.data.studentFeedbackComment,
          studentFeedbackSubmittedAt: new Date(),
          updatedBy: request.auth!.user.displayName
        }
      });

      if (!lesson) {
        response.status(404).json({
          error: 'Practical lesson not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'practical_lessons.student_feedback', {
        lessonId: lesson.id,
        studentId: lesson.studentId,
        studentFeedbackRating: lesson.studentFeedbackRating
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(lesson);
    }
  );

  app.delete(
    '/practical-lessons/:lessonId',
    requireAuthenticatedSession,
    requirePermission('scheduling.manage'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = lessonIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid practical lesson id.'
        });
        return;
      }

      const accessScope = await resolveReadAccessScope(request.auth!);

      if (accessScope.mode !== 'tenant') {
        const visibleLesson = filterPracticalLessonsForScope(
          await practicalLessonsQueryService.listLessons({
            tenantId: request.auth!.tenantId
          }),
          accessScope
        ).find((lessonItem) => lessonItem.id === parsedParams.data.lessonId);

        if (!visibleLesson) {
          response.status(404).json({
            error: 'Practical lesson not found.'
          });
          return;
        }
      }

      const deleted = await practicalLessonsCommandService.deleteLesson({
        tenantId: request.auth!.tenantId,
        lessonId: parsedParams.data.lessonId
      });

      if (!deleted) {
        response.status(404).json({
          error: 'Practical lesson not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'practical_lessons.delete', {
        lessonId: parsedParams.data.lessonId
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(204).send();
    }
  );

  app.get(
    '/notifications',
    requireAuthenticatedSession,
    requirePermission('students.read'),
    async (request: AuthenticatedRequest, response) => {
      const accessScope = await resolveReadAccessScope(request.auth!);
      const cacheKey = buildScopedTenantCacheKey(
        request.auth!,
        accessScope,
        'notifications'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = filterNotificationsForScope(
        await notificationsQueryService.listNotifications({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      );

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.get(
    '/documents',
    requireAuthenticatedSession,
    requirePermission('documents.read'),
    async (request: AuthenticatedRequest, response) => {
      const accessScope = await resolveReadAccessScope(request.auth!);
      const cacheKey = buildScopedTenantCacheKey(
        request.auth!,
        accessScope,
        'documents'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = filterDocumentsForScope(
        await documentsQueryService.listDocuments({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      );

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.get(
    '/documents/ocr-extractions',
    requireAuthenticatedSession,
    requirePermission('documents.read'),
    async (_request: AuthenticatedRequest, response) => {
      const items = await listDocumentOcrExtractions();

      response.status(200).json({
        items
      });
    }
  );

  app.get(
    '/documents/ocr-source-files',
    requireAuthenticatedSession,
    requirePermission('documents.read'),
    async (_request: AuthenticatedRequest, response) => {
      const items = await listDocumentOcrSourceFiles();

      response.status(200).json({
        items
      });
    }
  );

  app.post(
    '/documents/ocr-extractions/run',
    requireAuthenticatedSession,
    requirePermission('documents.manage'),
    ocrRunRateLimiter,
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = documentOcrRunRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid OCR extraction payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      try {
        const extraction = await runDocumentOcrExtraction(
          parsedRequest.data.sourceFileName
        );

        await recordMutationAudit(request, 'documents.ocr_extract', {
          sourceFileName: parsedRequest.data.sourceFileName,
          outputFileName: extraction.outputFileName,
          documentType: extractOcrField(extraction.data, 'тип_документ'),
          documentNumber:
            extractOcrField(extraction.data, 'номер_на_документа') ||
            extractOcrField(extraction.data, 'номер_на_документ')
        });

        response.status(201).json(extraction);
      } catch (error) {
        const statusCode = mapOcrWorkerErrorStatusCode(error);

        response.status(statusCode).json({
          error:
            statusCode === 400
              ? 'The provided file is invalid for OCR processing.'
              : 'OCR processing failed. Please try again later.'
        });
      }
    }
  );

  app.post(
    '/documents',
    requireAuthenticatedSession,
    requirePermission('documents.manage'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = documentWriteRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid document payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const docAccessScope = await resolveReadAccessScope(request.auth!);
      if (
        parsedRequest.data.studentId &&
        docAccessScope.mode !== 'tenant' &&
        !docAccessScope.studentIds.has(parsedRequest.data.studentId)
      ) {
        response.status(403).json({ error: 'Forbidden.' });
        return;
      }

      const document = await documentsCommandService.createDocument({
        tenantId: request.auth!.tenantId,
        document: {
          studentId: parsedRequest.data.studentId ?? null,
          name: parsedRequest.data.name,
          ownerType: parsedRequest.data.ownerType,
          ownerName: parsedRequest.data.ownerName,
          ownerRef: parsedRequest.data.ownerRef ?? null,
          category: parsedRequest.data.category,
          documentNo: parsedRequest.data.documentNo ?? null,
          issueDate: new Date(`${parsedRequest.data.issueDate}T00:00:00.000Z`),
          expiryDate: parsedRequest.data.expiryDate
            ? new Date(`${parsedRequest.data.expiryDate}T00:00:00.000Z`)
            : null,
          status: parsedRequest.data.status,
          fileUrl: parsedRequest.data.fileUrl ?? null,
          notes: parsedRequest.data.notes ?? null
        }
      });

      if (!document) {
        response.status(404).json({
          error: 'Document owner student not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'documents.create', {
        documentId: document.id,
        studentId: document.studentId,
        ownerType: document.ownerType,
        ownerName: document.ownerName,
        status: document.status
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(201).json(document);
    }
  );

  app.put(
    '/documents/:documentId',
    requireAuthenticatedSession,
    requirePermission('documents.manage'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = documentIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid document id.'
        });
        return;
      }

      const parsedRequest = documentWriteRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid document payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const document = await documentsCommandService.updateDocument({
        tenantId: request.auth!.tenantId,
        documentId: parsedParams.data.documentId,
        document: {
          studentId: parsedRequest.data.studentId ?? null,
          name: parsedRequest.data.name,
          ownerType: parsedRequest.data.ownerType,
          ownerName: parsedRequest.data.ownerName,
          ownerRef: parsedRequest.data.ownerRef ?? null,
          category: parsedRequest.data.category,
          documentNo: parsedRequest.data.documentNo ?? null,
          issueDate: new Date(`${parsedRequest.data.issueDate}T00:00:00.000Z`),
          expiryDate: parsedRequest.data.expiryDate
            ? new Date(`${parsedRequest.data.expiryDate}T00:00:00.000Z`)
            : null,
          status: parsedRequest.data.status,
          fileUrl: parsedRequest.data.fileUrl ?? null,
          notes: parsedRequest.data.notes ?? null
        }
      });

      if (!document) {
        response.status(404).json({
          error: 'Document or owner student not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'documents.update', {
        documentId: document.id,
        studentId: document.studentId,
        ownerType: document.ownerType,
        ownerName: document.ownerName,
        status: document.status
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(document);
    }
  );

  app.delete(
    '/documents/:documentId',
    requireAuthenticatedSession,
    requireAnyRole(['owner', 'admin']),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = documentIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid document id.'
        });
        return;
      }

      const deleted = await documentsCommandService.deleteDocument({
        tenantId: request.auth!.tenantId,
        documentId: parsedParams.data.documentId
      });

      if (!deleted) {
        response.status(404).json({
          error: 'Document not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'documents.delete', {
        documentId: parsedParams.data.documentId
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(204).send();
    }
  );

  app.get(
    '/exam-applications',
    requireAuthenticatedSession,
    requirePermission('students.manage_register'),
    async (request: AuthenticatedRequest, response) => {
      const cacheKey = buildTenantCacheKey(
        request.auth!.tenantId,
        'exam-applications'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = await examApplicationsQueryService.listExamApplications({
        tenantId: request.auth!.tenantId
      });

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.post(
    '/exam-applications/generate',
    requireAuthenticatedSession,
    requirePermission('students.manage_register'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = examApplicationGenerateRequestSchema.safeParse(
        request.body
      );

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid exam application generation payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const application =
        await examApplicationsCommandService.generateApplication({
          tenantId: request.auth!.tenantId,
          studentId: parsedRequest.data.studentId,
          actorName: request.auth!.user.displayName
        });

      if (!application) {
        response.status(404).json({
          error: 'Student or enrollment not found for exam application.'
        });
        return;
      }

      await recordMutationAudit(request, 'exam_applications.generate', {
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
        studentId: application.studentId,
        status: application.status,
        missingRequirementsCount: application.missingRequirements.length
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(201).json(application);
    }
  );

  app.put(
    '/exam-applications/:applicationId',
    requireAuthenticatedSession,
    requirePermission('students.manage_register'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = examApplicationIdParamsSchema.safeParse(
        request.params
      );

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid exam application id.'
        });
        return;
      }

      const parsedRequest =
        examApplicationStatusUpdateRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid exam application status payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      try {
        const application =
          await examApplicationsCommandService.updateApplicationStatus({
            tenantId: request.auth!.tenantId,
            applicationId: parsedParams.data.applicationId,
            status: parsedRequest.data.status,
            statusNote: parsedRequest.data.statusNote ?? null,
            actorName: request.auth!.user.displayName
          });

        if (!application) {
          response.status(404).json({
            error: 'Exam application not found.'
          });
          return;
        }

        await recordMutationAudit(request, 'exam_applications.update_status', {
          applicationId: application.id,
          applicationNumber: application.applicationNumber,
          studentId: application.studentId,
          status: application.status
        });
        await deleteTenantReadCaches(request.auth!.tenantId);

        response.status(200).json(application);
      } catch (error) {
        if (error instanceof ExamApplicationValidationError) {
          response.status(409).json({
            error: error.message
          });
          return;
        }

        throw error;
      }
    }
  );

  app.get(
    '/invoices',
    requireAuthenticatedSession,
    requirePermission('invoices.read'),
    async (request: AuthenticatedRequest, response) => {
      const accessScope = await resolveReadAccessScope(request.auth!);
      const cacheKey = buildScopedTenantCacheKey(
        request.auth!,
        accessScope,
        'invoices'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = filterStudentOwnedRecordsForScope(
        await invoicesQueryService.listInvoices({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      );

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.post(
    '/invoices',
    requireAuthenticatedSession,
    requirePermission('payments.record'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = invoiceCreateRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid invoice payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const invoiceNumber =
        parsedRequest.data.invoiceNumber ??
        `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()
          .toString()
          .slice(-6)}`;
      const subtotalAmount = Math.round(parsedRequest.data.totalAmount / 1.2);
      const vatAmount = parsedRequest.data.totalAmount - subtotalAmount;

      const invoice = await invoicesCommandService.createInvoice({
        tenantId: request.auth!.tenantId,
        invoice: {
          studentId: parsedRequest.data.studentId,
          invoiceNumber,
          invoiceDate: new Date(`${parsedRequest.data.invoiceDate}T00:00:00.000Z`),
          recipientName: parsedRequest.data.recipientName,
          categoryCode: parsedRequest.data.categoryCode,
          invoiceReason: parsedRequest.data.invoiceReason,
          packageType: parsedRequest.data.packageType,
          totalAmount: parsedRequest.data.totalAmount,
          currency: 'EUR',
          status: parsedRequest.data.status,
          paymentLinkStatus: parsedRequest.data.paymentLinkStatus,
          paymentNumber: parsedRequest.data.paymentNumber ?? null,
          paymentStatus: parsedRequest.data.paymentStatus ?? null,
          createdBy: request.auth!.user.displayName,
          createdDate: new Date(`${parsedRequest.data.invoiceDate}T00:00:00.000Z`),
          lastUpdatedBy: request.auth!.user.displayName,
          notes: parsedRequest.data.notes ?? null,
          issuedDate: parsedRequest.data.issuedDate
            ? new Date(`${parsedRequest.data.issuedDate}T00:00:00.000Z`)
            : null,
          dueDate: parsedRequest.data.dueDate
            ? new Date(`${parsedRequest.data.dueDate}T00:00:00.000Z`)
            : null,
          vatAmount,
          subtotalAmount,
          wasCorrected: false,
          correctionReason: null
        }
      });

      if (!invoice) {
        response.status(404).json({
          error: 'Invoice student not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'invoices.create', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        studentId: invoice.studentId,
        totalAmount: invoice.totalAmount,
        status: invoice.status
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(201).json(invoice);
    }
  );

  app.put(
    '/invoices/:invoiceId',
    requireAuthenticatedSession,
    requirePermission('payments.record'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = invoiceIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid invoice id.'
        });
        return;
      }

      const parsedRequest = invoiceUpdateRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid invoice payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const subtotalAmount =
        parsedRequest.data.totalAmount === undefined
          ? undefined
          : Math.round(parsedRequest.data.totalAmount / 1.2);
      const vatAmount =
        parsedRequest.data.totalAmount === undefined || subtotalAmount === undefined
          ? undefined
          : parsedRequest.data.totalAmount - subtotalAmount;
      const issuedDate =
        parsedRequest.data.issuedDate === undefined
          ? undefined
          : parsedRequest.data.issuedDate === null
            ? null
            : new Date(`${parsedRequest.data.issuedDate}T00:00:00.000Z`);
      const dueDate =
        parsedRequest.data.dueDate === undefined
          ? undefined
          : parsedRequest.data.dueDate === null
            ? null
            : new Date(`${parsedRequest.data.dueDate}T00:00:00.000Z`);

      const invoice = await invoicesCommandService.updateInvoice({
        tenantId: request.auth!.tenantId,
        invoiceId: parsedParams.data.invoiceId,
        invoice: {
          invoiceDate: parsedRequest.data.invoiceDate
            ? new Date(`${parsedRequest.data.invoiceDate}T00:00:00.000Z`)
            : undefined,
          recipientName: parsedRequest.data.recipientName,
          categoryCode: parsedRequest.data.categoryCode,
          invoiceReason: parsedRequest.data.invoiceReason,
          packageType: parsedRequest.data.packageType,
          totalAmount: parsedRequest.data.totalAmount,
          status: parsedRequest.data.status,
          paymentLinkStatus: parsedRequest.data.paymentLinkStatus,
          paymentNumber: parsedRequest.data.paymentNumber ?? undefined,
          paymentStatus: parsedRequest.data.paymentStatus ?? undefined,
          lastUpdatedBy: request.auth!.user.displayName,
          notes: parsedRequest.data.notes ?? undefined,
          issuedDate,
          dueDate,
          vatAmount,
          subtotalAmount,
          wasCorrected: parsedRequest.data.wasCorrected,
          correctionReason: parsedRequest.data.correctionReason ?? undefined
        }
      });

      if (!invoice) {
        response.status(404).json({
          error: 'Invoice not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'invoices.update', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        studentId: invoice.studentId,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        wasCorrected: invoice.wasCorrected
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(invoice);
    }
  );

  app.delete(
    '/invoices/:invoiceId',
    requireAuthenticatedSession,
    requireAnyRole(['owner', 'admin']),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = invoiceIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid invoice id.'
        });
        return;
      }

      const deleted = await invoicesCommandService.deleteInvoice({
        tenantId: request.auth!.tenantId,
        invoiceId: parsedParams.data.invoiceId
      });

      if (!deleted) {
        response.status(404).json({
          error: 'Invoice not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'invoices.delete', {
        invoiceId: parsedParams.data.invoiceId
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(204).send();
    }
  );

  app.get(
    '/vehicles',
    requireAuthenticatedSession,
    requirePermission('vehicles.read'),
    async (request: AuthenticatedRequest, response) => {
      const accessScope = await resolveReadAccessScope(request.auth!);
      const cacheKey = buildScopedTenantCacheKey(
        request.auth!,
        accessScope,
        'vehicles'
      );
      const cachedItems = await readCacheJson<unknown[]>(cacheKey);

      if (cachedItems) {
        response.status(200).json({
          items: cachedItems
        });
        return;
      }

      const items = filterVehiclesForScope(
        await vehiclesQueryService.listVehicles({
          tenantId: request.auth!.tenantId
        }),
        accessScope
      );

      await writeCacheJson(cacheKey, items, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json({
        items
      });
    }
  );

  app.post(
    '/vehicles',
    requireAuthenticatedSession,
    requirePermission('scheduling.manage'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = vehicleCreateRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid vehicle payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const vehicle = await vehiclesCommandService.createVehicle({
        tenantId: request.auth!.tenantId,
        vehicle: {
          vehicleLabel: parsedRequest.data.vehicleLabel,
          instructorName: parsedRequest.data.instructorName,
          categoryCode: parsedRequest.data.categoryCode,
          status: parsedRequest.data.status,
          nextInspection: new Date(
            `${parsedRequest.data.nextInspection}T00:00:00.000Z`
          ),
          activeLessons: parsedRequest.data.activeLessons,
          operationalNote: parsedRequest.data.operationalNote
        }
      });

      await recordMutationAudit(request, 'vehicles.create', {
        vehicleId: vehicle.id,
        vehicleLabel: vehicle.vehicleLabel,
        instructorName: vehicle.instructorName,
        status: vehicle.status
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(201).json(vehicle);
    }
  );

  app.put(
    '/vehicles/:vehicleId',
    requireAuthenticatedSession,
    requirePermission('scheduling.manage'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedParams = vehicleIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: 'Invalid vehicle id.'
        });
        return;
      }

      const parsedRequest = vehicleUpdateRequestSchema.safeParse(request.body);

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid vehicle payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const vehicle = await vehiclesCommandService.updateVehicle({
        tenantId: request.auth!.tenantId,
        vehicleId: parsedParams.data.vehicleId,
        vehicle: {
          vehicleLabel: parsedRequest.data.vehicleLabel,
          instructorName: parsedRequest.data.instructorName,
          categoryCode: parsedRequest.data.categoryCode,
          status: parsedRequest.data.status,
          nextInspection: parsedRequest.data.nextInspection
            ? new Date(`${parsedRequest.data.nextInspection}T00:00:00.000Z`)
            : undefined,
          activeLessons: parsedRequest.data.activeLessons,
          operationalNote: parsedRequest.data.operationalNote
        }
      });

      if (!vehicle) {
        response.status(404).json({
          error: 'Vehicle not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'vehicles.update', {
        vehicleId: vehicle.id,
        vehicleLabel: vehicle.vehicleLabel,
        instructorName: vehicle.instructorName,
        status: vehicle.status
      });
      await deleteTenantReadCaches(request.auth!.tenantId);

      response.status(200).json(vehicle);
    }
  );

  app.post(
    '/ai/business-assistant',
    requireAuthenticatedSession,
    requirePermission('reports.read'),
    aiAssistantRateLimiter,
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = businessAssistantRequestSchema.safeParse(
        request.body
      );

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid AI assistant payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const questionHash = createHash('sha256')
        .update(parsedRequest.data.question.trim().toLowerCase())
        .digest('hex')
        .slice(0, 24);
      const cacheKey = buildTenantCacheKey(
        request.auth!.tenantId,
        `ai-business:${questionHash}`
      );
      const cachedAnswer = await readCacheJson<unknown>(cacheKey);

      if (cachedAnswer) {
        response.status(200).json(cachedAnswer);
        return;
      }

      const answer = await businessAssistantService.answerQuestion({
        tenantId: request.auth!.tenantId,
        question: parsedRequest.data.question,
        openAiApiKey: appConfig.openAiApiKey
      });

      await writeCacheJson(cacheKey, answer, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json(answer);
    }
  );

  app.get(
    '/reports/finance-ledger',
    requireAuthenticatedSession,
    requirePermission('reports.read'),
    async (request: AuthenticatedRequest, response) => {
      const cacheKey = buildTenantCacheKey(
        request.auth!.tenantId,
        'reports:finance-ledger'
      );
      const cachedReport = await readCacheJson<unknown>(cacheKey);

      if (cachedReport) {
        response.status(200).json(cachedReport);
        return;
      }

      const report = await financeReportQueryService.getFinanceReport({
        tenantId: request.auth!.tenantId
      });

      await writeCacheJson(cacheKey, report, TENANT_CACHE_TTL_SECONDS);

      response.status(200).json(report);
    }
  );

  app.post(
    '/determinator/sessions',
    requireAuthenticatedSession,
    requirePermission('students.manage_register'),
    requireCsrfProtection,
    async (request: AuthenticatedRequest, response) => {
      const parsedRequest = determinatorSessionRequestSchema.safeParse(
        request.body
      );

      if (!parsedRequest.success) {
        response.status(400).json({
          error: 'Invalid determinator payload.',
          details: parsedRequest.error.flatten()
        });
        return;
      }

      const accessScope = await resolveReadAccessScope(request.auth!);

      if (
        accessScope.mode !== 'tenant' &&
        !accessScope.studentIds.has(parsedRequest.data.studentId)
      ) {
        response.status(404).json({
          error: 'Student not found.'
        });
        return;
      }

      const session = await studentsDeterminatorService.createSession({
        tenantId: request.auth!.tenantId,
        session: {
          ...parsedRequest.data,
          overallResult: parsedRequest.data.overallResult ?? null,
          instructorNote: parsedRequest.data.instructorNote ?? null
        }
      });

      if (!session) {
        response.status(404).json({
          error: 'Student not found.'
        });
        return;
      }

      await recordMutationAudit(request, 'determinator.sessions.create', {
        determinatorSessionId: session.id,
        studentId: session.studentId,
        studentName: session.studentName,
        registrationNumber: session.registrationNumber
      });
      await deleteCacheByPrefix(
        buildTenantCacheKey(request.auth!.tenantId, 'determinator')
      );

      response.status(201).json(session);
    }
  );

  app.post(
    '/auth/logout',
    requireAuthenticatedSession,
    requireCsrfProtection,
    async (request, response) => {
      const accessToken = readAccessTokenFromCookie(request);

      if (accessToken) {
        await sessionService.logout(accessToken);
      }

      response.clearCookie(appConfig.authCookieName, {
        httpOnly: true,
        secure: appConfig.env !== 'development',
        sameSite: 'strict',
        path: '/'
      });

      response.status(204).send();
    }
  );

  app.post(
    '/auth/change-password',
    requireAuthenticatedSession,
    requireCsrfProtection,
    changePasswordRateLimiter,
    async (request, response) => {
    const parsedRequest = changePasswordRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: 'Invalid password change payload.'
      });
      return;
    }

    const accessToken = readAccessTokenFromCookie(request);

    if (!accessToken) {
      response.status(401).json({
        error: 'Unauthenticated.'
      });
      return;
    }

    try {
      await sessionService.changePassword({
        accessToken,
        currentPassword: parsedRequest.data.currentPassword,
        newPassword: parsedRequest.data.newPassword
      });

      response.clearCookie(appConfig.authCookieName, {
        httpOnly: true,
        secure: appConfig.env !== 'development',
        sameSite: 'strict',
        path: '/'
      });

      response.status(204).send();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        response.status(401).json({
          error: 'Invalid credentials.'
        });
        return;
      }

      if (error instanceof PasswordPolicyError) {
        response.status(400).json({
          error: error.message
        });
        return;
      }

      if (error instanceof SessionAuthenticationError) {
        response.status(401).json({
          error: 'Unauthenticated.'
        });
        return;
      }

      response.status(500).json({
        error: 'Password change failed.'
      });
    }
    }
  );

  return app;
}

function toStudentWriteInput(
  studentRequest: z.infer<typeof studentMutationRequestSchema>
): StudentWriteInput {
  return {
    firstName: studentRequest.firstName,
    lastName: studentRequest.lastName,
    displayName: `${studentRequest.firstName} ${studentRequest.lastName}`.trim(),
    phone: studentRequest.phone,
    email: studentRequest.email ?? null,
    nationalId: studentRequest.nationalId ?? null,
    birthDate: studentRequest.birthDate
      ? new Date(`${studentRequest.birthDate}T00:00:00.000Z`)
      : null,
    address: studentRequest.address ?? null,
    educationLevel: studentRequest.educationLevel ?? null,
    parentName: studentRequest.parentName ?? null,
    parentPhone: studentRequest.parentPhone ?? null,
    parentEmail: studentRequest.parentEmail ?? null,
    parentContactStatus: studentRequest.parentContactStatus,
    status: studentRequest.status,
    enrollment: {
      categoryCode: studentRequest.enrollment.categoryCode,
      status: studentRequest.enrollment.status,
      trainingMode: studentRequest.enrollment.trainingMode,
      registerMode: studentRequest.enrollment.registerMode,
      theoryGroupNumber: studentRequest.enrollment.theoryGroupNumber ?? null,
      assignedInstructorName:
        studentRequest.enrollment.assignedInstructorName ?? null,
      enrollmentDate: new Date(
        `${studentRequest.enrollment.enrollmentDate}T00:00:00.000Z`
      ),
      expectedArrivalDate: studentRequest.enrollment.expectedArrivalDate
        ? new Date(
            `${studentRequest.enrollment.expectedArrivalDate}T00:00:00.000Z`
          )
        : null,
      previousLicenseCategory:
        studentRequest.enrollment.previousLicenseCategory ?? null,
      packageHours: studentRequest.enrollment.packageHours,
      additionalHours: studentRequest.enrollment.additionalHours,
      completedHours: studentRequest.enrollment.completedHours,
      failedExamAttempts: studentRequest.enrollment.failedExamAttempts,
      lastPracticeAt: studentRequest.enrollment.lastPracticeAt
        ? new Date(studentRequest.enrollment.lastPracticeAt)
        : null,
      notes: studentRequest.enrollment.notes ?? null
    }
  };
}

type ReadAccessScope =
  | {
      mode: 'tenant';
      cacheScope: string;
      studentIds: Set<string>;
      instructorName: string | null;
    }
  | {
      mode: 'instructor';
      cacheScope: string;
      studentIds: Set<string>;
      instructorName: string;
    }
  | {
      mode: 'student';
      cacheScope: string;
      studentIds: Set<string>;
      instructorName: string | null;
    }
  | {
      mode: 'parent';
      cacheScope: string;
      studentIds: Set<string>;
      instructorName: string | null;
    };

async function resolveReadAccessScope(
  auth: NonNullable<AuthenticatedRequest['auth']>
): Promise<ReadAccessScope> {
  const roleKeys = new Set(auth.user.roleKeys);

  if (
    roleKeys.has('owner') ||
    roleKeys.has('admin') ||
    roleKeys.has('accountant')
  ) {
    return {
      mode: 'tenant',
      cacheScope: 'tenant',
      studentIds: new Set<string>(),
      instructorName: null
    };
  }

  const students = await studentsQueryService.listStudents({
    tenantId: auth.tenantId
  });

  if (roleKeys.has('instructor')) {
    const instructorName = auth.user.displayName;

    return {
      mode: 'instructor',
      cacheScope: `instructor:${auth.user.id}`,
      studentIds: new Set(
        students
          .filter((student) => {
            const enrollment = student.enrollment;
            if (!enrollment) return false;
            // Prefer immutable FK match; fall back to name for records not yet migrated
            if (enrollment.instructorMembershipId !== null) {
              return enrollment.instructorMembershipId === auth.membershipId;
            }
            return enrollment.instructorName === instructorName;
          })
          .map((student) => student.id)
      ),
      instructorName
    };
  }

  if (roleKeys.has('student')) {
    const ownStudent = students.find((student) => {
      // Prefer immutable FK match; fall back to email for records not yet migrated
      if (student.userMembershipId !== null) {
        return student.userMembershipId === auth.membershipId;
      }
      return student.email === auth.user.email;
    });

    return {
      mode: 'student',
      cacheScope: `student:${auth.user.id}:${ownStudent?.id ?? 'none'}`,
      studentIds: new Set(ownStudent ? [ownStudent.id] : []),
      instructorName: null
    };
  }

  if (roleKeys.has('parent')) {
    return {
      mode: 'parent',
      cacheScope: `parent:${auth.user.id}`,
      studentIds: new Set(
        students
          .filter((student) => {
            if (!student.parentContactEnabled) return false;
            // Prefer immutable FK match; fall back to email for records not yet migrated
            if (student.parentMembershipId !== null) {
              return student.parentMembershipId === auth.membershipId;
            }
            return student.parentEmail === auth.user.email;
          })
          .map((student) => student.id)
      ),
      instructorName: null
    };
  }

  return {
    mode: 'tenant',
    cacheScope: `user:${auth.user.id}`,
    studentIds: new Set<string>(),
    instructorName: null
  };
}

function buildScopedTenantCacheKey(
  auth: NonNullable<AuthenticatedRequest['auth']>,
  accessScope: ReadAccessScope,
  scope: string
) {
  return buildTenantCacheKey(auth.tenantId, `${scope}:${accessScope.cacheScope}`);
}

function filterStudentsForScope<TItem extends { id: string }>(
  items: TItem[],
  accessScope: ReadAccessScope
) {
  if (accessScope.mode === 'tenant') {
    return items;
  }

  return items.filter((item) => accessScope.studentIds.has(item.id));
}

function isStudentVisibleForScope(
  student: { id: string },
  accessScope: ReadAccessScope
) {
  return filterStudentsForScope([student], accessScope).length === 1;
}

function filterStudentOwnedRecordsForScope<TItem extends { studentId: string }>(
  items: TItem[],
  accessScope: ReadAccessScope
) {
  if (accessScope.mode === 'tenant') {
    return items;
  }

  return items.filter((item) => accessScope.studentIds.has(item.studentId));
}

function filterDeterminatorSessionsForScope<
  TItem extends { studentId: string }
>(items: TItem[], accessScope: ReadAccessScope) {
  return filterStudentOwnedRecordsForScope(items, accessScope);
}

function filterPracticalLessonsForScope<
  TItem extends { studentId: string }
>(items: TItem[], accessScope: ReadAccessScope) {
  if (accessScope.mode === 'tenant') {
    return items;
  }

  return items.filter((item) => accessScope.studentIds.has(item.studentId));
}

function filterTheoryGroupsForScope<
  TItem extends {
    instructorName: string;
    lectures: Array<{
      attendanceRecords: Array<{ studentId: string }>;
    }>;
  }
>(items: TItem[], accessScope: ReadAccessScope) {
  if (accessScope.mode === 'tenant') {
    return items;
  }

  if (accessScope.mode === 'instructor') {
    return items.filter(
      (item) => item.instructorName === accessScope.instructorName
    );
  }

  return items
    .map((item) => ({
      ...item,
      lectures: item.lectures
        .map((lecture) => ({
          ...lecture,
          attendanceRecords: lecture.attendanceRecords.filter((attendance) =>
            accessScope.studentIds.has(attendance.studentId)
          )
        }))
        .filter((lecture) => lecture.attendanceRecords.length > 0)
    }))
    .filter((item) => item.lectures.length > 0);
}

function filterDocumentsForScope<
  TItem extends {
    studentId: string | null;
    ownerType: string;
    ownerName: string;
  }
>(items: TItem[], accessScope: ReadAccessScope) {
  if (accessScope.mode === 'tenant') {
    return items;
  }

  if (accessScope.mode === 'instructor') {
    return items.filter(
      (item) =>
        item.ownerName === accessScope.instructorName ||
        (item.studentId ? accessScope.studentIds.has(item.studentId) : false)
    );
  }

  return items.filter(
    (item) => item.studentId && accessScope.studentIds.has(item.studentId)
  );
}

function filterVehiclesForScope<
  TItem extends { instructorName: string }
>(items: TItem[], accessScope: ReadAccessScope) {
  if (accessScope.mode !== 'instructor') {
    return items;
  }

  return items.filter(
    (item) => item.instructorName === accessScope.instructorName
  );
}

function filterNotificationsForScope<
  TItem extends { studentId: string | null }
>(items: TItem[], accessScope: ReadAccessScope) {
  if (accessScope.mode === 'tenant') {
    return items;
  }

  return items.filter(
    (item) => item.studentId && accessScope.studentIds.has(item.studentId)
  );
}

function buildTenantCacheKey(tenantId: string, scope: string) {
  return `tenant:${tenantId}:${scope}`;
}

async function deleteTenantReadCaches(tenantId: string) {
  await Promise.all([
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'students')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'payments')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'expenses')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'documents')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'invoices')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'vehicles')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'theory-groups')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'practical-lessons')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'notifications')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'determinator')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'ai-business')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'reports')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'exam-applications')),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, 'settings-features'))
  ]);
}

function readAccessTokenFromCookie(request: express.Request) {
  const rawCookieHeader = request.headers.cookie;

  if (!rawCookieHeader) {
    return null;
  }

  const parsedCookies = cookie.parse(rawCookieHeader);

  return parsedCookies[appConfig.authCookieName] ?? null;
}

async function listDocumentOcrExtractions() {
  try {
    const directoryEntries = await readdir(appConfig.documentOcrOutputDir, {
      withFileTypes: true
    });

    const ocrFiles = directoryEntries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith('.json') &&
          !entry.name.startsWith('.')
      )
      .sort((left, right) => left.name.localeCompare(right.name));

    const baseDir = resolve(appConfig.documentOcrOutputDir);
    const parsedFiles = await Promise.all(
      ocrFiles.map(async (entry) => {
        const filePath = resolve(baseDir, entry.name);
        if (!filePath.startsWith(baseDir + '/') && filePath !== baseDir) {
          throw new Error('Invalid file path detected.');
        }
        const rawContent = await readFile(filePath, 'utf8');

        return {
          fileName: entry.name,
          data: JSON.parse(rawContent) as unknown
        };
      })
    );

    return parsedFiles;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return [];
    }

    throw error;
  }
}

async function listDocumentOcrSourceFiles() {
  try {
    const directoryEntries = await readdir(appConfig.documentOcrSourceDir, {
      withFileTypes: true
    });

    return directoryEntries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.toLowerCase().endsWith('.pdf') &&
          !entry.name.startsWith('.')
      )
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return [];
    }

    throw error;
  }
}

async function runDocumentOcrExtraction(sourceFileName: string) {
  const workerResponse = await fetch(
    `${appConfig.documentOcrWorkerUrl.replace(/\/$/, '')}/ocr/extract`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sourceFileName
      })
    }
  );

  const responseBody = (await workerResponse.json().catch(() => null)) as {
    fileName?: string;
    outputFileName?: string;
    data?: Record<string, unknown>;
    detail?: string;
  } | null;

  if (!workerResponse.ok) {
    const message =
      typeof responseBody?.detail === 'string'
        ? responseBody.detail
        : `OCR worker failed with status ${workerResponse.status}.`;

    const error = new Error(message);
    error.name = `OcrWorkerHttp${workerResponse.status}`;
    throw error;
  }

  return {
    fileName: responseBody?.fileName ?? sourceFileName,
    outputFileName: responseBody?.outputFileName ?? `${sourceFileName}.json`,
    data: responseBody?.data ?? {}
  };
}

function extractOcrField(
  data: Record<string, unknown>,
  key: string
): string | null {
  const value = data[key];

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function mapOcrWorkerErrorStatusCode(error: unknown) {
  if (!(error instanceof Error)) {
    return 502;
  }

  if (error.name === 'OcrWorkerHttp400') {
    return 400;
  }

  if (error.name === 'OcrWorkerHttp404') {
    return 404;
  }

  if (error.name === 'OcrWorkerHttp422') {
    return 422;
  }

  return 502;
}

async function recordMutationAudit(
  request: AuthenticatedRequest,
  actionKey: string,
  metadata: Record<string, unknown>
) {
  await authAuditService.record({
    tenantId: request.auth!.tenantId,
    userId: request.auth!.user.id,
    sessionId: request.auth!.sessionId,
    actorType: 'USER',
    actionKey,
    outcome: 'SUCCESS',
    ipAddress: request.ip,
    userAgent: request.get('user-agent') ?? undefined,
    metadata
  });
}

async function requireAuthenticatedSession(
  request: AuthenticatedRequest,
  response: express.Response,
  next: express.NextFunction
) {
  const accessToken = readAccessTokenFromCookie(request);

  if (!accessToken) {
    response.status(401).json({
      error: 'Unauthenticated.'
    });
    return;
  }

  try {
    request.auth = await sessionService.authenticate(accessToken);
    next();
  } catch (error) {
    if (error instanceof SessionAuthenticationError) {
      response.clearCookie(appConfig.authCookieName, {
        httpOnly: true,
        secure: appConfig.env !== 'development',
        sameSite: 'strict',
        path: '/'
      });
      response.status(401).json({
        error: 'Unauthenticated.'
      });
      return;
    }

    response.status(500).json({
      error: 'Authentication failed.'
    });
  }
}

function requirePermission(permissionKey: string) {
  return (
    request: AuthenticatedRequest,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const permissionKeys = request.auth?.user.permissionKeys ?? [];

    if (!permissionKeys.includes(permissionKey)) {
      void authAuditService.record({
        tenantId: request.auth?.tenantId,
        userId: request.auth?.user.id,
        sessionId: request.auth?.sessionId,
        actorType: 'USER',
        actionKey: 'authz.permission_denied',
        outcome: 'FAILURE',
        ipAddress: request.ip,
        userAgent: request.get('user-agent') ?? undefined,
        metadata: { requiredPermission: permissionKey, path: request.path }
      });
      response.status(403).json({
        error: 'Forbidden.'
      });
      return;
    }

    next();
  };
}

function requireOwnerRole(
  request: AuthenticatedRequest,
  response: express.Response,
  next: express.NextFunction
) {
  const roleKeys = request.auth?.user.roleKeys ?? [];

  if (!roleKeys.includes('owner')) {
    void authAuditService.record({
      tenantId: request.auth?.tenantId,
      userId: request.auth?.user.id,
      sessionId: request.auth?.sessionId,
      actorType: 'USER',
      actionKey: 'authz.owner_role_denied',
      outcome: 'FAILURE',
      ipAddress: request.ip,
      userAgent: request.get('user-agent') ?? undefined,
      metadata: { path: request.path }
    });
    response.status(403).json({
      error: 'Forbidden.'
    });
    return;
  }

  next();
}

function requireAnyRole(roleKeys: string[]) {
  return (
    request: AuthenticatedRequest,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const userRoleKeys = request.auth?.user.roleKeys ?? [];

    if (!roleKeys.some((roleKey) => userRoleKeys.includes(roleKey))) {
      void authAuditService.record({
        tenantId: request.auth?.tenantId,
        userId: request.auth?.user.id,
        sessionId: request.auth?.sessionId,
        actorType: 'USER',
        actionKey: 'authz.role_denied',
        outcome: 'FAILURE',
        ipAddress: request.ip,
        userAgent: request.get('user-agent') ?? undefined,
        metadata: { requiredRoles: roleKeys, path: request.path }
      });
      response.status(403).json({
        error: 'Forbidden.'
      });
      return;
    }

    next();
  };
}

function requireCsrfProtection(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {
  const accessToken = readAccessTokenFromCookie(request);
  const csrfHeader = request.get('x-csrf-token');

  if (!accessToken || !csrfHeader) {
    response.status(403).json({
      error: 'CSRF validation failed.'
    });
    return;
  }

  const expectedCsrfToken = deriveCsrfToken(
    accessToken,
    appConfig.sessionSecret
  );

  if (!isMatchingCsrfToken(csrfHeader, expectedCsrfToken)) {
    response.status(403).json({
      error: 'CSRF validation failed.'
    });
    return;
  }

  next();
}
