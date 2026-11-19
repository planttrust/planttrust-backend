import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(16, 'must be at least 16 characters'),
  CORS_ORIGIN: z.url().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment variables in .env:\n${problems}`);
}

export const env = parsed.data;
