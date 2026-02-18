import redis, { CacheTTL } from '../config/redis';

export class CacheService {
    /**
     * Get value from cache
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) return null;

            return typeof data === 'string' ? JSON.parse(data) : (data as T);
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set value in cache with optional TTL
     */
    static async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            const serialized = JSON.stringify(value);

            if (ttl) {
                await redis.setex(key, ttl, serialized);
            } else {
                await redis.set(key, serialized);
            }
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    /**
     * Delete key from cache
     */
    static async del(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    /**
     * Delete multiple keys matching a pattern
     */
    static async invalidatePattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error('Cache invalidate pattern error:', error);
        }
    }

    /**
     * Get or set pattern - fetch from cache or execute function and cache result
     */
    static async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        // Try to get from cache first
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Execute function and cache result
        const result = await fetchFn();
        await this.set(key, result, ttl);

        return result;
    }

    /**
     * Check if key exists in cache
     */
    static async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    /**
     * Set expiration time for a key
     */
    static async expire(key: string, seconds: number): Promise<void> {
        try {
            await redis.expire(key, seconds);
        } catch (error) {
            console.error('Cache expire error:', error);
        }
    }

    /**
     * Increment a counter in cache
     */
    static async increment(key: string, by: number = 1): Promise<number> {
        try {
            return await redis.incrby(key, by);
        } catch (error) {
            console.error('Cache increment error:', error);
            return 0;
        }
    }
}

export default CacheService;
