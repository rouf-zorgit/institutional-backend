import { prisma } from '../../common/config/database';
import { logger } from '../../common/utils/logger.service';
import { ExportService } from '../../common/utils/export.service';
import { Prisma } from '@prisma/client';

export class ReportingService {
    /**
     * Get dashboard statistics
     */
    static async getDashboardStats() {
        const [
            totalStudents,
            totalCourses,
            totalBatches,
            activeBatches,
            totalEnrollments,
            activeEnrollments,
            totalRevenue,
            pendingPayments,
            approvedPayments,
            rejectedPayments
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
            prisma.course.count({ where: { status: 'PUBLISHED' } }),
            prisma.batch.count(),
            prisma.batch.count({ where: { status: 'ONGOING' } }),
            prisma.enrollment.count(),
            prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
            prisma.payment.aggregate({
                where: { status: 'APPROVED' },
                _sum: { amount: true }
            }),
            prisma.payment.count({ where: { status: 'PENDING' } }),
            prisma.payment.count({ where: { status: 'APPROVED' } }),
            prisma.payment.count({ where: { status: 'REJECTED' } })
        ]);

        return {
            students: {
                total: totalStudents
            },
            courses: {
                total: totalCourses
            },
            batches: {
                total: totalBatches,
                active: activeBatches
            },
            enrollments: {
                total: totalEnrollments,
                active: activeEnrollments
            },
            revenue: {
                total: totalRevenue._sum.amount || 0,
                pendingPayments,
                approvedPayments,
                rejectedPayments
            }
        };
    }

    /**
     * Get teacher statistics
     */
    static async getTeacherStats(teacherId: string) {
        const [totalStudents, pendingGrading] = await Promise.all([
            // Count unique students across all batches taught by this teacher
            prisma.enrollment.findMany({
                where: {
                    batch: {
                        teacher_id: teacherId
                    },
                    status: 'ACTIVE'
                },
                distinct: ['student_id'],
                select: {
                    student_id: true
                }
            }),
            // Count ungraded submissions for assignments created by this teacher
            prisma.assignmentSubmission.count({
                where: {
                    assignment: {
                        created_by: teacherId
                    },
                    marks: null
                }
            })
        ]);

        return {
            totalStudents: totalStudents.length,
            pendingGrading
        };
    }

    /**
     * Get enrollment trends over time
     */
    static async getEnrollmentTrends(params: {
        start_date?: Date;
        end_date?: Date;
        interval?: 'day' | 'week' | 'month';
    }) {
        const { start_date, end_date, interval = 'month' } = params;

        const where = {
            ...(start_date || end_date ? {
                created_at: {
                    ...(start_date && { gte: start_date }),
                    ...(end_date && { lte: end_date })
                }
            } : {})
        };

        const enrollments = await prisma.enrollment.findMany({
            where,
            select: {
                created_at: true,
                status: true
            },
            orderBy: { created_at: 'asc' }
        });

        // Group by interval
        const trends: Record<string, { total: number; active: number; pending: number }> = {};

        enrollments.forEach((enrollment: any) => {
            let key: string;
            const date = new Date(enrollment.created_at);

            if (interval === 'day') {
                key = date.toISOString().split('T')[0];
            } else if (interval === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!trends[key]) {
                trends[key] = { total: 0, active: 0, pending: 0 };
            }

            trends[key].total++;
            if (enrollment.status === 'ACTIVE') trends[key].active++;
            if (enrollment.status === 'PENDING') trends[key].pending++;
        });

        return Object.entries(trends).map(([date, stats]) => ({
            date,
            ...stats
        }));
    }

    /**
     * Get payment analytics
     */
    static async getPaymentAnalytics(params: {
        start_date?: Date;
        end_date?: Date;
    }) {
        const { start_date, end_date } = params;

        const where = {
            ...(start_date || end_date ? {
                created_at: {
                    ...(start_date && { gte: start_date }),
                    ...(end_date && { lte: end_date })
                }
            } : {})
        };

        const [
            totalPayments,
            statusBreakdown,
            revenueByMonth,
            topPayingStudents
        ] = await Promise.all([
            prisma.payment.aggregate({
                where: where as any,
                _sum: { amount: true },
                _count: true
            }),
            prisma.payment.groupBy({
                by: ['status'],
                where: where as any,
                _sum: { amount: true },
                _count: true
            }),
            prisma.payment.findMany({
                where: { ...where, status: 'APPROVED' },
                select: {
                    amount: true,
                    approved_at: true
                }
            }),
            prisma.payment.groupBy({
                by: ['student_id'],
                where: { ...where, status: 'APPROVED' } as any,
                _sum: { amount: true },
                orderBy: { _sum: { amount: 'desc' } },
                take: 10
            })
        ]);

        // Group revenue by month
        const monthlyRevenue: Record<string, number> = {};
        revenueByMonth.forEach((payment: any) => {
            if (payment.approved_at) {
                const month = `${payment.approved_at.getFullYear()}-${String(payment.approved_at.getMonth() + 1).padStart(2, '0')}`;
                monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(payment.amount);
            }
        });

        return {
            total: {
                amount: totalPayments._sum.amount || 0,
                count: totalPayments._count
            },
            byStatus: statusBreakdown.map((item: any) => ({
                status: item.status,
                amount: item._sum.amount || 0,
                count: item._count
            })),
            monthlyRevenue: Object.entries(monthlyRevenue).map(([month, amount]) => ({
                month,
                amount
            })),
            topStudents: topPayingStudents.map((item: any) => ({
                studentId: item.student_id,
                totalPaid: item._sum.amount || 0
            }))
        };
    }

    /**
     * Get attendance statistics
     */
    static async getAttendanceStats(params: {
        batch_id?: string;
        student_id?: string;
        start_date?: Date;
        end_date?: Date;
    }) {
        const { batch_id, student_id, start_date, end_date } = params;

        const where = {
            ...(batch_id && { batch_id }),
            ...(student_id && { student_id }),
            ...(start_date || end_date ? {
                date: {
                    ...(start_date && { gte: start_date }),
                    ...(end_date && { lte: end_date })
                }
            } : {})
        };

        const [totalRecords, statusBreakdown] = await Promise.all([
            prisma.attendance.count({ where }),
            prisma.attendance.groupBy({
                by: ['status'],
                where: where as any,
                _count: true
            })
        ]);

        const presentCount = statusBreakdown.find((s: any) => s.status === 'PRESENT')?._count || 0;
        const absentCount = statusBreakdown.find((s: any) => s.status === 'ABSENT')?._count || 0;
        const lateCount = statusBreakdown.find((s: any) => s.status === 'LATE')?._count || 0;

        return {
            total: totalRecords,
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            attendanceRate: totalRecords > 0 ? ((presentCount + lateCount) / totalRecords * 100).toFixed(2) : 0
        };
    }

    /**
     * Export enrollments to CSV
     */
    static async exportEnrollments(params: {
        batch_id?: string;
        student_id?: string;
        status?: string;
    }): Promise<string> {
        const { batch_id, student_id, status } = params;

        const where = {
            ...(batch_id && { batch_id }),
            ...(student_id && { student_id }),
            ...(status && { status: status as any })
        };

        const enrollments = await prisma.enrollment.findMany({
            where,
            include: {
                student: {
                    include: { profile: true }
                },
                batch: {
                    include: { course: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const formattedData = enrollments.map((enrollment: any) => ({
            'Enrollment ID': enrollment.id,
            'Student Name': enrollment.student.profile?.name || '-',
            'Student Email': enrollment.student.email,
            'Course': enrollment.batch.course.title,
            'Batch': enrollment.batch.name,
            'Status': enrollment.status,
            'Payment Status': enrollment.payment_status,
            'Enrolled At': enrollment.enrolled_at?.toISOString() || '-',
            'Created At': enrollment.created_at.toISOString()
        }));

        return ExportService.generateCSV(formattedData);
    }

    /**
     * Export payments to CSV
     */
    static async exportPayments(params: {
        student_id?: string;
        status?: string;
        start_date?: Date;
        end_date?: Date;
    }): Promise<string> {
        const { student_id, status, start_date, end_date } = params;

        const where = {
            ...(student_id && { student_id }),
            ...(status && { status: status as any }),
            ...(start_date || end_date ? {
                created_at: {
                    ...(start_date && { gte: start_date }),
                    ...(end_date && { lte: end_date })
                }
            } : {})
        };

        const payments = await prisma.payment.findMany({
            where,
            include: {
                student: {
                    include: { profile: true }
                },
                enrollment: {
                    include: {
                        batch: {
                            include: { course: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const formattedData = payments.map((payment: any) => ({
            'Payment ID': payment.id,
            'Transaction ID': payment.transaction_id,
            'Student Name': payment.student.profile?.name || '-',
            'Student Email': payment.student.email,
            'Course': payment.enrollment.batch.course.title,
            'Batch': payment.enrollment.batch.name,
            'Amount': Number(payment.amount),
            'Payment Method': payment.payment_method,
            'Phone Number': payment.phone_number,
            'Status': payment.status,
            'Approved At': payment.approved_at?.toISOString() || '-',
            'Created At': payment.created_at.toISOString()
        }));

        return ExportService.generateCSV(formattedData);
    }

    /**
     * Export attendance to CSV
     */
    static async exportAttendance(params: {
        batch_id?: string;
        student_id?: string;
        start_date?: Date;
        end_date?: Date;
    }): Promise<string> {
        const { batch_id, student_id, start_date, end_date } = params;

        const where = {
            ...(batch_id && { batch_id }),
            ...(student_id && { student_id }),
            ...(start_date || end_date ? {
                date: {
                    ...(start_date && { gte: start_date }),
                    ...(end_date && { lte: end_date })
                }
            } : {})
        };

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                student: {
                    include: { profile: true }
                },
                batch: {
                    include: { course: true }
                },
                marker: {
                    include: { profile: true }
                }
            },
            orderBy: { date: 'desc' }
        });

        const formattedData = attendance.map((record: any) => ({
            'Date': record.date.toISOString().split('T')[0],
            'Student Name': record.student.profile?.name || '-',
            'Student Email': record.student.email,
            'Course': record.batch.course.title,
            'Batch': record.batch.name,
            'Status': record.status,
            'Marked By': record.marker.profile?.name || record.marker.email,
            'Notes': record.notes || '-'
        }));

        return ExportService.generateCSV(formattedData);
    }
}
