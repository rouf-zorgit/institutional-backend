import { z } from 'zod';

export const assignmentFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    batch_id: z.string().min(1, 'Please select a batch'),
    deadline: z.string().min(1, 'Please select a deadline'),
    total_marks: z.coerce.number().min(1, 'Total marks must be at least 1'),
    file_url: z.string().url().optional().or(z.literal('')),
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
