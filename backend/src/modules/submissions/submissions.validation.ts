import { z } from 'zod';

export const createSubmissionSchema = z.object({
    assignment_id: z.string().uuid(),
    file_url: z.string().url()
});

export const gradeSubmissionSchema = z.object({
    marks: z.number().min(0),
    feedback: z.string().optional()
});

export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>;
export type GradeSubmissionDto = z.infer<typeof gradeSubmissionSchema>;
