import { z } from 'zod';

export const loginRequestSchema = z.object({
  tenantSlug: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().min(1).max(200)
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
