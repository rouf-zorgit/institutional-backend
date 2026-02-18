import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler.middleware';
import { TokenBlacklistService } from '../utils/tokenBlacklist.service';
import { AuthUser } from '../types/express';

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // 1. Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'No token provided', 'NO_TOKEN');
        }

        const token = authHeader.substring(7);

        // 2. Check if token is blacklisted (Redis - fast!)
        const isBlacklisted = await TokenBlacklistService.isBlacklisted(token);

        if (isBlacklisted) {
            throw new AppError(401, 'Token has been revoked', 'TOKEN_REVOKED');
        }

        // 3. Verify token (stateless - no DB query!)
        const decoded = jwt.verify(token, config.jwt.secret) as any;

        if (decoded.type !== 'access') {
            throw new AppError(401, 'Invalid token type', 'INVALID_TOKEN');
        }

        // 4. Check if user tokens are globally blacklisted
        const isUserBlacklisted = await TokenBlacklistService.isUserBlacklisted(decoded.sub);

        if (isUserBlacklisted) {
            throw new AppError(401, 'All user tokens have been revoked', 'TOKEN_REVOKED');
        }

        // 5. Attach user to request
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            status: decoded.status,
        } as AuthUser;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AppError(401, 'Invalid token', 'INVALID_TOKEN');
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError(401, 'Token expired', 'TOKEN_EXPIRED');
        }
        throw error;
    }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't throw error if not
 */
export const optionalAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);

        const isBlacklisted = await TokenBlacklistService.isBlacklisted(token);
        if (isBlacklisted) {
            return next();
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;

        if (decoded.type === 'access') {
            req.user = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
                status: decoded.status,
            } as AuthUser;
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
