import { z } from 'zod';

export const businessAssistantRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, 'Question must be at least 3 characters long.')
    .max(600, 'Question must be at most 600 characters long.')
});
