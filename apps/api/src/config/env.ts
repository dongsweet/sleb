import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default("postgres://sleb:sleb@localhost:5432/sleb"),
  VALKEY_URL: z.string().default("redis://localhost:6379"),
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_ACCESS_KEY: z.string().default("sleb"),
  MINIO_SECRET_KEY: z.string().default("sleb-secret"),
  MINIO_BUCKET: z.string().default("sleb-media"),
  MINIO_USE_SSL: z
    .string()
    .transform((value) => value === "true")
    .default("false"),
  AUTH_SESSION_SECRET: z
    .string()
    .min(16)
    .default("sleb-local-session-secret-change-me"),
  AUTH_SESSION_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 8),
  AUTH_COOKIE_SECURE: z
    .string()
    .transform((value) => value === "true")
    .default("false"),
  ADMIN_EMAIL: z.string().email().default("admin@sleb.local"),
  ADMIN_PASSWORD: z.string().min(8).default("SlebAdmin2026!"),
  ADMIN_NAME: z.string().default("SLEB Platform Admin"),
  ADMIN_CONTENT_ROLE: z
    .enum(["content_author", "content_publisher", "platform_admin"])
    .default("platform_admin"),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  return envSchema.parse(process.env);
}
