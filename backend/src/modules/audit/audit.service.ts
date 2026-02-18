import { prisma } from '@/common/config/database';
import { AppError } from '@/common/middleware/errorHandler.middleware';
import { logger } from '@/common/utils/logger.service';
import { ExportService } from '@/common/utils/export.service';
import { Prisma } from '@prisma/client';

export class AuditService {
    /**
     * Log an action to the audit trail
     */
    static async logAction(data: {
        user_id: string;
        action: string;
        entity: string;
        entity_id: string;
        old_value?: any;
        new_value?: any;
        ip_address?: string;
        user_agent?: string;
    }) {
        const auditLog = await prisma.auditLog.create({
            data: {
                user_id: data.user_id,
                action: data.action,
                entity: data.entity,
                entity_id: data.entity_id,
                old_value: data.old_value || null,
                new_value: data.new_value || null,
                ip_address: data.ip_address || null,
                user_agent: data.user_agent || null
            }
        });

        logger.info('Audit log created', {
            auditLogId: auditLog.id,
            action: data.action,
            entity: data.entity
        });

        return auditLog;
    }

    /**
     * Get audit logs with filters and pagination
     */
    static async getAuditLogs(params: {
        page?: number;
        limit?: number;
        user_id?: string;
        entity?: string;
        action?: string;
        start_date?: Date;
        end_date?: Date;
    }) {
        const { page = 1, limit = 50, user_id, entity, action, start_date, end_date } = params;
        const skip = (page - 1) * limit;

        const where = {
            ...(user_id && { user_id }),
            ...(entity && { entity }),
            ...(action && { action }),
            ...(start_date || end_date ? {
                created_at: {
                    ...(start_date && { gte: start_date }),
                    ...(end_date && { lte: end_date })
                }
            } : {})
        };

        const [auditLogs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            profile: {
                                select: { name: true }
                            }
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.auditLog.count({ where })
        ]);

        return {
            auditLogs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get audit history for a specific entity
     */
    static async getEntityHistory(entity: string, entity_id: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [auditLogs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where: { entity, entity_id },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            profile: {
                                select: { name: true }
                            }
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.auditLog.count({ where: { entity, entity_id } })
        ]);

        return {
            auditLogs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get all activity by a specific user
     */
    static async getUserActivity(user_id: string, page = 1, limit = 50) {
        const skip = (page - 1) * limit;

        const [auditLogs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where: { user_id },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.auditLog.count({ where: { user_id } })
        ]);

        return {
            auditLogs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Export audit logs to CSV
     */
    static async exportAuditLogs(params: {
        user_id?: string;
        entity?: string;
        action?: string;
        start_date?: Date;
        end_date?: Date;
    }): Promise<string> {
        const { user_id, entity, action, start_date, end_date } = params;

        const where = {
            ...(user_id && { user_id }),
            ...(entity && { entity }),
            ...(action && { action }),
            ...(start_date || end_date ? {
                created_at: {
                    ...(start_date && { gte: start_date }),
                    ...(end_date && { lte: end_date })
                }
            } : {})
        };

        const auditLogs = await prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        profile: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Format data for export
        const formattedData = auditLogs.map((log: any) => ({
            'Timestamp': log.created_at.toISOString(),
            'User': log.user.profile?.name || log.user.email,
            'Role': log.user.role,
            'Action': log.action,
            'Entity': log.entity,
            'Entity ID': log.entity_id,
            'IP Address': log.ip_address || '-',
            'User Agent': log.user_agent || '-'
        }));

        return ExportService.generateCSV(formattedData);
    }

    /**
     * Get audit statistics
     */
    static async getAuditStats(params: {
        start_date?: Date;
        end_date?: Date;
    }) {
        const where = {
            ...(params.start_date || params.end_date ? {
                created_at: {
                    ...(params.start_date && { gte: params.start_date }),
                    ...(params.end_date && { lte: params.end_date })
                }
            } : {})
        };

        const [totalActions, actionsByEntity, actionsByUser] = await Promise.all([
            prisma.auditLog.count({ where }),
            prisma.auditLog.groupBy({
                by: ['entity'],
                where: where as any, // Cast to any because groupBy where clause sometimes differs slightly in strict type configurations
                _count: { entity: true }
            }),
            prisma.auditLog.groupBy({
                by: ['user_id'],
                where: where as any,
                _count: { user_id: true },
                orderBy: { _count: { user_id: 'desc' } },
                take: 10
            })
        ]);

        return {
            totalActions,
            actionsByEntity: actionsByEntity.map((item: any) => ({
                entity: item.entity,
                count: item._count.entity
            })),
            topUsers: actionsByUser.map((item: any) => ({
                userId: item.user_id,
                count: item._count.user_id
            }))
        };
    }
}
