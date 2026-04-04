import { z } from 'zod';

export const examApplicationGenerateRequestSchema = z.object({
  studentId: z.string().uuid()
});

export const examApplicationIdParamsSchema = z.object({
  applicationId: z.string().uuid()
});

export const examApplicationStatusUpdateRequestSchema = z.object({
  status: z.enum([
    'DRAFT',
    'READY_FOR_REVIEW',
    'SENT',
    'RECEIVED',
    'APPROVED',
    'REJECTED'
  ]),
  statusNote: z.string().trim().max(1000).nullable().optional()
});
