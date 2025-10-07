import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  PORT: z.string().optional().default('3000'),
  PRODUCTION_DOMAIN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  SENTRY_DSN: z.string().optional(), // Optional: Sentry DSN for backend error tracking
});

// Validate environment variables
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => {
        return `${err.path.join('.')}: ${err.message}`;
      });
      console.error('❌ Environment validation failed:');
      errorMessages.forEach((msg) => console.error(`  - ${msg}`));
      process.exit(1);
    }
    throw error;
  }
}

export default validateEnv;
