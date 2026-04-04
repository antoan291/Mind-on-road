import { z } from 'zod';

export const practicalLessonStudentFeedbackRequestSchema = z.object({
  studentFeedbackRating: z.number().int().min(1).max(5),
  studentFeedbackComment: z.string().trim().min(2).max(1000)
});
