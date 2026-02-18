import { z } from 'zod';

export const approvePaymentSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid payment ID'),
    }),
});

export const rejectPaymentSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid payment ID'),
    }),
    body: z.object({
        reason: z.string().min(10, 'Reason must be at least 10 characters'),
    }),
});

export const getPaymentSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid payment ID'),
    }),
});

export const getPendingPaymentsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        pageSize: z.string().regex(/^\d+$/).optional(),
    }),
});

export const uploadPaymentSchema = z.object({
    body: z.object({
        enrollment_id: z.string().uuid('Invalid enrollment ID'),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
        transaction_id: z.string().min(1, 'Transaction ID is required'),
        phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
        payment_method: z.string().min(1, 'Payment method is required'),
        notes: z.string().optional(),
    }),
});

export const listPaymentsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        pageSize: z.string().regex(/^\d+$/).optional(),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PARTIAL']).optional(),
        student_id: z.string().uuid().optional(),
        enrollment_id: z.string().uuid().optional(),
        date_from: z.string().datetime().optional(),
        date_to: z.string().datetime().optional(),
    }),
});

export const getMyPaymentsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        pageSize: z.string().regex(/^\d+$/).optional(),
    }),
});

export const downloadInvoiceSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid payment ID'),
    }),
});
