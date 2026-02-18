import { z } from 'zod';

/**
 * Schema for querying audit logs
 */
export const auditQuerySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    user_id: z.string().uuid().optional(),
    entity: z.string().optional(),
    action: z.string().optional(),
    start_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
    end_date: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

/**
 * Schema for entity history queries
 */
export const entityHistorySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});

/**
 * Schema for user activity queries
 */
export const userActivitySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});

/**
 * Schema for audit stats queries
 */
export const auditStatsSchema = z.object({
    start_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
    end_date: z.string().optional().transform(val => val ? new Date(val) : undefined)
});
