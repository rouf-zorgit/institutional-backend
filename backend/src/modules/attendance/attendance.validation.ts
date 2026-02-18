import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const markAttendanceSchema = z.object({
    batch_id: z.string().uuid('Invalid batch ID'),
    student_id: z.string().uuid('Invalid student ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    status: z.nativeEnum(AttendanceStatus),
    notes: z.string().optional(),
});

export const bulkMarkAttendanceSchema = z.object({
    batch_id: z.string().uuid('Invalid batch ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    status: z.nativeEnum(AttendanceStatus),
    student_ids: z.array(z.string().uuid()).optional(), // If empty, mark all enrolled students
    notes: z.string().optional(),
});

export const updateAttendanceSchema = z.object({
    status: z.nativeEnum(AttendanceStatus),
    notes: z.string().optional(),
});

export const attendanceReportQuerySchema = z.object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    batch_id: z.string().uuid().optional(),
    student_id: z.string().uuid().optional(),
});
