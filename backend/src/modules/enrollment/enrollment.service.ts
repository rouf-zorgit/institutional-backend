import { prisma } from '@/common/config/database';
import { AppError } from '@/common/middleware/errorHandler.middleware';
import { logger } from '@/common/utils/logger.service';
import { EnrollmentStatus, Prisma } from '@prisma/client';

export class EnrollmentService {
    /**
     * Create a new enrollment manually
     */
    static async createEnrollment(data: { student_id: string; batch_id: string; status?: EnrollmentStatus }) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Check if batch exists and is active/upcoming
            const batch = await tx.batch.findUnique({
                where: { id: data.batch_id, deleted_at: null },
                include: {
                    _count: {
                        select: { enrollments: true }
                    }
                }
            });

            if (!batch) {
                throw new AppError(404, 'Batch not found', 'BATCH_NOT_FOUND');
            }

            // 2. Check capacity
            if (batch._count.enrollments >= batch.capacity) {
                throw new AppError(400, 'Batch is already full', 'BATCH_FULL');
            }

            // 3. Check if student already enrolled in this batch
            const existingEnrollment = await tx.enrollment.findUnique({
                where: {
                    student_id_batch_id: {
                        student_id: data.student_id,
                        batch_id: data.batch_id
                    }
                }
            });

            if (existingEnrollment) {
                throw new AppError(400, 'Student is already enrolled in this batch', 'ALREADY_ENROLLED');
            }

            // 4. Create enrollment
            const enrollment = await tx.enrollment.create({
                data: {
                    student_id: data.student_id,
                    batch_id: data.batch_id,
                    status: data.status || 'ACTIVE',
                    enrolled_at: new Date(),
                    payment_status: 'PENDING' // Manual enrollment starts as pending payment usually
                },
                include: {
                    student: {
                        include: { profile: true }
                    },
                    batch: true
                }
            });

            logger.info('Student manually enrolled in batch', {
                enrollmentId: enrollment.id,
                studentId: data.student_id,
                batchId: data.batch_id
            });

            return enrollment;
        });
    }

    /**
     * Find all enrollments with filters
     */
    static async findAllEnrollments(params: {
        page?: number;
        limit?: number;
        batch_id?: string;
        student_id?: string;
        status?: EnrollmentStatus;
    }) {
        const { page = 1, limit = 10, batch_id, student_id, status } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.EnrollmentWhereInput = {
            ...(batch_id && { batch_id }),
            ...(student_id && { student_id }),
            ...(status && { status }),
        };

        const [enrollments, total] = await Promise.all([
            prisma.enrollment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    student: {
                        include: { profile: true }
                    },
                    batch: {
                        include: { course: true }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.enrollment.count({ where })
        ]);

        return {
            enrollments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Find enrollment by ID
     */
    static async findEnrollmentById(id: string) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id },
            include: {
                student: {
                    include: { profile: true }
                },
                batch: {
                    include: { course: true }
                }
            }
        });

        if (!enrollment) {
            throw new AppError(404, 'Enrollment not found', 'ENROLLMENT_NOT_FOUND');
        }

        return enrollment;
    }

    /**
     * Update enrollment status
     */
    static async updateEnrollmentStatus(id: string, status: EnrollmentStatus) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id }
        });

        if (!enrollment) {
            throw new AppError(404, 'Enrollment not found', 'ENROLLMENT_NOT_FOUND');
        }

        const updatedEnrollment = await prisma.enrollment.update({
            where: { id },
            data: { status },
            include: {
                student: {
                    include: { profile: true }
                },
                batch: true
            }
        });

        logger.info('Enrollment status updated', { enrollmentId: id, status });
        return updatedEnrollment;
    }

    /**
     * Delete enrollment
     */
    static async deleteEnrollment(id: string) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id }
        });

        if (!enrollment) {
            throw new AppError(404, 'Enrollment not found', 'ENROLLMENT_NOT_FOUND');
        }

        // We might want to check for payments before hard deleting
        // For now, let's just delete it
        await prisma.enrollment.delete({
            where: { id }
        });

        logger.info('Enrollment deleted', { enrollmentId: id });
        return { success: true };
    }
}
