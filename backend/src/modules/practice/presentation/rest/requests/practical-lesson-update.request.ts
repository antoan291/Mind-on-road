import {
  PracticalLessonEvaluationStatus,
  PracticalLessonPaymentStatus,
  PracticalLessonStatus
} from '@prisma/client';
import { z } from 'zod';

export const practicalLessonUpdateRequestSchema = z
  .object({
    studentName: z.string().trim().min(2).max(200).optional(),
    instructorName: z.string().trim().min(2).max(200).optional(),
    vehicleLabel: z.string().trim().min(2).max(200).optional(),
    categoryCode: z.string().trim().min(1).max(10).optional(),
    lessonDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTimeLabel: z.string().trim().min(4).max(20).optional(),
    endTimeLabel: z.string().trim().min(4).max(20).optional(),
    durationMinutes: z.number().int().min(30).max(600).optional(),
    status: z.nativeEnum(PracticalLessonStatus).optional(),
    paymentStatus: z.nativeEnum(PracticalLessonPaymentStatus).optional(),
    evaluationStatus: z.nativeEnum(PracticalLessonEvaluationStatus).optional(),
    routeLabel: z.string().trim().max(200).nullable().optional(),
    startLocation: z.string().trim().max(200).nullable().optional(),
    endLocation: z.string().trim().max(200).nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    kmDriven: z.number().int().min(0).max(2000).nullable().optional(),
    rating: z.number().int().min(0).max(5).nullable().optional(),
    parentNotificationSent: z.boolean().optional(),
    parentPerformanceSummary: z.string().trim().max(1000).nullable().optional(),
    parentFeedbackRating: z.number().int().min(1).max(5).nullable().optional(),
    parentFeedbackComment: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional(),
    parentFeedbackSubmittedAt: z.string().datetime().nullable().optional(),
    studentFeedbackRating: z.number().int().min(1).max(5).nullable().optional(),
    studentFeedbackComment: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional(),
    studentFeedbackSubmittedAt: z.string().datetime().nullable().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field must be provided.'
  });
