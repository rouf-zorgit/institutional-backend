import { prisma } from '@/common/config/database';
import { AppError } from '@/common/middleware/errorHandler.middleware';
import { RegistrationStatus, EnrollmentStatus } from '@prisma/client';
import { logger } from '@/common/utils/logger.service';

export class RegistrationService {
    /**
     * Submit a new registration (Step 0)
     */
    static async submitRegistration(userId: string, data: any) {
        const registration = await prisma.studentRegistration.create({
            data: {
                student_id: userId,
                course_id: data.course_id,
                batch_preference: data.batch_preference,
                documents: data.documents,
                status: 'PENDING',
            },
        });
        logger.info('New registration submitted', { userId, registrationId: registration.id });
        return registration;
    }

    /**
     * Step 1: Academic Review
     * Performed by STAFF or ADMIN
     */
    static async academicReview(registrationId: string, adminId: string, status: RegistrationStatus, notes?: string) {
        if (status !== RegistrationStatus.ACADEMIC_REVIEWED && status !== RegistrationStatus.REJECTED) {
            throw new AppError(400, 'Invalid status for academic review', 'INVALID_STATUS');
        }

        const registration = await prisma.studentRegistration.update({
            where: { id: registrationId },
            data: {
                status,
                academic_reviewed_by: adminId,
                academic_reviewed_at: new Date(),
                admin_notes: notes,
            },
        });
        logger.info('Academic review completed', { registrationId, status, adminId });
        return registration;
    }

    /**
     * Step 2: Financial Verification
     * Performed by FINANCE or ADMIN
     */
    static async financialVerify(registrationId: string, adminId: string, status: RegistrationStatus, notes?: string) {
        const registration = await prisma.studentRegistration.findUnique({
            where: { id: registrationId },
        });

        if (!registration) {
            throw new AppError(404, 'Registration not found', 'REGISTRATION_NOT_FOUND');
        }

        if (registration.status !== RegistrationStatus.ACADEMIC_REVIEWED) {
            throw new AppError(400, 'Registration must be academic reviewed first', 'INVALID_SEQUENCE');
        }

        if (status !== RegistrationStatus.FINANCIAL_VERIFIED && status !== RegistrationStatus.REJECTED) {
            throw new AppError(400, 'Invalid status for financial verification', 'INVALID_STATUS');
        }

        const updatedReg = await prisma.studentRegistration.update({
            where: { id: registrationId },
            data: {
                status,
                financial_verified_by: adminId,
                financial_verified_at: new Date(),
                admin_notes: notes,
            },
        });
        logger.info('Financial verification completed', { registrationId, status, adminId });
        return updatedReg;
    }

    /**
     * Step 3: Final Approval
     * Performed by ADMIN
     */
    static async finalApprove(registrationId: string, adminId: string, status: RegistrationStatus, notes?: string) {
        const registration = await prisma.studentRegistration.findUnique({
            where: { id: registrationId },
        });

        if (!registration) {
            throw new AppError(404, 'Registration not found', 'REGISTRATION_NOT_FOUND');
        }

        if (registration.status !== RegistrationStatus.FINANCIAL_VERIFIED) {
            throw new AppError(400, 'Registration must be financial verified first', 'INVALID_SEQUENCE');
        }

        if (status !== RegistrationStatus.APPROVED && status !== RegistrationStatus.REJECTED) {
            throw new AppError(400, 'Invalid status for final approval', 'INVALID_STATUS');
        }

        if (status === 'APPROVED') {
            return prisma.$transaction(async (tx) => {
                const updatedReg = await tx.studentRegistration.update({
                    where: { id: registrationId },
                    data: {
                        status: 'APPROVED',
                        approved_by: adminId,
                        approved_at: new Date(),
                        admin_notes: notes,
                    },
                });

                // Determine batch
                let batchId = registration.batch_preference;
                // Check if batch_preference is a valid batch ID for the course
                if (batchId) {
                    const validBatch = await tx.batch.findFirst({
                        where: { id: batchId, course_id: registration.course_id }
                    });
                    if (!validBatch) batchId = null;
                }

                if (!batchId) {
                    const batch = await tx.batch.findFirst({
                        where: { course_id: registration.course_id, status: 'UPCOMING' },
                        orderBy: { start_date: 'asc' }
                    });
                    batchId = batch?.id || null;
                }

                if (!batchId) {
                    throw new AppError(400, 'No valid batch found for this course. Please assign one manually.', 'BATCH_NOT_FOUND');
                }

                await tx.enrollment.create({
                    data: {
                        student_id: registration.student_id,
                        batch_id: batchId,
                        status: 'ACTIVE',
                        enrolled_at: new Date(),
                        payment_status: 'APPROVED', // Assuming financial verification means payment is approved
                    },
                });

                logger.info('Registration approved and enrollment created', { registrationId, studentId: registration.student_id, batchId });
                return updatedReg;
            });
        }

        const updatedReg = await prisma.studentRegistration.update({
            where: { id: registrationId },
            data: {
                status: 'REJECTED',
                approved_by: adminId,
                approved_at: new Date(),
                admin_notes: notes,
            },
        });
        logger.info('Registration rejected in final step', { registrationId, adminId });
        return updatedReg;
    }

    /**
     * List registrations with optional status filter
     */
    static async listRegistrations(status?: RegistrationStatus) {
        return prisma.studentRegistration.findMany({
            where: status ? { status } : {},
            include: {
                student: {
                    include: { profile: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Get registration by ID
     */
    static async getRegistration(id: string) {
        const registration = await prisma.studentRegistration.findUnique({
            where: { id },
            include: {
                student: {
                    include: { profile: true },
                },
            },
        });

        if (!registration) {
            throw new AppError(404, 'Registration not found', 'REGISTRATION_NOT_FOUND');
        }

        return registration;
    }
}
