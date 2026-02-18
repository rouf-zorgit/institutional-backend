import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate } from '@/common/middleware/auth.middleware';
import { authorize } from '@/common/middleware/role.middleware';
import { asyncHandler } from '@/common/middleware/errorHandler.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/audit-logs
 * @desc    Get all audit logs
 * @access  Admin only
 */
router.get(
    '/',
    authorize(Role.SUPER_ADMIN, Role.ADMIN),
    asyncHandler(AuditController.list)
);

/**
 * @route   GET /api/audit-logs/stats
 * @desc    Get audit statistics
 * @access  Admin only
 */
router.get(
    '/stats',
    authorize(Role.SUPER_ADMIN, Role.ADMIN),
    asyncHandler(AuditController.getStats)
);

/**
 * @route   GET /api/audit-logs/export
 * @desc    Export audit logs
 * @access  Admin only
 */
router.get(
    '/export',
    authorize(Role.SUPER_ADMIN, Role.ADMIN),
    asyncHandler(AuditController.exportLogs)
);

/**
 * @route   GET /api/audit-logs/users/:userId
 * @desc    Get user activity
 * @access  Admin only
 */
router.get(
    '/users/:userId',
    authorize(Role.SUPER_ADMIN, Role.ADMIN),
    asyncHandler(AuditController.getUserActivity)
);

/**
 * @route   GET /api/audit-logs/history/:entity/:entityId
 * @desc    Get entity history
 * @access  Admin only
 */
router.get(
    '/history/:entity/:entityId',
    authorize(Role.SUPER_ADMIN, Role.ADMIN),
    asyncHandler(AuditController.getEntityHistory)
);

export default router;
