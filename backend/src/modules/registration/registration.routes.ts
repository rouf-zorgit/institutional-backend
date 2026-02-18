import { Router } from 'express';
import { RegistrationController } from './registration.controller';
import { validate } from '@/common/middleware/validation.middleware';
import { authenticate } from '@/common/middleware/auth.middleware';
import { hasPermission } from '@/common/middleware/rbac.middleware';
import { Permission } from '@/common/types/permissions';
import * as validation from './registration.validation';

const router = Router();

// Submit registration
router.post(
    '/',
    authenticate,
    validate(validation.registrationSchema),
    RegistrationController.submit
);

// List registrations
router.get(
    '/',
    authenticate,
    hasPermission(Permission.REGISTRATION_LIST),
    RegistrationController.list
);

// Get registration details
router.get(
    '/:id',
    authenticate,
    hasPermission(Permission.REGISTRATION_READ),
    RegistrationController.get
);

// Step 1: Academic Review
router.patch(
    '/:id/academic-review',
    authenticate,
    hasPermission(Permission.REGISTRATION_ACADEMIC_REVIEW),
    validate(validation.reviewSchema),
    RegistrationController.academicReview
);

// Step 2: Financial Verification
router.patch(
    '/:id/financial-verify',
    authenticate,
    hasPermission(Permission.REGISTRATION_FINANCE_VERIFY),
    validate(validation.reviewSchema),
    RegistrationController.financialVerify
);

// Step 3: Final Approval
router.patch(
    '/:id/final-approve',
    authenticate,
    hasPermission(Permission.REGISTRATION_APPROVE),
    validate(validation.reviewSchema),
    RegistrationController.finalApprove
);

export default router;
