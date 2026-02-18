import { Router } from 'express';
import { EnrollmentController } from './enrollment.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All enrollment routes require authentication
router.use(authenticate);

// List enrollments (Staff and above)
router.get('/', authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF, Role.FINANCE), EnrollmentController.list);

// Create enrollment (Admin and Staff)
router.post('/', authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF), EnrollmentController.create);

// Get single enrollment
router.get('/:id', authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF, Role.FINANCE), EnrollmentController.get);

// Update enrollment status (Admin and Staff)
router.patch('/:id/status', authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF), EnrollmentController.updateStatus);

// Delete enrollment (Admin only)
router.delete('/:id', authorize(Role.SUPER_ADMIN, Role.ADMIN), EnrollmentController.delete);

export default router;
