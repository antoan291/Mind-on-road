import { z } from 'zod';

export const studentOcrAutofillQuerySchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(5)
    .max(255)
    .regex(
      /^[A-Za-z0-9._ -]+\.(pdf|png|jpe?g|webp|bmp|tiff?)$/i,
      'OCR source file must be a safe PDF or image file name.'
    )
});

export type StudentOcrAutofillQuery = z.infer<
  typeof studentOcrAutofillQuerySchema
>;
