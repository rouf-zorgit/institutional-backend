import { Router } from 'express';
import multer from 'multer';
import { UploadController } from './upload.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { asyncHandler } from '../../common/middleware/errorHandler.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post(
    '/',
    upload.single('file'),
    asyncHandler(UploadController.uploadFile)
);

export default router;
