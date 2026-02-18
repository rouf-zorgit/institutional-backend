import { z } from 'zod';
import { MaterialType } from '@prisma/client';

export const studyMaterialSchema = z.object({
    body: z.object({
        batch_id: z.string().uuid(),
        title: z.string().min(3).max(255),
        description: z.string().optional(),
        type: z.nativeEnum(MaterialType),
        file_url: z.string().url(),
    }),
});

export const updateStudyMaterialSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(255).optional(),
        description: z.string().optional(),
        type: z.nativeEnum(MaterialType).optional(),
        file_url: z.string().url().optional(),
    }),
});
