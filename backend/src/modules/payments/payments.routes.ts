import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { validate } from '@/common/middleware/validation.middleware';
import { authenticate } from '@/common/middleware/auth.middleware';
import { hasPermission } from '@/common/middleware/rbac.middleware';
import { Permission } from '@/common/types/permissions';
import { uploadSingle, handleMulterError } from '@/common/middleware/file-upload.middleware';
import {
    approvePaymentSchema,
    rejectPaymentSchema,
    getPaymentSchema,
    getPendingPaymentsSchema,
    uploadPaymentSchema,
    listPaymentsSchema,
    getMyPaymentsSchema,
    downloadInvoiceSchema
} from './payments.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload payment - students only
router.post(
    '/',
    uploadSingle('screenshot'),
    handleMulterError,
    validate(uploadPaymentSchema),
    PaymentsController.uploadPayment
);

// Get my payments - students
router.get(
    '/my-payments',
    validate(getMyPaymentsSchema),
    PaymentsController.getMyPayments
);


// Get pending payments - must be before /:id routes
router.get(
    '/pending',
    hasPermission(Permission.PAYMENT_LIST),
    validate(getPendingPaymentsSchema),
    PaymentsController.getPendingPayments
);

// List all payments with filters - admin/finance
router.get(
    '/',
    hasPermission(Permission.PAYMENT_LIST),
    validate(listPaymentsSchema),
    PaymentsController.listPayments
);

// Approve payment - admin only
router.post(
    '/:id/approve',
    hasPermission(Permission.PAYMENT_APPROVE),
    validate(approvePaymentSchema),
    PaymentsController.approvePayment
);

// Reject payment - admin only
router.post(
    '/:id/reject',
    hasPermission(Permission.PAYMENT_REJECT),
    validate(rejectPaymentSchema),
    PaymentsController.rejectPayment
);


// Get payment details
router.get(
    '/:id',
    hasPermission(Permission.PAYMENT_READ),
    validate(getPaymentSchema),
    PaymentsController.getPayment
);

// Download invoice
router.get(
    '/:id/invoice',
    validate(downloadInvoiceSchema),
    PaymentsController.downloadInvoice
);

export default router;
