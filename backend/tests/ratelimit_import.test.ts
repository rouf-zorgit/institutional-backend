import { rateLimitMiddleware, rateLimiters } from '../src/common/middleware/rateLimit.middleware';

describe('RateLimit Middleware Import Test', () => {
    it('should import rateLimitMiddleware', () => {
        expect(rateLimitMiddleware).toBeDefined();
        expect(rateLimiters).toBeDefined();
    });
});
