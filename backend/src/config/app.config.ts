import { envSchema } from './env.schema';

const parsedEnv = envSchema.parse(process.env);

export const appConfig = {
  env: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  webAppUrl: parsedEnv.WEB_APP_URL,
  sessionTtlHours: parsedEnv.SESSION_TTL_HOURS,
  authCookieName: parsedEnv.AUTH_COOKIE_NAME,
  databaseUrl: parsedEnv.DATABASE_URL,
  directDatabaseUrl: parsedEnv.DIRECT_DATABASE_URL,
  redisUrl: parsedEnv.REDIS_URL,
  sessionSecret: parsedEnv.SESSION_SECRET,
  objectStorage: {
    bucket: parsedEnv.OBJECT_STORAGE_BUCKET,
    region: parsedEnv.OBJECT_STORAGE_REGION,
    endpoint: parsedEnv.OBJECT_STORAGE_ENDPOINT,
    accessKey: parsedEnv.OBJECT_STORAGE_ACCESS_KEY,
    secretKey: parsedEnv.OBJECT_STORAGE_SECRET_KEY
  },
  documentOcrSourceDir: parsedEnv.DOCUMENT_OCR_SOURCE_DIR,
  documentOcrOutputDir: parsedEnv.DOCUMENT_OCR_OUTPUT_DIR,
  documentOcrWorkerUrl: parsedEnv.DOCUMENT_OCR_WORKER_URL,
  openAiApiKey: parsedEnv.OPENAI_API_KEY
};
