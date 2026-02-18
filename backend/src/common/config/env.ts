import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3001'),

    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    DATABASE_POOLER_URL: z.string().min(1, 'DATABASE_POOLER_URL is required'),

    // Supabase
    SUPABASE_URL: z.string().url('Invalid SUPABASE_URL'),
    SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

    // JWT
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Redis
    UPSTASH_REDIS_REST_URL: z.string().url('Invalid UPSTASH_REDIS_REST_URL'),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),

    // Application
    API_URL: z.string().url('Invalid API_URL'),
    FRONTEND_URL: z.string().url('Invalid FRONTEND_URL'),
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

    // Rate Limiting
    RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true').default('true'),

    // File Upload
    MAX_FILE_SIZE_MB: z.string().transform(Number).default('10'),
    ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,application/pdf'),

    // Email
    EMAIL_FROM: z.string().email().optional(),
    EMAIL_PROVIDER: z.enum(['sendgrid', 'resend', 'ses', 'smtp']).optional(),
    EMAIL_API_KEY: z.string().optional(),

    // Monitoring
    SENTRY_DSN: z.string().url().optional().or(z.literal('')),
});

// Validate environment variables
const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ CRITICAL: Invalid environment variables detected!');
            console.error('The application is failing to start because the following variables are missing or invalid:');
            error.errors.forEach((err) => {
                console.error(`👉 ${err.path.join('.')}: ${err.message}`);
            });
            console.error('Please check your Vercel Dashboard -> Settings -> Environment Variables.');
            process.exit(1);
        }
        throw error;
    }
};

export const env = parseEnv();

// Export typed environment variables
export const config = {
    env: env.NODE_ENV,
    port: parseInt(env.PORT, 10),
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',

    database: {
        url: env.DATABASE_URL,
        poolerUrl: env.DATABASE_POOLER_URL,
    },

    supabase: {
        url: env.SUPABASE_URL,
        anonKey: env.SUPABASE_ANON_KEY,
        serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    },

    jwt: {
        secret: env.JWT_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
        expiresIn: env.JWT_EXPIRES_IN,
        refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },

    redis: {
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    },

    app: {
        apiUrl: env.API_URL,
        frontendUrl: env.FRONTEND_URL,
        allowedOrigins: env.ALLOWED_ORIGINS.split(','),
    },

    rateLimit: {
        enabled: env.RATE_LIMIT_ENABLED,
    },

    upload: {
        maxFileSizeMB: env.MAX_FILE_SIZE_MB,
        allowedFileTypes: env.ALLOWED_FILE_TYPES.split(','),
    },

    email: {
        from: env.EMAIL_FROM,
        provider: env.EMAIL_PROVIDER,
        apiKey: env.EMAIL_API_KEY,
    },

    monitoring: {
        sentryDsn: env.SENTRY_DSN,
    },
};
