import { z } from 'zod';

const paymentStatusSchema = z.enum([
  'PAID',
  'PARTIAL',
  'OVERDUE',
  'PENDING',
  'CANCELED'
]);

export const paymentIdParamsSchema = z.object({
  paymentId: z.string().uuid()
});

export const paymentCreateRequestSchema = z.object({
  studentId: z.string().uuid(),
  paymentNumber: z.string().trim().min(1).max(50).optional(),
  amount: z.coerce.number().int().min(0).max(10_000_000),
  paidAmount: z.coerce.number().int().min(0).max(10_000_000).optional(),
  method: z.string().trim().min(1).max(50),
  status: paymentStatusSchema.default('PENDING'),
  paidAt: z.string().date(),
  note: z.string().trim().max(500).nullish()
});

export const paymentUpdateRequestSchema = z
  .object({
    studentId: z.string().uuid().optional(),
    paymentNumber: z.string().trim().min(1).max(50).optional(),
    amount: z.coerce.number().int().min(0).max(10_000_000).optional(),
    paidAmount: z.coerce.number().int().min(0).max(10_000_000).optional(),
    method: z.string().trim().min(1).max(50).optional(),
    status: paymentStatusSchema.optional(),
    paidAt: z.string().date().optional(),
    note: z.string().trim().max(500).nullish()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one payment field is required.'
  });
