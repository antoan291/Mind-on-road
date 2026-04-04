import { z } from 'zod';

export const documentIdParamsSchema = z.object({
  documentId: z.string().uuid()
});

export const documentWriteRequestSchema = z.object({
  studentId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(200),
  ownerType: z.enum(['STUDENT', 'INSTRUCTOR', 'VEHICLE', 'SCHOOL']),
  ownerName: z.string().trim().min(1).max(200),
  ownerRef: z.string().trim().max(100).nullable().optional(),
  category: z.string().trim().min(1).max(100),
  documentNo: z.string().trim().max(100).nullable().optional(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  status: z.enum(['VALID', 'EXPIRING_SOON', 'EXPIRED', 'MISSING']),
  fileUrl: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional()
});
