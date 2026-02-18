import { z } from 'zod';
import { EnrollmentStatus } from '@prisma/client';

export const createEnrollmentSchema = z.object({
    student_id: z.string().uuid('Invalid student ID'),
    batch_id: z.string().uuid('Invalid batch ID'),
    status: z.nativeEnum(EnrollmentStatus).optional(),
});

export const updateEnrollmentStatusSchema = z.object({
    status: z.nativeEnum(EnrollmentStatus),
});
