import { prisma } from '../../common/config/database';
import { AppError } from '../../common/middleware/errorHandler.middleware';
import { logger } from '../../common/utils/logger.service';
import { CourseStatus, Prisma } from '@prisma/client';

/**
 * Generate a slug from a string
 */
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')   // Remove all non-word chars
        .replace(/--+/g, '-');      // Replace multiple - with single -
};

export class CoursesService {
    // ============================================================================
    // CATEGORY OPERATIONS
    // ============================================================================

    static async createCategory(data: { name: string; description?: string }) {
        const slug = slugify(data.name);

        const existing = await prisma.category.findUnique({
            where: { slug }
        });

        if (existing) {
            throw new AppError(400, 'Category with this name already exists', 'CATEGORY_EXISTS');
        }

        const category = await prisma.category.create({
            data: {
                ...data,
                slug
            }
        });

        logger.info('Category created', { categoryId: category.id, name: category.name });
        return category;
    }

    static async findAllCategories() {
        return prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { courses: true }
                }
            }
        });
    }

    static async updateCategory(id: string, data: { name?: string; description?: string }) {
        const updateData: any = { ...data };

        if (data.name) {
            updateData.slug = slugify(data.name);
            const existing = await prisma.category.findFirst({
                where: {
                    slug: updateData.slug,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new AppError(400, 'Another category with this name already exists', 'CATEGORY_EXISTS');
            }
        }

        const category = await prisma.category.update({
            where: { id },
            data: updateData
        });

        logger.info('Category updated', { categoryId: id });
        return category;
    }

    static async deleteCategory(id: string) {
        const courseCount = await prisma.course.count({
            where: { category_id: id, deleted_at: null }
        });

        if (courseCount > 0) {
            throw new AppError(400, 'Cannot delete category with associated courses', 'CATEGORY_HAS_COURSES');
        }

        await prisma.category.delete({ where: { id } });
        logger.info('Category deleted', { categoryId: id });
        return { success: true };
    }

    // ============================================================================
    // COURSE OPERATIONS
    // ============================================================================

    static async createCourse(data: any, userId: string) {
        const slug = slugify(data.title);

        const existing = await prisma.course.findUnique({
            where: { slug }
        });

        if (existing) {
            throw new AppError(400, 'Course with this title already exists', 'COURSE_EXISTS');
        }

        const course = await prisma.course.create({
            data: {
                ...data,
                slug,
                created_by: userId
            },
            include: { category: true }
        });

        logger.info('Course created', { courseId: course.id, title: course.title });
        return course;
    }

    static async findAllCourses(params: {
        page?: number;
        limit?: number;
        category_id?: string;
        status?: CourseStatus;
        search?: string;
    }) {
        const { page = 1, limit = 10, category_id, status, search } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.CourseWhereInput = {
            deleted_at: null,
            ...(category_id && { category_id }),
            ...(status && { status }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                skip,
                take: limit,
                include: { category: true },
                orderBy: { created_at: 'desc' },
            }),
            prisma.course.count({ where }),
        ]);

        return {
            courses,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async findCourseById(id: string) {
        const course = await prisma.course.findFirst({
            where: { id, deleted_at: null },
            include: { category: true }
        });

        if (!course) {
            throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
        }

        return course;
    }

    static async updateCourse(id: string, data: any, userId: string) {
        const updateData: any = {
            ...data,
            updated_by: userId
        };

        if (data.title) {
            updateData.slug = slugify(data.title);
            const existing = await prisma.course.findFirst({
                where: {
                    slug: updateData.slug,
                    id: { not: id }
                }
            });
            if (existing) {
                throw new AppError(400, 'Another course with this title already exists', 'COURSE_EXISTS');
            }
        }

        const course = await prisma.course.update({
            where: { id },
            data: updateData,
            include: { category: true }
        });

        logger.info('Course updated', { courseId: id, userId });
        return course;
    }

    static async deleteCourse(id: string, userId: string) {
        await prisma.course.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                updated_by: userId
            }
        });

        logger.info('Course soft deleted', { courseId: id, userId });
        return { success: true };
    }
}
