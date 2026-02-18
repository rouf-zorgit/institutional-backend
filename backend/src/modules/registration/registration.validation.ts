import { z } from 'zod';

export const registrationSchema = z.object({
    course_id: z.string().uuid(),
    batch_preference: z.string().optional(),
    documents: z.any(), // In a real app, this would be more specific
});

export const reviewSchema = z.object({
    status: z.enum(['ACADEMIC_REVIEWED', 'FINANCIAL_VERIFIED', 'APPROVED', 'REJECTED']),
    admin_notes: z.string().optional(),
});
