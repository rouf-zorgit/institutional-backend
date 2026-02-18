import { Router } from 'express';
import { CoursesController } from './courses.controller';
import { validate } from '@/common/middleware/validation.middleware';
import { authenticate } from '@/common/middleware/auth.middleware';
import { hasPermission } from '@/common/middleware/rbac.middleware';
import { Permission } from '@/common/types/permissions';
import * as validation from './courses.validation';

const router = Router();

// ============================================================================
// CATEGORY ROUTES
// ============================================================================

// List categories (Publicly accessible but requires Auth for now as per project pattern)
router.get(
    '/categories',
    authenticate,
    hasPermission(Permission.CATEGORY_LIST),
    CoursesController.listCategories
);

// Create category
router.post(
    '/categories',
    authenticate,
    hasPermission(Permission.CATEGORY_CREATE),
    validate(validation.categorySchema),
    CoursesController.createCategory
);

// Update category
router.patch(
    '/categories/:id',
    authenticate,
    hasPermission(Permission.CATEGORY_UPDATE),
    validate(validation.updateCategorySchema),
    CoursesController.updateCategory
);

// Delete category
router.delete(
    '/categories/:id',
    authenticate,
    hasPermission(Permission.CATEGORY_DELETE),
    CoursesController.deleteCategory
);

// ============================================================================
// COURSE ROUTES
// ============================================================================

// List courses
router.get(
    '/',
    authenticate,
    hasPermission(Permission.COURSE_LIST),
    CoursesController.listCourses
);

// Get course by ID
router.get(
    '/:id',
    authenticate,
    hasPermission(Permission.COURSE_READ),
    CoursesController.getCourse
);

// Create course
router.post(
    '/',
    authenticate,
    hasPermission(Permission.COURSE_CREATE),
    validate(validation.courseSchema),
    CoursesController.createCourse
);

// Update course
router.patch(
    '/:id',
    authenticate,
    hasPermission(Permission.COURSE_UPDATE),
    validate(validation.updateCourseSchema),
    CoursesController.updateCourse
);

// Delete course
router.delete(
    '/:id',
    authenticate,
    hasPermission(Permission.COURSE_DELETE),
    CoursesController.deleteCourse
);

export default router;
