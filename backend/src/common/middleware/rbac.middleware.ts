import { Request, Response, NextFunction } from 'express';
import { Permission, RolePermissions } from '../types/permissions';
import { AppError } from './errorHandler.middleware';
import { CacheService } from '../utils/cache.service';

/**
 * Check if user has required permission
 * Cached for performance
 */
export const hasPermission = (requiredPermission: Permission) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
        }

        // Check cache first (avoid repeated permission lookups)
        const cacheKey = `permissions:${user.role}`;
        let permissions = await CacheService.get<Permission[]>(cacheKey);

        if (!permissions) {
            permissions = RolePermissions[user.role] || [];
            // Cache for 1 hour (permissions rarely change)
            await CacheService.set(cacheKey, permissions, 3600);
        }

        if (!permissions.includes(requiredPermission)) {
            throw new AppError(
                403,
                `Permission denied: ${requiredPermission}`,
                'FORBIDDEN'
            );
        }

        next();
    };
};

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (requiredPermissions: Permission[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
        }

        const cacheKey = `permissions:${user.role}`;
        let permissions = await CacheService.get<Permission[]>(cacheKey);

        if (!permissions) {
            permissions = RolePermissions[user.role] || [];
            await CacheService.set(cacheKey, permissions, 3600);
        }

        const hasPermission = requiredPermissions.some((p) => permissions!.includes(p));

        if (!hasPermission) {
            throw new AppError(
                403,
                'Permission denied',
                'FORBIDDEN'
            );
        }

        next();
    };
};

/**
 * Check if user has all of the required permissions
 */
export const hasAllPermissions = (requiredPermissions: Permission[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
        }

        const cacheKey = `permissions:${user.role}`;
        let permissions = await CacheService.get<Permission[]>(cacheKey);

        if (!permissions) {
            permissions = RolePermissions[user.role] || [];
            await CacheService.set(cacheKey, permissions, 3600);
        }

        const hasAllPerms = requiredPermissions.every((p) => permissions!.includes(p));

        if (!hasAllPerms) {
            throw new AppError(
                403,
                'Permission denied',
                'FORBIDDEN'
            );
        }

        next();
    };
};

/**
 * Check if user has required role
 */
export const hasRole = (requiredRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
        }

        if (!requiredRoles.includes(user.role)) {
            throw new AppError(
                403,
                `Access denied. Required roles: ${requiredRoles.join(', ')}`,
                'FORBIDDEN'
            );
        }

        next();
    };
};

/**
 * Resource ownership check
 * Ensures user can only access their own resources
 */
export const isOwner = (resourceIdParam: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;
        const resourceId = req.params[resourceIdParam];

        if (!user) {
            throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
        }

        // Super admins and admins can access any resource
        if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
            return next();
        }

        // Check if user owns the resource
        if (user.id !== resourceId) {
            throw new AppError(
                403,
                'You can only access your own resources',
                'FORBIDDEN'
            );
        }

        next();
    };
};

/**
 * Check if user is active
 */
export const isActive = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
        throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    if (user.status !== 'ACTIVE') {
        throw new AppError(403, 'Account is not active', 'ACCOUNT_INACTIVE');
    }

    next();
};
