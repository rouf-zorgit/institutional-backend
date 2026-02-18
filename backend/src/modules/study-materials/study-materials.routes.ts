import { Router } from 'express';
import { StudyMaterialsController } from './study-materials.controller';
import { authenticate } from '@/common/middleware/auth.middleware';
import { authorize } from '@/common/middleware/role.middleware';
import { validate } from '@/common/middleware/validation.middleware';
import { asyncHandler } from '@/common/middleware/errorHandler.middleware';
import * as validation from './study-materials.validation';

const router = Router();

router.use(authenticate);

// List (Students can also see, assume they have read permission if enrolled - simplest is allow all authenticated users for now or check enrollment in service)
// For now, allowing all authenticated users to list
router.get(
    '/',
    asyncHandler(StudyMaterialsController.listStudyMaterials)
);

// Get specific
router.get(
    '/:id',
    asyncHandler(StudyMaterialsController.getStudyMaterial)
);

// Create (Teacher, Admin)
router.post(
    '/',
    authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    validate(validation.studyMaterialSchema),
    asyncHandler(StudyMaterialsController.createStudyMaterial)
);

// Update (Teacher, Admin)
router.patch(
    '/:id',
    authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    validate(validation.updateStudyMaterialSchema),
    asyncHandler(StudyMaterialsController.updateStudyMaterial)
);

// Delete (Teacher, Admin)
router.delete(
    '/:id',
    authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    asyncHandler(StudyMaterialsController.deleteStudyMaterial)
);

export default router;
