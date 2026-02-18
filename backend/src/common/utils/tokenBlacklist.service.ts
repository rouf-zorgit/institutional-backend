import redis from '../config/redis';

export class TokenBlacklistService {
    private static PREFIX = 'blacklist:token:';
    private static USER_PREFIX = 'blacklist:user:';

    /**
     * Add token to blacklist
     * TTL = remaining token lifetime
     */
    static async blacklistToken(token: string, expiresAt: Date): Promise<void> {
        const key = `${this.PREFIX}${token}`;
        const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

        if (ttl > 0) {
            await redis.setex(key, ttl, '1');
        }
    }

    /**
     * Check if token is blacklisted
     * O(1) lookup - extremely fast
     */
    static async isBlacklisted(token: string): Promise<boolean> {
        const key = `${this.PREFIX}${token}`;
        const result = await redis.get(key);
        return result !== null;
    }

    /**
     * Blacklist all user tokens (logout from all devices)
     */
    static async blacklistUserTokens(userId: string, expiresAt: Date): Promise<void> {
        const key = `${this.USER_PREFIX}${userId}`;
        const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

        if (ttl > 0) {
            await redis.setex(key, ttl, '1');
        }
    }

    /**
     * Check if all user tokens are blacklisted
     */
    static async isUserBlacklisted(userId: string): Promise<boolean> {
        const key = `${this.USER_PREFIX}${userId}`;
        const result = await redis.get(key);
        return result !== null;
    }

    /**
     * Remove token from blacklist (for testing)
     */
    static async removeFromBlacklist(token: string): Promise<void> {
        const key = `${this.PREFIX}${token}`;
        await redis.del(key);
    }

    /**
     * Remove user from blacklist (for testing)
     */
    static async removeUserFromBlacklist(userId: string): Promise<void> {
        const key = `${this.USER_PREFIX}${userId}`;
        await redis.del(key);
    }
}

export default TokenBlacklistService;
