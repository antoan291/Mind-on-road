import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  WEB_APP_URL: z.string().url(),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().max(168).default(12),
  AUTH_COOKIE_NAME: z.string().trim().min(1).default('mindonroad_session'),
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
