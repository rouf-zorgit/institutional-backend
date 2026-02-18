import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3001'),

    // Database
    DATABASE_URL: z.string().optional(),
    DATABASE_POOLER_URL: z.string().optional(),

    // Supabase
    SUPABASE_URL: z.string().optional(),
    SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // JWT
    JWT_SECRET: z.string().optional(),
    JWT_REFRESH_SECRET: z.string().optional(),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Redis (Standard)
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.string().optional(),
    REDIS_USERNAME: z.string().optional().default('default'),
    REDIS_PASSWORD: z.string().optional(),

    // Redis (Upstash - Deprecated but kept for transition)
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // Application
    API_URL: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

    // Rate Limiting
    RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true').default('true'),

    // File Upload
    MAX_FILE_SIZE_MB: z.string().transform(Number).default('10'),
    ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,application/pdf'),

    // Email
    EMAIL_FROM: z.string().optional(),
    EMAIL_PROVIDER: z.enum(['sendgrid', 'resend', 'ses', 'smtp']).optional(),
    EMAIL_API_KEY: z.string().optional(),

    // Monitoring
    SENTRY_DSN: z.string().optional().or(z.literal('')),
});

// Post-process validation to handle fallbacks
const validateEnv = (data: any) => {
    const raw = envSchema.parse(data);

    // Fallback logic for Database
    const final_db_url = raw.DATABASE_URL || raw.DATABASE_POOLER_URL || '';
    const final_db_pooler = raw.DATABASE_POOLER_URL || raw.DATABASE_URL || '';

    // Critical check for Production
    if (raw.NODE_ENV === 'production') {
        if (!final_db_url) {
            console.warn('⚠️ WARNING: No DATABASE_URL or DATABASE_POOLER_URL provided');
        }
        if (!raw.JWT_SECRET) {
            console.warn('⚠️ WARNING: No JWT_SECRET provided');
        }
        if (!raw.SUPABASE_URL) {
            console.warn('⚠️ WARNING: No SUPABASE_URL provided');
        }
    }

    return {
        ...raw,
        DATABASE_URL: final_db_url,
        DATABASE_POOLER_URL: final_db_pooler,
        SUPABASE_URL: raw.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: raw.SUPABASE_ANON_KEY || '',
        SUPABASE_SERVICE_ROLE_KEY: raw.SUPABASE_SERVICE_ROLE_KEY || '',
        JWT_SECRET: raw.JWT_SECRET || '',
        JWT_REFRESH_SECRET: raw.JWT_REFRESH_SECRET || '',
        UPSTASH_REDIS_REST_URL: raw.UPSTASH_REDIS_REST_URL || '',
        REDIS_HOST: raw.REDIS_HOST || '',
        REDIS_PASSWORD: raw.REDIS_PASSWORD || '',
        API_URL: raw.API_URL || '',
        FRONTEND_URL: raw.FRONTEND_URL || '',
    };
};

// Validate environment variables
const parseEnv = () => {
    try {
        return validateEnv(process.env);
    } catch (error: any) {
        console.error('❌ CRITICAL: Environment validation failed!');
        console.error(error.message || error);

        if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
                console.error(`👉 ${err.path.join('.')}: ${err.message}`);
            });
        }

        console.error('Please check your Vercel Dashboard -> Settings -> Environment Variables.');
        process.exit(1);
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
        url: env.DATABASE_URL as string,
        poolerUrl: env.DATABASE_POOLER_URL as string,
    },

    supabase: {
        url: env.SUPABASE_URL as string,
        anonKey: env.SUPABASE_ANON_KEY as string,
        serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY as string,
    },

    jwt: {
        secret: env.JWT_SECRET as string,
        refreshSecret: env.JWT_REFRESH_SECRET as string,
        expiresIn: env.JWT_EXPIRES_IN,
        refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },

    redis: {
        host: env.REDIS_HOST as string,
        port: parseInt(env.REDIS_PORT || '14074', 10),
        username: env.REDIS_USERNAME as string,
        password: env.REDIS_PASSWORD as string,
        // Legacy Upstash support
        url: env.UPSTASH_REDIS_REST_URL as string,
        token: env.UPSTASH_REDIS_REST_TOKEN as string,
    },

    app: {
        apiUrl: env.API_URL as string,
        frontendUrl: env.FRONTEND_URL as string,
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
