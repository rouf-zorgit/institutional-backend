import { prisma } from '../../common/config/database';
import { AppError } from '../../common/middleware/errorHandler.middleware';
import { logger } from '../../common/utils/logger.service';
import { BatchStatus, Prisma } from '@prisma/client';

export class BatchService {
    static async createBatch(data: any, userId: string) {
        // Check if course exists
        const course = await prisma.course.findFirst({
            where: { id: data.course_id, deleted_at: null }
        });
        if (!course) {
            throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
        }

        // Check if teacher exists
        const teacher = await prisma.user.findFirst({
            where: { id: data.teacher_id, deleted_at: null, role: 'TEACHER' }
        });
        if (!teacher) {
            throw new AppError(404, 'Teacher not found', 'TEACHER_NOT_FOUND');
        }

        const batch = await prisma.batch.create({
            data: {
                ...data,
                created_by: userId,
                start_date: new Date(data.start_date),
                end_date: new Date(data.end_date),
            },
            include: {
                course: true,
                teacher: {
                    include: {
                        profile: true
                    }
                }
            }
        });

        logger.info('Batch created', { batchId: batch.id, name: batch.name });
        return batch;
    }

    static async findAllBatches(params: {
        page?: number;
        limit?: number;
        course_id?: string;
        teacher_id?: string;
        status?: BatchStatus;
        search?: string;
    }) {
        const { page = 1, limit = 10, course_id, teacher_id, status, search } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.BatchWhereInput = {
            deleted_at: null,
            ...(course_id && { course_id }),
            ...(teacher_id && { teacher_id }),
            ...(status && { status }),
            ...(search && {
                name: { contains: search, mode: 'insensitive' }
            }),
        };

        const [batches, total] = await Promise.all([
            prisma.batch.findMany({
                where,
                skip,
                take: limit,
                include: {
                    course: true,
                    teacher: {
                        include: {
                            profile: true
                        }
                    },
                    _count: {
                        select: { enrollments: true }
                    }
                },
                orderBy: { created_at: 'desc' },
            }),
            prisma.batch.count({ where }),
        ]);

        return {
            batches,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async findBatchById(id: string) {
        const batch = await prisma.batch.findFirst({
            where: { id, deleted_at: null },
            include: {
                course: true,
                teacher: {
                    include: {
                        profile: true
                    }
                },
                enrollments: {
                    include: {
                        student: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            }
        });

        if (!batch) {
            throw new AppError(404, 'Batch not found', 'BATCH_NOT_FOUND');
        }

        return batch;
    }

    static async updateBatch(id: string, data: any, userId: string) {
        const existingBatch = await prisma.batch.findFirst({
            where: { id, deleted_at: null }
        });

        if (!existingBatch) {
            throw new AppError(404, 'Batch not found', 'BATCH_NOT_FOUND');
        }

        if (data.course_id) {
            const course = await prisma.course.findFirst({
                where: { id: data.course_id, deleted_at: null }
            });
            if (!course) {
                throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
            }
        }

        if (data.teacher_id) {
            const teacher = await prisma.user.findFirst({
                where: { id: data.teacher_id, deleted_at: null, role: 'TEACHER' }
            });
            if (!teacher) {
                throw new AppError(404, 'Teacher not found', 'TEACHER_NOT_FOUND');
            }
        }

        const updateData = {
            ...data,
            updated_by: userId,
            ...(data.start_date && { start_date: new Date(data.start_date) }),
            ...(data.end_date && { end_date: new Date(data.end_date) }),
        };

        const batch = await prisma.batch.update({
            where: { id },
            data: updateData,
            include: {
                course: true,
                teacher: {
                    include: {
                        profile: true
                    }
                }
            }
        });

        logger.info('Batch updated', { batchId: id, userId });
        return batch;
    }

    static async deleteBatch(id: string, userId: string) {
        const batch = await prisma.batch.findFirst({
            where: { id, deleted_at: null }
        });

        if (!batch) {
            throw new AppError(404, 'Batch not found', 'BATCH_NOT_FOUND');
        }

        // Check if there are enrollments before deleting? 
        // For now, simple soft delete.
        await prisma.batch.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                updated_by: userId
            }
        });

        logger.info('Batch soft deleted', { batchId: id, userId });
        return { success: true };
    }
}
