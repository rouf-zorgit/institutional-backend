import { z } from 'zod';
import { NotificationType, Role } from '@prisma/client';

/**
 * Schema for creating a single notification
 */
export const createNotificationSchema = z.object({
    user_id: z.string().uuid('Invalid user ID'),
    type: z.nativeEnum(NotificationType),
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    message: z.string().min(1, 'Message is required')
});

/**
 * Schema for creating bulk notifications
 */
export const bulkNotificationSchema = z.object({
    target_role: z.nativeEnum(Role).optional(),
    user_ids: z.array(z.string().uuid()).optional(),
    type: z.nativeEnum(NotificationType),
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    message: z.string().min(1, 'Message is required')
}).refine(
    data => data.target_role || (data.user_ids && data.user_ids.length > 0),
    { message: 'Either target_role or user_ids must be provided' }
);

/**
 * Schema for marking notification as read
 */
export const markAsReadSchema = z.object({
    is_read: z.boolean().optional().default(true)
});
