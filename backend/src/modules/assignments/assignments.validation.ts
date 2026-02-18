import { z } from 'zod';

export const assignmentSchema = z.object({
    body: z.object({
        batch_id: z.string().uuid(),
        title: z.string().min(3).max(255),
        description: z.string().min(10),
        deadline: z.string().datetime(), // ISO 8601 date string
        total_marks: z.number().int().positive(),
        file_url: z.string().url().optional(),
    }),
});

export const updateAssignmentSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(255).optional(),
        description: z.string().min(10).optional(),
        deadline: z.string().datetime().optional(),
        total_marks: z.number().int().positive().optional(),
        file_url: z.string().url().optional(),
    }),
});

export const submitAssignmentSchema = z.object({
    body: z.object({
        file_url: z.string().url(),
    }),
});

export const gradeAssignmentSchema = z.object({
    body: z.object({
        marks: z.number().int().min(0),
        feedback: z.string().optional(),
    }),
});
