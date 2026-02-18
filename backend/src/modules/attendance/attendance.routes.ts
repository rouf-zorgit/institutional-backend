import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticate } from '@/common/middleware/auth.middleware';
import { authorize } from '@/common/middleware/role.middleware';
import { asyncHandler } from '@/common/middleware/errorHandler.middleware';

const router = Router();

// All attendance routes require authentication
router.use(authenticate);

// Mark individual attendance (Teachers, Staff, Admin)
router.post(
    '/mark',
    authorize('SUPER_ADMIN', 'ADMIN', 'STAFF', 'TEACHER'),
    asyncHandler(AttendanceController.markAttendance)
);

// Bulk mark attendance (Teachers, Staff, Admin)
router.post(
    '/bulk-mark',
    authorize('SUPER_ADMIN', 'ADMIN', 'STAFF', 'TEACHER'),
    asyncHandler(AttendanceController.bulkMarkAttendance)
);

// Update attendance record (Teachers, Staff, Admin)
router.put(
    '/:id',
    authorize('SUPER_ADMIN', 'ADMIN', 'STAFF', 'TEACHER'),
    asyncHandler(AttendanceController.updateAttendance)
);

// Delete attendance record (Admin only)
router.delete(
    '/:id',
    authorize('SUPER_ADMIN', 'ADMIN'),
    asyncHandler(AttendanceController.deleteAttendance)
);

// Get student attendance history (Students can view their own, others need staff access)
router.get(
    '/student/:studentId',
    asyncHandler(AttendanceController.getStudentAttendance)
);

// Get student attendance statistics
router.get(
    '/stats/:studentId',
    asyncHandler(AttendanceController.getStudentStats)
);

// Get batch attendance for a specific date
router.get(
    '/batch/:batchId/date/:date',
    authorize('SUPER_ADMIN', 'ADMIN', 'STAFF', 'TEACHER'),
    asyncHandler(AttendanceController.getBatchAttendanceByDate)
);

// Get attendance report with filters
router.get(
    '/report',
    authorize('SUPER_ADMIN', 'ADMIN', 'STAFF', 'TEACHER'),
    asyncHandler(AttendanceController.getAttendanceReport)
);

export default router;
