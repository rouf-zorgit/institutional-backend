import { Ratelimit } from '@upstash/ratelimit';
import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import { config } from '../config/env';

// Different rate limiters for different use cases
export const rateLimiters = {
    // Authentication endpoints - strict
    auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
        analytics: true,
        prefix: 'ratelimit:auth',
    }),

    // Public API - moderate
    public: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
        analytics: true,
        prefix: 'ratelimit:public',
    }),

    // Authenticated users - generous
    authenticated: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1000, '1 m'), // 1000 requests per minute
        analytics: true,
        prefix: 'ratelimit:authenticated',
    }),

    // Admin operations - very generous
    admin: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5000, '1 m'), // 5000 requests per minute
        analytics: true,
        prefix: 'ratelimit:admin',
    }),

    // File uploads - strict
    upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour
        analytics: true,
        prefix: 'ratelimit:upload',
    }),
};

export const rateLimitMiddleware = (limiter: Ratelimit) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!config.rateLimit.enabled) {
            return next();
        }

        const identifier = (req as any).user?.id || req.ip || 'anonymous';

        try {
            const { success, limit, reset, remaining } = await limiter.limit(identifier);

            res.setHeader('X-RateLimit-Limit', limit.toString());
            res.setHeader('X-RateLimit-Remaining', remaining.toString());
            res.setHeader('X-RateLimit-Reset', reset.toString());

            if (!success) {
                return res.status(429).json({
                    success: false,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: 'Too many requests. Please try again later.',
                        statusCode: 429,
                        retryAfter: Math.ceil((reset - Date.now()) / 1000),
                    },
                });
            }

            next();
        } catch (error) {
            // If rate limiting fails, allow the request (fail open)
            console.error('Rate limit error:', error);
            next();
        }
    };
};

// Dynamic rate limiter based on user role
export const dynamicRateLimitMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = (req as any).user;

    let limiter: Ratelimit;

    if (!user) {
        limiter = rateLimiters.public;
    } else if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        limiter = rateLimiters.admin;
    } else {
        limiter = rateLimiters.authenticated;
    }

    return rateLimitMiddleware(limiter)(req, res, next);
};
