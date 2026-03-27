import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  WEB_APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  DIRECT_DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  OBJECT_STORAGE_BUCKET: z.string().min(1),
  OBJECT_STORAGE_REGION: z.string().min(1),
  OBJECT_STORAGE_ENDPOINT: z.string().min(1),
  OBJECT_STORAGE_ACCESS_KEY: z.string().min(1),
  OBJECT_STORAGE_SECRET_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional()
});

export type AppEnv = z.infer<typeof envSchema>;
