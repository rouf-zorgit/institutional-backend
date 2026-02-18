import { z } from 'zod';
import { CourseStatus } from '@prisma/client';

export const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
});

export const updateCategorySchema = categorySchema.partial();

export const courseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    thumbnail_url: z.string().url('Invalid URL').optional().nullable(),
    regular_price: z.number().positive('Price must be positive'),
    offer_price: z.number().positive('Price must be positive').optional().nullable(),
    duration: z.number().int().positive('Duration must be a positive integer'),
    category_id: z.string().uuid('Invalid category ID'),
    status: z.nativeEnum(CourseStatus).optional(),
});

export const updateCourseSchema = courseSchema.partial();
