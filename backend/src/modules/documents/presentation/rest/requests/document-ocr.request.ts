import { z } from 'zod';

export const documentOcrRunRequestSchema = z.object({
  sourceFileName: z
    .string()
    .trim()
    .min(5)
    .max(255)
    .regex(
      /^[A-Za-z0-9._ -]+\.pdf$/,
      'OCR source file must be a safe PDF file name.'
    )
});
