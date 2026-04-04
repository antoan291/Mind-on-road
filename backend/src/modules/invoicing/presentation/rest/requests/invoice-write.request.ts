import { z } from 'zod';

export const invoiceIdParamsSchema = z.object({
  invoiceId: z.string().uuid()
});

export const invoiceCreateRequestSchema = z.object({
  studentId: z.string().uuid(),
  invoiceNumber: z.string().trim().min(1).max(50).optional(),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recipientName: z.string().trim().min(1).max(200),
  categoryCode: z.string().trim().min(1).max(10),
  invoiceReason: z.string().trim().min(1).max(200),
  packageType: z.string().trim().min(1).max(100),
  totalAmount: z.number().int().positive(),
  status: z.enum(['DRAFT', 'ISSUED', 'CANCELED', 'CORRECTED', 'OVERDUE']),
  paymentLinkStatus: z.enum(['LINKED', 'NOT_LINKED', 'PARTIAL']),
  paymentNumber: z.string().trim().max(50).nullable().optional(),
  paymentStatus: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  issuedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
});

export const invoiceUpdateRequestSchema = z.object({
  invoiceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  recipientName: z.string().trim().min(1).max(200).optional(),
  categoryCode: z.string().trim().min(1).max(10).optional(),
  invoiceReason: z.string().trim().min(1).max(200).optional(),
  packageType: z.string().trim().min(1).max(100).optional(),
  totalAmount: z.number().int().positive().optional(),
  status: z
    .enum(['DRAFT', 'ISSUED', 'CANCELED', 'CORRECTED', 'OVERDUE'])
    .optional(),
  paymentLinkStatus: z
    .enum(['LINKED', 'NOT_LINKED', 'PARTIAL'])
    .optional(),
  paymentNumber: z.string().trim().max(50).nullable().optional(),
  paymentStatus: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  issuedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  wasCorrected: z.boolean().optional(),
  correctionReason: z.string().trim().max(500).nullable().optional()
});
