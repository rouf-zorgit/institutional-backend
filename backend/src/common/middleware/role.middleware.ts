import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler.middleware';

/**
 * Authorization middleware
 * Checks if the authenticated user has one of the required roles
 */
export const authorize = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
        }

        if (!allowedRoles.includes(req.user.role as Role)) {
            return next(new AppError(403, 'You do not have permission to perform this action', 'FORBIDDEN'));
        }

        next();
    };
};
