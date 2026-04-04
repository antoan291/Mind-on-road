import {
  PracticalLessonEvaluationStatus,
  PracticalLessonPaymentStatus,
  PracticalLessonStatus
} from '@prisma/client';
import { z } from 'zod';

export const practicalLessonCreateRequestSchema = z.object({
  studentId: z.string().uuid(),
  studentName: z.string().trim().min(2).max(200),
  instructorName: z.string().trim().min(2).max(200),
  vehicleLabel: z.string().trim().min(2).max(200),
  categoryCode: z.string().trim().min(1).max(10),
  lessonDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTimeLabel: z.string().trim().min(4).max(20),
  endTimeLabel: z.string().trim().min(4).max(20),
  durationMinutes: z.number().int().min(30).max(600),
  status: z.nativeEnum(PracticalLessonStatus).default('SCHEDULED'),
  paymentStatus: z
    .nativeEnum(PracticalLessonPaymentStatus)
    .default('PENDING'),
  evaluationStatus: z
    .nativeEnum(PracticalLessonEvaluationStatus)
    .default('PENDING'),
  routeLabel: z.string().trim().max(200).nullable().default(null),
  startLocation: z.string().trim().max(200).nullable().default(null),
  endLocation: z.string().trim().max(200).nullable().default(null),
  notes: z.string().trim().max(1000).nullable().default(null),
  kmDriven: z.number().int().min(0).max(2000).nullable().default(null),
  rating: z.number().int().min(0).max(5).nullable().default(null),
  parentNotificationSent: z.boolean().default(false),
  parentPerformanceSummary: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .default(null)
});
