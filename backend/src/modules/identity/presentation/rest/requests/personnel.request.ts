import { z } from 'zod';

const personnelRoleKeySchema = z.enum([
  'administration',
  'instructor',
  'simulator_instructor'
]);

export const personnelRoleKeys = personnelRoleKeySchema.options;

export const personnelIdParamsSchema = z.object({
  membershipId: z.string().uuid()
});

export const personnelWriteRequestSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(320),
  password: z.string().trim().min(8).max(64).optional(),
  roleKeys: z.array(personnelRoleKeySchema).min(1).max(2)
}).transform((value) => ({
  ...value,
  password: value.password?.trim() || undefined,
  roleKeys: Array.from(new Set(value.roleKeys))
}));

export type PersonnelWriteRequest = z.infer<typeof personnelWriteRequestSchema>;
