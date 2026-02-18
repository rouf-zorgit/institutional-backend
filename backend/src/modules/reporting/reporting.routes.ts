import { Router } from 'express';
import { ReportingController } from './reporting.controller';
import { authenticate } from '@/common/middleware/auth.middleware';
import { authorize } from '@/common/middleware/role.middleware';
import { asyncHandler } from '@/common/middleware/errorHandler.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Get dashboard statistics
 * @access  Admin, Finance, Teacher
 */
router.get(
    '/dashboard',
    authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE, Role.TEACHER),
    asyncHandler(ReportingController.getDashboard)
);

/**
 * @route   GET /api/reports/teacher-stats
 * @desc    Get teacher statistics
 * @access  Admin, Teacher
 */
router.get(
    '/teacher-stats',
    authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
    asyncHandler(ReportingController.getTeacherStats)
);

/**
 * @route   GET /api/reports/enrollments
 * @desc    Get enrollment trends
 * @access  Admin, Finance
 */
router.get(
    '/enrollments',
    authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE),
    asyncHandler(ReportingController.getEnrollmentTrends)
);

/**
 * @route   GET /api/reports/payments
 * @desc    Get payment analytics
 * @access  Admin, Finance
 */
router.get(
    '/payments',
    authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE),
    asyncHandler(ReportingController.getPaymentAnalytics)
);

/**
 * @route   GET /api/reports/attendance
 * @desc    Get attendance statistics
 * @access  Admin, Teacher
 */
router.get(
    '/attendance',
    authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
    asyncHandler(ReportingController.getAttendanceStats)
);

/**
 * @route   GET /api/reports/export/enrollments
 * @desc    Export enrollments to CSV
 * @access  Admin, Finance
 */
router.get(
    '/export/enrollments',
    authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE),
    asyncHandler(ReportingController.exportEnrollments)
);

/**
 * @route   GET /api/reports/export/payments
 * @desc    Export payments to CSV
 * @access  Admin, Finance
 */
router.get(
    '/export/payments',
    authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE),
    asyncHandler(ReportingController.exportPayments)
);

/**
 * @route   GET /api/reports/export/attendance
 * @desc    Export attendance to CSV
 * @access  Admin, Teacher
 */
router.get(
    '/export/attendance',
    authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER),
    asyncHandler(ReportingController.exportAttendance)
);

export default router;
