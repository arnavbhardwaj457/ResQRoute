import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().default(''),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5000'),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
  NEXT_PUBLIC_OSRM_ENDPOINT: z.string().url().default('https://router.project-osrm.org'),
});

export const env = clientEnvSchema.parse({
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_OSRM_ENDPOINT: process.env.NEXT_PUBLIC_OSRM_ENDPOINT,
});
