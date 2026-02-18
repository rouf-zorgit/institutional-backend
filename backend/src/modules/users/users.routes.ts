import { Router } from 'express';
import { UsersController } from './users.controller';
import { validate } from '../../common/middleware/validation.middleware';
import { authenticate } from '../../common/middleware/auth.middleware';
import { hasPermission } from '../../common/middleware/rbac.middleware';
import { Permission } from '../../common/types/permissions';
import * as validation from './users.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List users
router.get(
    '/',
    hasPermission(Permission.USER_LIST),
    validate(validation.listUsersSchema),
    UsersController.list
);

// Get user by ID
router.get(
    '/:id',
    hasPermission(Permission.USER_READ),
    validate(validation.getUserSchema),
    UsersController.get
);

// Create user
router.post(
    '/',
    hasPermission(Permission.USER_CREATE),
    validate(validation.createUserSchema),
    UsersController.create
);

// Update profile
router.patch(
    '/:id',
    hasPermission(Permission.USER_UPDATE),
    validate(validation.updateUserProfileSchema),
    UsersController.updateProfile
);

// Update status
router.patch(
    '/:id/status',
    hasPermission(Permission.USER_UPDATE),
    validate(validation.updateUserStatusSchema),
    UsersController.updateStatus
);

// Update role
router.patch(
    '/:id/role',
    hasPermission(Permission.USER_UPDATE),
    validate(validation.updateUserRoleSchema),
    UsersController.updateRole
);

// Delete user
router.delete(
    '/:id',
    hasPermission(Permission.USER_DELETE),
    validate(validation.getUserSchema),
    UsersController.delete
);

export default router;
