import { Router } from 'express';
import { BatchController } from './batch.controller';
import { validate } from '../../common/middleware/validation.middleware';
import { authenticate } from '../../common/middleware/auth.middleware';
import { hasPermission } from '../../common/middleware/rbac.middleware';
import { Permission } from '../../common/types/permissions';
import * as validation from './batch.validation';

const router = Router();

// List batches
router.get(
    '/',
    authenticate,
    hasPermission(Permission.BATCH_LIST),
    BatchController.listBatches
);

// Get batch by ID
router.get(
    '/:id',
    authenticate,
    hasPermission(Permission.BATCH_READ),
    BatchController.getBatch
);

// Create batch
router.post(
    '/',
    authenticate,
    hasPermission(Permission.BATCH_CREATE),
    validate(validation.batchSchema),
    BatchController.createBatch
);

// Update batch
router.patch(
    '/:id',
    authenticate,
    hasPermission(Permission.BATCH_UPDATE),
    validate(validation.updateBatchSchema),
    BatchController.updateBatch
);

// Delete batch
router.delete(
    '/:id',
    authenticate,
    hasPermission(Permission.BATCH_DELETE),
    BatchController.deleteBatch
);

export default router;
