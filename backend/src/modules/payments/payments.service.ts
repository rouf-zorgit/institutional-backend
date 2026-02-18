import { prisma } from '@/common/config/database';
import { AppError } from '@/common/middleware/errorHandler.middleware';
import { logger } from '@/common/utils/logger.service';
import { CacheService } from '@/common/utils/cache.service';
import { StorageService } from '@/common/utils/storage.service';
import { InvoiceService } from './invoice.service';
import redis from '@/common/config/redis';

type PaymentStatusType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIAL';

export class PaymentsService {
    /**
     * Create payment (student uploads payment proof)
     */
    static async createPayment(data: {
        enrollment_id: string;
        student_id: string;
        amount: number;
        transaction_id: string;
        phone_number: string;
        payment_method: string;
        notes?: string;
        screenshot: Express.Multer.File;
    }) {
        try {
            // Validate enrollment exists and belongs to student
            const enrollment = await prisma.enrollment.findUnique({
                where: { id: data.enrollment_id },
                include: {
                    batch: {
                        include: { course: true }
                    }
                }
            });

            if (!enrollment) {
                throw new AppError(404, 'Enrollment not found', 'ENROLLMENT_NOT_FOUND');
            }

            if (enrollment.student_id !== data.student_id) {
                throw new AppError(
                    403,
                    'You can only upload payment for your own enrollment',
                    'FORBIDDEN'
                );
            }

            // Check for duplicate transaction ID
            const existingPayment = await prisma.payment.findUnique({
                where: { transaction_id: data.transaction_id }
            });

            if (existingPayment) {
                throw new AppError(
                    400,
                    'Payment with this transaction ID already exists',
                    'DUPLICATE_TRANSACTION'
                );
            }

            // Upload screenshot to storage
            const screenshotUrl = await StorageService.uploadFile(data.screenshot, 'payments');

            // Create payment record
            const payment = await prisma.payment.create({
                data: {
                    enrollment_id: data.enrollment_id,
                    student_id: data.student_id,
                    amount: data.amount,
                    screenshot_url: screenshotUrl,
                    transaction_id: data.transaction_id,
                    phone_number: data.phone_number,
                    payment_method: data.payment_method,
                    notes: data.notes,
                    status: 'PENDING'
                },
                include: {
                    enrollment: {
                        include: {
                            batch: {
                                include: { course: true }
                            }
                        }
                    }
                }
            });

            logger.info('Payment uploaded successfully', {
                paymentId: payment.id,
                studentId: data.student_id,
                enrollmentId: data.enrollment_id,
                amount: data.amount
            });

            return payment;
        } catch (error) {
            logger.error('Payment upload failed', error, { studentId: data.student_id });
            throw error;
        }
    }

