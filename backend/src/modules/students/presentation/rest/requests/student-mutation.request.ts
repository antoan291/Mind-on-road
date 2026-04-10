import { z } from 'zod';

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.');

const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const studentMutationRequestSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(3).max(50),
  portalPassword: z.string().trim().min(8).max(64).nullable().optional(),
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
    .nullable()
    .optional(),
  nationalId: z.string().trim().min(4).max(32).nullable().optional(),
  birthDate: isoDateSchema.nullable().optional(),
  address: z.string().trim().max(300).nullable().optional(),
  educationLevel: z.string().trim().max(100).nullable().optional(),
  parentName: nullableTrimmedStringSchema,
  parentPhone: nullableTrimmedStringSchema,
  parentEmail: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
    .nullable()
    .optional(),
  parentContactStatus: z.enum(['ENABLED', 'DISABLED']).default('DISABLED'),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'WITHDRAWN']).default('ACTIVE'),
  initialPayment: z
    .object({
      amount: z.coerce.number().int().min(1).max(10_000_000),
      paidAmount: z.coerce.number().int().min(0).max(10_000_000),
      method: z.string().trim().min(1).max(50),
      status: z.enum(['PAID', 'PARTIAL', 'OVERDUE', 'PENDING', 'CANCELED']).default('PAID'),
      paidAt: isoDateSchema,
      note: z.string().trim().max(500).nullable().optional()
    })
    .nullable()
    .optional(),
  enrollment: z.object({
    categoryCode: z.string().trim().min(1).max(10).transform((value) => value.toUpperCase()),
    status: z.enum(['ACTIVE', 'FAILED_EXAM', 'PASSED', 'PAUSED', 'WITHDRAWN']).default('ACTIVE'),
    trainingMode: z
      .enum(['STANDARD_PACKAGE', 'LICENSED_MANUAL_HOURS'])
      .default('STANDARD_PACKAGE'),
    registerMode: z.enum(['ELECTRONIC', 'PAPER', 'HYBRID']).default('ELECTRONIC'),
    theoryGroupNumber: z.string().trim().max(50).nullable().optional(),
    assignedInstructorName: nullableTrimmedStringSchema,
    enrollmentDate: isoDateSchema,
    expectedArrivalDate: isoDateSchema.nullable().optional(),
    previousLicenseCategory: z.string().trim().max(20).nullable().optional(),
    packageHours: z.coerce.number().int().min(0).max(1000),
    additionalHours: z.coerce.number().int().min(0).max(1000).default(0),
    completedHours: z.coerce.number().int().min(0).max(1000).default(0),
    failedExamAttempts: z.coerce.number().int().min(0).max(100).default(0),
    lastPracticeAt: z.string().datetime().nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional()
  })
}).superRefine((value, context) => {
  const hasParentContact = Boolean(value.parentName || value.parentPhone || value.parentEmail);

  if (value.parentContactStatus === 'ENABLED' && !hasParentContact) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['parentContactStatus'],
      message: 'Parent contact cannot be enabled without parent name, phone, or email.'
    });
  }

  if (value.enrollment.completedHours > value.enrollment.packageHours + value.enrollment.additionalHours) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['enrollment', 'completedHours'],
      message: 'Completed hours cannot exceed package hours plus additional hours.'
    });
  }

  if (
    value.enrollment.trainingMode === 'LICENSED_MANUAL_HOURS' &&
    !value.enrollment.previousLicenseCategory
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['enrollment', 'previousLicenseCategory'],
      message: 'Previous license category is required for licensed-manual-hours students.'
    });
  }

  if (
    value.initialPayment &&
    value.initialPayment.paidAmount > value.initialPayment.amount
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['initialPayment', 'paidAmount'],
      message: 'Paid amount cannot exceed payment amount.'
    });
  }

  if (value.portalPassword !== undefined && value.portalPassword !== null && value.portalPassword.trim().length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['portalPassword'],
      message: 'Portal password cannot be empty.'
    });
  }
});

export type StudentMutationRequest = z.infer<typeof studentMutationRequestSchema>;
