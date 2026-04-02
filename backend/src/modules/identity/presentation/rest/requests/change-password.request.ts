import { z } from 'zod';

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(15).max(64)
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
