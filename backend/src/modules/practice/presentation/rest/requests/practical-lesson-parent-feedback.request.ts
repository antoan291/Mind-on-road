import { z } from 'zod';

export const practicalLessonParentFeedbackRequestSchema = z.object({
  parentFeedbackRating: z.number().int().min(1).max(5),
  parentFeedbackComment: z.string().trim().min(2).max(1000)
});
