import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '@/common/middleware/validation.middleware';
import { authenticate } from '@/common/middleware/auth.middleware';
import { authorize } from '@/common/middleware/role.middleware';
import { rateLimitMiddleware, rateLimiters } from '@/common/middleware/rateLimit.middleware';
import {
    loginSchema,
    registerSchema,
    refreshSchema,
    logoutSchema,
    verifySchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateRoleSchema,
} from './auth.validation';

const router = Router();

// Public routes with strict rate limiting
router.post(
    '/login',
    rateLimitMiddleware(rateLimiters.auth),
    validate(loginSchema),
    AuthController.login
);

router.post(
    '/register',
    rateLimitMiddleware(rateLimiters.auth),
    validate(registerSchema),
    AuthController.register
);

router.post(
    '/refresh',
    rateLimitMiddleware(rateLimiters.public),
    validate(refreshSchema),
    AuthController.refresh
);

router.post(
    '/verify',
    rateLimitMiddleware(rateLimiters.public),
    validate(verifySchema),
    AuthController.verify
);

router.post(
    '/forgot-password',
    rateLimitMiddleware(rateLimiters.auth),
    validate(forgotPasswordSchema),
    AuthController.forgotPassword
);

router.post(
    '/reset-password',
    rateLimitMiddleware(rateLimiters.auth),
    validate(resetPasswordSchema),
    AuthController.resetPassword
);

// Protected routes
router.post(
    '/logout',
    authenticate,
    validate(logoutSchema),
    AuthController.logout
);

router.post(
    '/logout-all',
    authenticate,
    AuthController.logoutAll
);

router.get(
    '/me',
    authenticate,
    AuthController.me
);

// Admin only routes
router.patch(
    '/users/:userId/role',
    authenticate,
    authorize('SUPER_ADMIN'),
    validate(updateRoleSchema),
    AuthController.updateRole
);

export default router;
