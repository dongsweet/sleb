import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default('postgres://sleb:sleb@localhost:5432/sleb'),
  VALKEY_URL: z.string().default('redis://localhost:6379'),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_ACCESS_KEY: z.string().default('sleb'),
  MINIO_SECRET_KEY: z.string().default('sleb-secret'),
  MINIO_BUCKET: z.string().default('sleb-media'),
  MINIO_USE_SSL: z
    .string()
    .transform((value) => value === 'true')
    .default('false')
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  return envSchema.parse(process.env);
}
