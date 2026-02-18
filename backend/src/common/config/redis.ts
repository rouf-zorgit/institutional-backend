import { createClient } from 'redis';
import { config } from './env';
import { logger } from '../utils/logger.service';

export const redis = createClient({
    username: config.redis.username,
    password: config.redis.password,
    socket: {
        host: config.redis.host,
        port: config.redis.port,
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
    }
});

redis.on('error', (err) => logger.error('Redis Client Error', { error: err.message }));

// Note: In Node-Redis v4+, you must call .connect() explicitly.
// This will be handled in app.ts or during first use.

// Cache TTL constants (in seconds)
export const CacheTTL = {
    COURSES: 3600,        // 1 hour
    BATCHES: 1800,        // 30 minutes
    STUDENTS: 300,        // 5 minutes
    ATTENDANCE: 600,      // 10 minutes
    DASHBOARD_STATS: 300, // 5 minutes
    USER_PROFILE: 1800,   // 30 minutes
} as const;

// Cache key prefixes
export const CachePrefix = {
    COURSE: 'course',
    BATCH: 'batch',
    STUDENT: 'student',
    ATTENDANCE: 'attendance',
    DASHBOARD: 'dashboard',
    USER: 'user',
} as const;

export default redis;
