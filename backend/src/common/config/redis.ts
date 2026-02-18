import { Redis } from '@upstash/redis';
import { config } from './env';

export const redis = new Redis({
    url: config.redis.url,
    token: config.redis.token,
});

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
