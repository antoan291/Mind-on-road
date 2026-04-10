import { z } from 'zod';

export const theoryGroupCreateRequestSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    categoryCode: z.string().trim().min(1).max(10),
    scheduleLabel: z.string().trim().min(2).max(200),
    instructorName: z.string().trim().min(2).max(200),
    daiCode: z.string().trim().min(2).max(50),
    startDate: z.string().date(),
    endDate: z.string().date().nullable().optional(),
    totalLectures: z.number().int().min(0).max(200)
  })
  .refine(
    (payload) =>
      !payload.endDate ||
      new Date(`${payload.endDate}T00:00:00.000Z`).getTime() >=
        new Date(`${payload.startDate}T00:00:00.000Z`).getTime(),
    {
      message: 'Крайната дата трябва да е след началната дата.',
      path: ['endDate']
    }
  );
