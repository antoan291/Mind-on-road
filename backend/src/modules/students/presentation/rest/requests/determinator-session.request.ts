import { z } from 'zod';

export const determinatorSessionsQuerySchema = z.object({
  studentId: z.string().uuid().optional()
});

export const determinatorSessionRequestSchema = z.object({
  studentId: z.string().uuid(),
  registrationNumber: z.string().trim().min(1).max(50),
  autoTempoCorrectReactions: z.coerce.number().int().min(0).max(10000),
  autoTempoWrongReactions: z.coerce.number().int().min(0).max(10000),
  forcedTempoCorrectReactions: z.coerce.number().int().min(0).max(10000),
  forcedTempoDelayedReactions: z.coerce.number().int().min(0).max(10000),
  forcedTempoWrongResults: z.coerce.number().int().min(0).max(10000),
  forcedTempoMissedStimuli: z.coerce.number().int().min(0).max(10000),
  overallResult: z.string().trim().max(1000).nullable().optional(),
  instructorNote: z.string().trim().max(1000).nullable().optional()
});
