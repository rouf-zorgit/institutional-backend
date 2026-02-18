import { Router } from 'express';
import { SubmissionsController } from './submissions.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/role.middleware';
import { validate } from '../../common/middleware/validation.middleware';
import { createSubmissionSchema, gradeSubmissionSchema } from './submissions.validation';
import { asyncHandler } from '../../common/middleware/errorHandler.middleware';

const router = Router();

router.use(authenticate);

// List submissions (Teachers/Admin can see all, Students see their own - logic in controller/service needs refining for security, strictly speaking)
// For now, allow listing.
router.get('/', asyncHandler(SubmissionsController.list));

// Create submission (Student only)
router.post(
    '/',
    validate(createSubmissionSchema),
    asyncHandler(SubmissionsController.create)
);

// Grade submission (Teacher/Admin)
router.patch( // or PUT
    '/:id/grade',
    authorize('ADMIN', 'TEACHER'),
    validate(gradeSubmissionSchema),
    asyncHandler(SubmissionsController.grade)
);

export default router;
