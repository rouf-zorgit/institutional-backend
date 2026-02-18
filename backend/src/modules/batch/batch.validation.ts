import { z } from 'zod';
import { BatchStatus } from '@prisma/client';

export const batchSchema = z.object({
    course_id: z.string().uuid('Invalid course ID'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    start_date: z.string().datetime('Invalid start date'),
    end_date: z.string().datetime('Invalid end date'),
    class_days: z.array(z.string()).min(1, 'At least one class day must be specified'),
    class_time: z.string().min(1, 'Class time is required'),
    teacher_id: z.string().uuid('Invalid teacher ID'),
    status: z.nativeEnum(BatchStatus).optional(),
});

export const updateBatchSchema = batchSchema.partial().extend({
    course_id: z.string().uuid('Invalid course ID').optional(),
    teacher_id: z.string().uuid('Invalid teacher ID').optional(),
});
