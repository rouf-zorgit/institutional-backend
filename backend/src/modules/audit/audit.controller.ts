import { Request, Response } from 'express';
import { AuditService } from './audit.service';
import {
    auditQuerySchema,
    entityHistorySchema,
    userActivitySchema,
    auditStatsSchema
} from './audit.validation';

export class AuditController {
    /**
     * Get audit logs with filters
     */
    static async list(req: Request, res: Response) {
        const validatedQuery = auditQuerySchema.parse(req.query);

        const result = await AuditService.getAuditLogs(validatedQuery);

        res.json({
            success: true,
            data: result.auditLogs,
            meta: result.meta
        });
    }

    /**
     * Get audit history for a specific entity
     */
    static async getEntityHistory(req: Request, res: Response) {
        const { entity, id } = req.params;
        const validatedQuery = entityHistorySchema.parse(req.query);

        const result = await AuditService.getEntityHistory(
            entity,
            id,
            validatedQuery.page,
            validatedQuery.limit
        );

        res.json({
            success: true,
            data: result.auditLogs,
            meta: result.meta
        });
    }

    /**
     * Get user activity
     */
    static async getUserActivity(req: Request, res: Response) {
        const { userId } = req.params;
        const validatedQuery = userActivitySchema.parse(req.query);

        const result = await AuditService.getUserActivity(
            userId,
            validatedQuery.page,
            validatedQuery.limit
        );

        res.json({
            success: true,
            data: result.auditLogs,
            meta: result.meta
        });
    }

    /**
     * Export audit logs to CSV
     */
    static async exportLogs(req: Request, res: Response) {
        const validatedQuery = auditQuerySchema.parse(req.query);

        const csv = await AuditService.exportAuditLogs(validatedQuery);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
        res.send(csv);
    }

    /**
     * Get audit statistics
     */
    static async getStats(req: Request, res: Response) {
        const validatedQuery = auditStatsSchema.parse(req.query);

        const stats = await AuditService.getAuditStats(validatedQuery);

        res.json({
            success: true,
            data: stats
        });
    }
}
