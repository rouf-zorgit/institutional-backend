import { createClient } from 'redis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { config } from './env';
import { logger } from '../utils/logger.service';

// 1. Standard Redis Client (TCP) - used for caching
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

// 2. Upstash Redis Client (REST) - used specifically for @upstash/ratelimit
export const upstashRedis = new UpstashRedis({
    url: config.redis.url as string,
    token: config.redis.token as string,
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
