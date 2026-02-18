import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import {
    createNotificationSchema,
    bulkNotificationSchema
} from './notification.validation';

export class NotificationController {
    /**
     * Create a single notification (Admin only)
     */
    static async create(req: Request, res: Response) {
        const validatedData = createNotificationSchema.parse(req.body);
        // Cast to any to avoid strict type mismatch with service, trusting Zod validation
        const notification = await NotificationService.createNotification(validatedData as any);

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        });
    }

    /**
     * Create bulk notifications (Admin only)
     */
    static async createBulk(req: Request, res: Response) {
        const validatedData = bulkNotificationSchema.parse(req.body);

        // Zod ensures user_ids is string[] | undefined, which matches the service signature
        const result = await NotificationService.createBulkNotifications({
            ...validatedData,
            user_ids: (validatedData.user_ids as string[] | undefined)
        } as any);

        res.status(201).json({
            success: true,
            message: `${result.count} notifications created successfully`,
            data: result
        });
    }

    /**
     * Get current user's notifications
     */
    static async list(req: Request, res: Response) {
        const userId = req.user!.id;
        const { page, limit, is_read } = req.query;

        const result = await NotificationService.getUserNotifications({
            user_id: userId,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined
        });

        res.json({
            success: true,
            data: result.notifications,
            meta: result.meta
        });
    }

    /**
     * Get single notification
     */
    static async get(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user!.id;

        const notification = await NotificationService.getNotificationById(id, userId);

        res.json({
            success: true,
            data: notification
        });
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user!.id;

        const notification = await NotificationService.markAsRead(id, userId);

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(req: Request, res: Response) {
        const userId = req.user!.id;

        const result = await NotificationService.markAllAsRead(userId);

        res.json({
            success: true,
            message: 'All notifications marked as read',
            data: result
        });
    }

    /**
     * Delete notification
     */
    static async delete(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user!.id;

        await NotificationService.deleteNotification(id, userId);

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(req: Request, res: Response) {
        const userId = req.user!.id;

        const result = await NotificationService.getUnreadCount(userId);

        res.json({
            success: true,
            data: result
        });
    }
}
