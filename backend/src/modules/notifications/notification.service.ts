import { prisma } from '@/common/config/database';
import { AppError } from '@/common/middleware/errorHandler.middleware';
import { logger } from '@/common/utils/logger.service';
import { EmailService } from '@/common/utils/email.service';
import { NotificationType, Prisma, Role } from '@prisma/client';

export class NotificationService {
    /**
     * Create a single in-app notification
     */
    static async createNotification(data: {
        user_id: string;
        type: NotificationType;
        title: string;
        message: string;
    }) {
        const notification = await prisma.notification.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        logger.info('Notification created', {
            notificationId: notification.id,
            userId: data.user_id,
            type: data.type
        });

        return notification;
    }

    /**
     * Create bulk notifications for users by role
     */
    static async createBulkNotifications(data: {
        target_role?: Role;
        user_ids?: string[];
        type: NotificationType;
        title: string;
        message: string;
    }) {
        let targetUsers: { id: string }[];

        if (data.user_ids && data.user_ids.length > 0) {
            // Send to specific users
            targetUsers = await prisma.user.findMany({
                where: { id: { in: data.user_ids } },
                select: { id: true }
            });
        } else if (data.target_role) {
            // Send to all users with a specific role
            targetUsers = await prisma.user.findMany({
                where: { role: data.target_role, status: 'ACTIVE' },
                select: { id: true }
            });
        } else {
            throw new AppError(400, 'Either target_role or user_ids must be provided', 'INVALID_TARGET');
        }

        const notifications = await prisma.notification.createMany({
            data: targetUsers.map(user => ({
                user_id: user.id,
                type: data.type,
                title: data.title,
                message: data.message
            }))
        });

        logger.info('Bulk notifications created', {
            count: notifications.count,
            type: data.type,
            targetRole: data.target_role
        });

        return { count: notifications.count };
    }

    /**
     * Get notifications for a user with pagination
     */
    static async getUserNotifications(params: {
        user_id: string;
        page?: number;
        limit?: number;
        is_read?: boolean;
    }) {
        const { user_id, page = 1, limit = 20, is_read } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.NotificationWhereInput = {
            user_id,
            ...(is_read !== undefined && { is_read })
        };

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: { user_id, is_read: false }
            })
        ]);

        return {
            notifications,
            meta: {
                total,
                unreadCount,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get single notification by ID
     */
    static async getNotificationById(id: string, user_id: string) {
        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification) {
            throw new AppError(404, 'Notification not found', 'NOTIFICATION_NOT_FOUND');
        }

        // Ensure user can only access their own notifications
        if (notification.user_id !== user_id) {
            throw new AppError(403, 'Access denied', 'ACCESS_DENIED');
        }

        return notification;
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(id: string, user_id: string) {
        const notification = await this.getNotificationById(id, user_id);

        const updated = await prisma.notification.update({
            where: { id },
            data: { is_read: true }
        });

        logger.info('Notification marked as read', { notificationId: id });
        return updated;
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(user_id: string) {
        const result = await prisma.notification.updateMany({
            where: { user_id, is_read: false },
            data: { is_read: true }
        });

        logger.info('All notifications marked as read', {
            userId: user_id,
            count: result.count
        });

        return { count: result.count };
    }

    /**
     * Delete notification
     */
    static async deleteNotification(id: string, user_id: string) {
        const notification = await this.getNotificationById(id, user_id);

        await prisma.notification.delete({
            where: { id }
        });

        logger.info('Notification deleted', { notificationId: id });
        return { success: true };
    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(user_id: string) {
        const count = await prisma.notification.count({
            where: { user_id, is_read: false }
        });

        return { count };
    }

    /**
     * Send email notification (wrapper for EmailService)
     */
    static async sendEmailNotification(
        email: string,
        userId: string,
        type: 'REGISTRATION_APPROVED' | 'REGISTRATION_REJECTED' | 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED' | 'ASSIGNMENT_DEADLINE' | 'LOW_ATTENDANCE',
        data: any
    ) {
        try {
            switch (type) {
                case 'REGISTRATION_APPROVED':
                    await EmailService.sendRegistrationApproval(
                        email,
                        userId,
                        data.studentName,
                        data.courseName
                    );
                    break;
                case 'REGISTRATION_REJECTED':
                    await EmailService.sendRegistrationRejection(
                        email,
                        userId,
                        data.studentName,
                        data.courseName,
                        data.reason
                    );
                    break;
                case 'PAYMENT_APPROVED':
                    await EmailService.sendPaymentApproval(
                        email,
                        userId,
                        data.studentName,
                        data.amount,
                        data.invoiceUrl
                    );
                    break;
                case 'PAYMENT_REJECTED':
                    await EmailService.sendPaymentRejection(
                        email,
                        userId,
                        data.studentName,
                        data.amount,
                        data.reason
                    );
                    break;
                case 'ASSIGNMENT_DEADLINE':
                    await EmailService.sendAssignmentDeadlineReminder(
                        email,
                        userId,
                        data.studentName,
                        data.assignmentTitle,
                        data.deadline
                    );
                    break;
                case 'LOW_ATTENDANCE':
                    await EmailService.sendLowAttendanceWarning(
                        email,
                        userId,
                        data.studentName,
                        data.attendancePercentage,
                        data.batchName
                    );
                    break;
            }

            logger.info('Email notification sent', { email, type });
        } catch (error) {
            logger.error('Failed to send email notification', {
                email,
                type,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            // Don't throw - email failures shouldn't break the flow
        }
    }
}
