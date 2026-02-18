import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import coursesRoutes from '../modules/courses/courses.routes';
import batchRoutes from '../modules/batch/batch.routes';
import registrationRoutes from '../modules/registration/registration.routes';
import enrollmentRoutes from '../modules/enrollment/enrollment.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import auditRoutes from '../modules/audit/audit.routes';
import reportingRoutes from '../modules/reporting/reporting.routes';
import assignmentsRoutes from '../modules/assignments/assignments.routes';
import studyMaterialsRoutes from '../modules/study-materials/study-materials.routes';
import uploadRoutes from '../modules/upload/upload.routes';
import submissionRoutes from '../modules/submissions/submissions.routes';

const router = Router();

// API version prefix
const API_VERSION = '/v1';

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, usersRoutes);
router.use(`${API_VERSION}/payments`, paymentsRoutes);
router.use(`${API_VERSION}/courses`, coursesRoutes);
router.use(`${API_VERSION}/batches`, batchRoutes);
router.use(`${API_VERSION}/registrations`, registrationRoutes);
router.use(`${API_VERSION}/enrollments`, enrollmentRoutes);
router.use(`${API_VERSION}/attendance`, attendanceRoutes);
router.use(`${API_VERSION}/notifications`, notificationRoutes);
router.use(`${API_VERSION}/audit-logs`, auditRoutes);
router.use(`${API_VERSION}/reports`, reportingRoutes);
router.use(`${API_VERSION}/assignments`, assignmentsRoutes);
router.use(`${API_VERSION}/study-materials`, studyMaterialsRoutes);
router.use(`${API_VERSION}/upload`, uploadRoutes);
router.use(`${API_VERSION}/submissions`, submissionRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        },
    });
});

// API info
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'Institutional Management System API',
            version: '1.0.0',
            endpoints: {
                auth: `${API_VERSION}/auth`,
                health: '/health',
            },
        },
    });
});

export default router;
