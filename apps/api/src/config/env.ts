import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).optional(),
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  TRAFFIC_API_RETRY_MAX: z.coerce.number().int().min(1).max(8).default(3),
  TRAFFIC_API_RETRY_DELAY_MS: z.coerce.number().int().positive().default(300),
});

export const env = envSchema.parse(process.env);
