import { z } from 'zod';

/**
 * Schema for date range queries
 */
export const dateRangeSchema = z.object({
    start_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
    end_date: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

/**
 * Schema for enrollment trends
 */
export const enrollmentTrendsSchema = z.object({
    start_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
    end_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
    interval: z.enum(['day', 'week', 'month']).optional()
});

/**
 * Schema for export queries
 */
export const exportEnrollmentsSchema = z.object({
    batch_id: z.string().uuid().optional(),
    student_id: z.string().uuid().optional(),
    status: z.string().optional()
});

export const exportPaymentsSchema = z.object({
    student_id: z.string().uuid().optional(),
    status: z.string().optional(),
    start_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
    end_date: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

export const exportAttendanceSchema = z.object({
    batch_id: z.string().uuid().optional(),
    student_id: z.string().uuid().optional(),
    start_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
    end_date: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

/**
 * Schema for attendance stats
 */
export const attendanceStatsSchema = z.object({
    batch_id: z.string().uuid().optional(),
    student_id: z.string().uuid().optional(),
    start_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
    end_date: z.string().optional().transform(val => val ? new Date(val) : undefined)
});
