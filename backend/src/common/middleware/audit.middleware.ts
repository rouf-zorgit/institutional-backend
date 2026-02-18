import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../../modules/audit/audit.service';
import { logger } from '../../common/utils/logger.service';

/**
 * Middleware to automatically log actions to audit trail
 * Apply this to routes that need audit logging
 */
export const auditLog = (entity: string, action?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store original res.json to intercept response
        const originalJson = res.json.bind(res);

        // Override res.json to capture response data
        res.json = function (body: any): Response {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300 && (req as any).user) {
                // Determine action from HTTP method if not provided
                const auditAction = action || `${req.method}_${entity}`;

                // Extract entity ID from params or body
                const entityId = req.params.id || body?.data?.id || 'unknown';

                // Capture old and new values for updates
                let oldValue = undefined;
                let newValue = undefined;

                if (req.method === 'PUT' || req.method === 'PATCH') {
                    newValue = req.body;
                } else if (req.method === 'POST') {
                    newValue = body?.data;
                } else if (req.method === 'DELETE') {
                    oldValue = { deleted: true };
                }

                // Log to audit trail asynchronously (don't block response)
                AuditService.logAction({
                    user_id: (req as any).user.id,
                    action: auditAction,
                    entity,
                    entity_id: entityId,
                    old_value: oldValue,
                    new_value: newValue,
                    ip_address: req.ip || req.socket.remoteAddress,
                    user_agent: req.get('user-agent')
                }).catch(error => {
                    logger.error('Failed to create audit log', {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        action: auditAction,
                        entity
                    });
                });
            }

            return originalJson(body);
        };

        next();
    };
};

/**
 * Middleware to log critical actions that should always be audited
 * This is a stricter version that will fail the request if audit logging fails
 */
export const criticalAuditLog = (entity: string, action?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store original res.json to intercept response
        const originalJson = res.json.bind(res);

        // Override res.json to capture response data
    };
};
