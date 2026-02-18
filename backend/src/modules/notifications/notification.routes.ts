import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/role.middleware';
import { asyncHandler } from '../../common/middleware/errorHandler.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/notifications
 * @desc    Create a single notification (Admin only)
 * @access  Admin
 */
router.post(
    '/',
    authorize(Role.SUPER_ADMIN, Role.ADMIN),
    asyncHandler(NotificationController.create)
);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Create bulk notifications (Admin only)
 * @access  Admin
 */
router.post(
    '/bulk',
    authorize(Role.SUPER_ADMIN, Role.ADMIN),
    asyncHandler(NotificationController.createBulk)
);

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 * @access  Authenticated users
 */
router.get(
    '/',
    asyncHandler(NotificationController.list)
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Authenticated users
 */
router.get(
    '/unread-count',
    asyncHandler(NotificationController.getUnreadCount)
);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get single notification
 * @access  Authenticated users (own notifications only)
 */
router.get(
    '/:id',
    asyncHandler(NotificationController.get)
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Authenticated users (own notifications only)
 */
router.patch(
    '/:id/read',
    asyncHandler(NotificationController.markAsRead)
);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Authenticated users
 */
router.patch(
    '/read-all',
    asyncHandler(NotificationController.markAllAsRead)
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Authenticated users (own notifications only)
 */
router.delete(
    '/:id',
    asyncHandler(NotificationController.delete)
);

export default router;
