import { Router } from 'express';
import { AssignmentsController } from './assignments.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/role.middleware'; // Assuming this middleware exists from snippets
import { validate } from '../../common/middleware/validation.middleware';
import { asyncHandler } from '../../common/middleware/errorHandler.middleware';
import * as validation from './assignments.validation';

const router = Router();

router.use(authenticate);

// Create assignment (Teacher, Admin)
router.post(
    '/',
    authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    validate(validation.assignmentSchema),
    asyncHandler(AssignmentsController.createAssignment)
);

// List assignments
router.get(
    '/',
    asyncHandler(AssignmentsController.listAssignments)
);

// Get specific assignment
router.get(
    '/:id',
    asyncHandler(AssignmentsController.getAssignment)
);

// Update assignment
router.patch(
    '/:id',
    authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    validate(validation.updateAssignmentSchema),
    asyncHandler(AssignmentsController.updateAssignment)
);

// Delete assignment
router.delete(
    '/:id',
    authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    asyncHandler(AssignmentsController.deleteAssignment)
);

// Submit assignment (Student)
router.post(
    '/:id/submit',
    authorize('STUDENT'),
    validate(validation.submitAssignmentSchema),
    asyncHandler(AssignmentsController.submitAssignment)
);

// Grade submission (Teacher, Admin)
// Note: Route param is submissionId, not assignmentId for this specific action
router.post(
    '/submissions/:submissionId/grade',
    authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
    validate(validation.gradeAssignmentSchema),
    asyncHandler(AssignmentsController.gradeSubmission)
);

export default router;
