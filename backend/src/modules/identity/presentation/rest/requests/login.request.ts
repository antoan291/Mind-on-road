import { z } from 'zod';

export const loginRequestSchema = z.object({
  tenantSlug: z.string().trim().min(1).max(100),
  email: z
    .string()
    .trim()
    .min(3)
    .max(320)
    .refine(
      (value) => z.string().email().safeParse(value).success || /^[+0-9\s-]{6,}$/.test(value),
      'Login identifier must be a valid email or phone number.'
    ),
  password: z.string().min(1).max(200)
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