    /**
     * List payments with filters and pagination
     */
    static async listPayments(params: {
        page?: number;
        pageSize?: number;
        status?: PaymentStatusType;
        student_id?: string;
        enrollment_id?: string;
        date_from?: Date;
        date_to?: Date;
    }) {
        const {
            page = 1,
            pageSize = 20,
            status,
            student_id,
            enrollment_id,
            date_from,
            date_to
        } = params;

        const skip = (page - 1) * pageSize;

        const where: any = {};
        if (status) where.status = status;
        if (student_id) where.student_id = student_id;
        if (enrollment_id) where.enrollment_id = enrollment_id;
        if (date_from || date_to) {
            where.created_at = {};
            if (date_from) where.created_at.gte = date_from;
            if (date_to) where.created_at.lte = date_to;
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    enrollment: {
                        include: {
                            batch: {
                                include: { course: true }
                            },
                            student: {
                                include: { profile: true }
                            }
                        }
                    },
                    invoice: true
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: pageSize
            }),
            prisma.payment.count({ where })
        ]);

        return {
            payments,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }

    /**
     * Get student's payment history
     */
    static async getStudentPaymentHistory(studentId: string, page: number = 1, pageSize: number = 10) {
        return this.listPayments({
            student_id: studentId,
            page,
            pageSize
        });
    }

    /**
     * Approve payment with transaction safety
     */
    static async approvePayment(
        paymentId: string,
        approvedBy: string,
        idempotencyKey?: string
    ) {
        // Check idempotency
        if (idempotencyKey) {
            const cached = await this.checkIdempotency(idempotencyKey);
            if (cached) {
                logger.info('Returning cached payment approval result', {
                    paymentId,
                    idempotencyKey
                });
                return cached;
            }
        }

        try {
            const result = await prisma.$transaction(
                async (tx: any) => {
                    // Lock and fetch payment
                    const payment = await tx.payment.findUnique({
                        where: { id: paymentId },
                        include: {
                            enrollment: {
                                include: {
                                    batch: {
                                        include: {
                                            course: true,
                                        },
                                    },
                                    student: {
                                        include: {
                                            profile: true,
                                        },
                                    },
                                },
                            },
                        },
                    });

                    if (!payment) {
                        throw new AppError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
                    }

                    if (payment.status !== 'PENDING') {
                        throw new AppError(
                            400,
                            `Payment already ${payment.status.toLowerCase()}`,
                            'PAYMENT_ALREADY_PROCESSED'
                        );
                    }

                    // Update payment status
                    const updatedPayment = await tx.payment.update({
                        where: { id: paymentId },
                        data: {
                            status: 'APPROVED',
                            approved_by: approvedBy,
                            approved_at: new Date(),
                        },
                    });

                    // Update enrollment status
                    const updatedEnrollment = await tx.enrollment.update({
                        where: { id: payment.enrollment_id },
                        data: {
                            status: 'ACTIVE',
                            payment_status: 'APPROVED',
                            enrolled_at: new Date(),
                        },
                    });

                    // Create audit log
                    await tx.auditLog.create({
                        data: {
                            user_id: approvedBy,
                            action: 'PAYMENT_APPROVED',
                            entity: 'payment',
                            entity_id: paymentId,
                            old_value: {
                                status: 'PENDING',
                                approved_by: null,
                                approved_at: null,
                            },
                            new_value: {
                                status: 'APPROVED',
                                approved_by: approvedBy,
                                approved_at: updatedPayment.approved_at,
                            },
                        },
                    });

                    // Create notification for student
                    await tx.notification.create({
                        data: {
                            user_id: payment.student_id,
                            type: 'SUCCESS',
                            title: 'Payment Approved',
                            message: `Your payment of ₹${payment.amount} for ${payment.enrollment.batch.course.title} has been approved.`,
                        },
                    });

                    // Invalidate cache
                    await CacheService.invalidatePattern(`enrollment:${payment.enrollment_id}*`);
                    await CacheService.invalidatePattern(`payment:${paymentId}*`);

                    logger.info('Payment approved successfully', {
                        paymentId,
                        enrollmentId: payment.enrollment_id,
                        studentId: payment.student_id,
                        amount: payment.amount.toString(),
                        approvedBy,
                    });

                    return {
                        payment: updatedPayment,
                        enrollment: updatedEnrollment,
                    };
                },
                {
                    maxWait: 5000,
                    timeout: 10000,
                }
            );

            // Generate invoice after successful approval
            try {
                await InvoiceService.createInvoice(paymentId, approvedBy);
                logger.info('Invoice generated after payment approval', { paymentId });
            } catch (invoiceError) {
                logger.error('Invoice generation failed after approval', invoiceError, { paymentId });
            }

            // Cache idempotency result
            if (idempotencyKey) {
                await this.cacheIdempotency(idempotencyKey, result);
            }

            return result;
        } catch (error) {
            logger.error('Payment approval failed', error, {
                paymentId,
                approvedBy,
                idempotencyKey,
            });
            throw error;
        }
    }

    /**
     * Reject payment with transaction safety
     */
    static async rejectPayment(
        paymentId: string,
        rejectedBy: string,
        reason: string,
        idempotencyKey?: string
    ) {
        // Check idempotency
        if (idempotencyKey) {
            const cached = await this.checkIdempotency(idempotencyKey);
            if (cached) {
                return cached;
            }
        }

        try {
            const result = await prisma.$transaction(async (tx: any) => {
                const payment = await tx.payment.findUnique({
                    where: { id: paymentId },
                    include: {
                        enrollment: {
                            include: {
                                batch: {
                                    include: {
                                        course: true,
                                    },
                                },
                            },
                        },
                        student: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                });

                if (!payment) {
                    throw new AppError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
                }

                if (payment.status !== 'PENDING') {
                    throw new AppError(
                        400,
                        `Payment already ${payment.status.toLowerCase()}`,
                        'PAYMENT_ALREADY_PROCESSED'
                    );
                }

                const updatedPayment = await tx.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'REJECTED',
                        approved_by: rejectedBy,
                        approved_at: new Date(),
                        rejected_reason: reason,
                    },
                });

                const updatedEnrollment = await tx.enrollment.update({
                    where: { id: payment.enrollment_id },
                    data: {
                        payment_status: 'REJECTED',
                    },
                });

                await tx.auditLog.create({
                    data: {
                        user_id: rejectedBy,
                        action: 'PAYMENT_REJECTED',
                        entity: 'payment',
                        entity_id: paymentId,
                        old_value: {
                            status: 'PENDING',
                        },
                        new_value: {
                            status: 'REJECTED',
                            rejected_reason: reason,
                            approved_by: rejectedBy,
                            approved_at: updatedPayment.approved_at,
                        },
                    },
                });

                await tx.notification.create({
                    data: {
                        user_id: payment.student_id,
                        type: 'ERROR',
                        title: 'Payment Rejected',
                        message: `Your payment of ₹${payment.amount} for ${payment.enrollment.batch.course.title} has been rejected. Reason: ${reason}`,
                    },
                });

                await CacheService.invalidatePattern(`enrollment:${payment.enrollment_id}*`);
                await CacheService.invalidatePattern(`payment:${paymentId}*`);

                logger.info('Payment rejected successfully', {
                    paymentId,
                    enrollmentId: payment.enrollment_id,
                    studentId: payment.student_id,
                    reason,
                    rejectedBy,
                });

                return {
                    payment: updatedPayment,
                    enrollment: updatedEnrollment,
                };
            });

            if (idempotencyKey) {
                await this.cacheIdempotency(idempotencyKey, result);
            }

            return result;
        } catch (error) {
            logger.error('Payment rejection failed', error, {
                paymentId,
                rejectedBy,
                reason,
            });
            throw error;
        }
    }

    /**
     * Check idempotency key
     */
    private static async checkIdempotency(key: string): Promise<any | null> {
        try {
            const cached = await redis.get(`idempotency:${key}`);
            if (cached) {
                return JSON.parse(cached as string);
            }
            return null;
        } catch (error) {
            logger.error('Idempotency check failed', error, { key });
            return null;
        }
    }

    /**
     * Cache idempotency result
     */
    private static async cacheIdempotency(key: string, result: any): Promise<void> {
        try {
            await redis.setex(`idempotency:${key}`, 3600, JSON.stringify(result));
        } catch (error) {
            logger.error('Idempotency caching failed', error, { key });
        }
    }

    /**
     * Get payment details
     */
    static async getPayment(paymentId: string) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                enrollment: {
                    include: {
                        batch: {
                            include: {
                                course: true,
                            },
                        },
                        student: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
                invoice: true,
            },
        });

        if (!payment) {
            throw new AppError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
        }

        return payment;
    }

    /**
     * List pending payments
     */
    static async getPendingPayments(page: number = 1, pageSize: number = 20) {
        const skip = (page - 1) * pageSize;

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where: {
                    status: 'PENDING',
                },
                include: {
                    enrollment: {
                        include: {
                            batch: {
                                include: {
                                    course: true,
                                },
                            },
                            student: {
                                include: {
                                    profile: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
                skip,
                take: pageSize,
            }),
            prisma.payment.count({
                where: {
                    status: 'PENDING',
                },
            }),
        ]);

        return {
            payments,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
}

export default PaymentsService;
