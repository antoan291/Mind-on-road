import { z } from 'zod';

const vehicleStatusSchema = z.enum([
  'ACTIVE',
  'SERVICE_SOON',
  'OUT_OF_SERVICE'
]);

export const vehicleIdParamsSchema = z.object({
  vehicleId: z.string().uuid()
});

export const vehicleCreateRequestSchema = z.object({
  vehicleLabel: z.string().trim().min(1).max(200),
  instructorName: z.string().trim().min(1).max(200),
  categoryCode: z.string().trim().min(1).max(10),
  status: vehicleStatusSchema.default('ACTIVE'),
  nextInspection: z.string().date(),
  activeLessons: z.coerce.number().int().min(0).max(500).default(0),
  operationalNote: z.string().trim().min(1).max(500)
});

export const vehicleUpdateRequestSchema = z
  .object({
    vehicleLabel: z.string().trim().min(1).max(200).optional(),
    instructorName: z.string().trim().min(1).max(200).optional(),
    categoryCode: z.string().trim().min(1).max(10).optional(),
    status: vehicleStatusSchema.optional(),
    nextInspection: z.string().date().optional(),
    activeLessons: z.coerce.number().int().min(0).max(500).optional(),
    operationalNote: z.string().trim().min(1).max(500).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one vehicle field is required.'
  });
