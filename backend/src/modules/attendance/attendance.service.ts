import { prisma } from '@/common/config/database';
import { AppError } from '@/common/middleware/errorHandler.middleware';
import { logger } from '@/common/utils/logger.service';
import { AttendanceStatus, Prisma } from '@prisma/client';

export class AttendanceService {
    /**
     * Mark individual student attendance
     */
    static async markAttendance(data: {
        batch_id: string;
        student_id: string;
        date: string;
        status: AttendanceStatus;
        marked_by: string;
        notes?: string;
    }) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Verify batch exists
            const batch = await tx.batch.findUnique({
                where: { id: data.batch_id, deleted_at: null }
            });

            if (!batch) {
                throw new AppError(404, 'Batch not found', 'BATCH_NOT_FOUND');
            }

            // 2. Verify student is enrolled in this batch
            const enrollment = await tx.enrollment.findUnique({
                where: {
                    student_id_batch_id: {
                        student_id: data.student_id,
                        batch_id: data.batch_id
                    }
                }
            });

            if (!enrollment) {
                throw new AppError(400, 'Student is not enrolled in this batch', 'NOT_ENROLLED');
            }

            // 3. Check if attendance already exists for this date
            const existingAttendance = await tx.attendance.findUnique({
                where: {
                    student_id_batch_id_date: {
                        student_id: data.student_id,
                        batch_id: data.batch_id,
                        date: new Date(data.date)
                    }
                }
            });

            if (existingAttendance) {
                throw new AppError(400, 'Attendance already marked for this date', 'ATTENDANCE_EXISTS');
            }

            // 4. Create attendance record
            const attendance = await tx.attendance.create({
                data: {
                    batch_id: data.batch_id,
                    student_id: data.student_id,
                    date: new Date(data.date),
                    status: data.status,
                    marked_by: data.marked_by,
                    notes: data.notes
                },
                include: {
                    student: {
                        include: { profile: true }
                    },
                    batch: true,
                    marker: {
                        include: { profile: true }
                    }
                }
            });

            logger.info('Attendance marked', {
                attendanceId: attendance.id,
                studentId: data.student_id,
                batchId: data.batch_id,
                date: data.date,
                status: data.status
            });

            return attendance;
        });
    }

    /**
     * Bulk mark attendance for multiple students
     */
    static async bulkMarkAttendance(data: {
        batch_id: string;
        date: string;
        status: AttendanceStatus;
        marked_by: string;
        student_ids?: string[];
        notes?: string;
    }) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Verify batch exists
            const batch = await tx.batch.findUnique({
                where: { id: data.batch_id, deleted_at: null }
            });

            if (!batch) {
                throw new AppError(404, 'Batch not found', 'BATCH_NOT_FOUND');
            }

            // 2. Get enrolled students
            let enrollments;
            if (data.student_ids && data.student_ids.length > 0) {
                // Mark specific students
                enrollments = await tx.enrollment.findMany({
                    where: {
                        batch_id: data.batch_id,
                        student_id: { in: data.student_ids },
                        status: 'ACTIVE'
                    },
                    include: {
                        student: {
                            include: { profile: true }
                        }
                    }
                });
            } else {
                // Mark all enrolled students
                enrollments = await tx.enrollment.findMany({
                    where: {
                        batch_id: data.batch_id,
                        status: 'ACTIVE'
                    },
                    include: {
                        student: {
                            include: { profile: true }
                        }
                    }
                });
            }

            if (enrollments.length === 0) {
                throw new AppError(400, 'No enrolled students found', 'NO_STUDENTS');
            }

            // 3. Check for existing attendance records
            const existingAttendance = await tx.attendance.findMany({
                where: {
                    batch_id: data.batch_id,
                    date: new Date(data.date),
                    student_id: { in: enrollments.map(e => e.student_id) }
                }
            });

            const existingStudentIds = new Set(existingAttendance.map((a: any) => a.student_id));
            const studentsToMark = enrollments.filter((e: any) => !existingStudentIds.has(e.student_id));

            if (studentsToMark.length === 0) {
                throw new AppError(400, 'Attendance already marked for all students', 'ALL_MARKED');
            }

            // 4. Create attendance records
            const attendanceRecords = await tx.attendance.createMany({
                data: studentsToMark.map((enrollment: any) => ({
                    batch_id: data.batch_id,
                    student_id: enrollment.student_id,
                    date: new Date(data.date),
                    status: data.status,
                    marked_by: data.marked_by,
                    notes: data.notes
                }))
            });

            logger.info('Bulk attendance marked', {
                batchId: data.batch_id,
                date: data.date,
                status: data.status,
                count: attendanceRecords.count,
                skipped: existingAttendance.length
            });

            return {
                marked: attendanceRecords.count,
                skipped: existingAttendance.length,
                total: enrollments.length
            };
        });
    }

    /**
     * Update attendance record
     */
    static async updateAttendance(id: string, data: { status: AttendanceStatus; notes?: string }) {
        const attendance = await prisma.attendance.findUnique({
            where: { id }
        });

        if (!attendance) {
            throw new AppError(404, 'Attendance record not found', 'ATTENDANCE_NOT_FOUND');
        }

        const updatedAttendance = await prisma.attendance.update({
            where: { id },
            data: {
                status: data.status,
                notes: data.notes
            },
            include: {
                student: {
                    include: { profile: true }
                },
                batch: true,
                marker: {
                    include: { profile: true }
                }
            }
        });

        logger.info('Attendance updated', { attendanceId: id, status: data.status });
        return updatedAttendance;
    }

    /**
     * Delete attendance record
     */
    static async deleteAttendance(id: string) {
        const attendance = await prisma.attendance.findUnique({
            where: { id }
        });

        if (!attendance) {
            throw new AppError(404, 'Attendance record not found', 'ATTENDANCE_NOT_FOUND');
        }

        await prisma.attendance.delete({
            where: { id }
        });

        logger.info('Attendance deleted', { attendanceId: id });
        return { success: true };
    }

    /**
     * Get student attendance history
     */
    static async getStudentAttendance(params: {
        student_id: string;
        batch_id?: string;
        start_date?: string;
        end_date?: string;
    }) {
        const where: any = {
            student_id: params.student_id,
            ...(params.batch_id && { batch_id: params.batch_id }),
            ...(params.start_date && { date: { gte: new Date(params.start_date) } }),
            ...(params.end_date && { date: { lte: new Date(params.end_date) } })
        };

        const [attendance, stats] = await Promise.all([
            prisma.attendance.findMany({
                where,
                include: {
                    batch: {
                        include: { course: true }
                    },
                    marker: {
                        include: { profile: true }
                    }
                },
                orderBy: { date: 'desc' }
            }),
            this.calculateAttendanceStats(params.student_id, params.batch_id, params.start_date, params.end_date)
        ]);

        return {
            attendance,
            stats
        };
    }

    /**
     * Get batch attendance for a specific date
     */
    static async getBatchAttendance(batch_id: string, date: string) {
        const batch = await prisma.batch.findUnique({
            where: { id: batch_id, deleted_at: null },
            include: {
                course: true,
                enrollments: {
                    where: { status: 'ACTIVE' },
                    include: {
                        student: {
                            include: { profile: true }
                        }
                    }
                }
            }
        });

        if (!batch) {
            throw new AppError(404, 'Batch not found', 'BATCH_NOT_FOUND');
        }

        const attendance = await prisma.attendance.findMany({
            where: {
                batch_id,
                date: new Date(date)
            },
            include: {
                student: {
                    include: { profile: true }
                },
                marker: {
                    include: { profile: true }
                }
            }
        });

        // Create a map of attendance by student_id
        const attendanceMap = new Map(attendance.map((a: any) => [a.student_id, a]));

        // Combine enrollment and attendance data
        const students = batch.enrollments.map((enrollment: any) => ({
            ...enrollment.student,
            profile: enrollment.student.profile,
            attendance: attendanceMap.get(enrollment.student.id) || null
        }));

        return {
            batch: {
                id: batch.id,
                name: batch.name,
                course: batch.course
            },
            date,
            students,
            summary: {
                total: students.length,
                present: attendance.filter((a: any) => a.status === 'PRESENT').length,
                absent: attendance.filter((a: any) => a.status === 'ABSENT').length,
                late: attendance.filter((a: any) => a.status === 'LATE').length,
                unmarked: students.length - attendance.length
            }
        };
    }

    /**
     * Calculate attendance statistics for a student
     */
    static async calculateAttendanceStats(
        student_id: string,
        batch_id?: string,
        start_date?: string,
        end_date?: string
    ) {
        const where: any = {
            student_id,
            ...(batch_id && { batch_id }),
            ...(start_date && { date: { gte: new Date(start_date) } }),
            ...(end_date && { date: { lte: new Date(end_date) } })
        };

        const attendance = await prisma.attendance.findMany({
            where,
            select: { status: true }
        });

        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'PRESENT').length;
        const absent = attendance.filter(a => a.status === 'ABSENT').length;
        const late = attendance.filter(a => a.status === 'LATE').length;

        return {
            total,
            present,
            absent,
            late,
            percentage: total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0
        };
    }

    /**
     * Get attendance report with filters
     */
    static async getAttendanceReport(params: {
        batch_id?: string;
        student_id?: string;
        start_date?: string;
        end_date?: string;
    }) {
        const where: any = {
            ...(params.batch_id && { batch_id: params.batch_id }),
            ...(params.student_id && { student_id: params.student_id }),
            ...(params.start_date && { date: { gte: new Date(params.start_date) } }),
            ...(params.end_date && { date: { lte: new Date(params.end_date) } })
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
            orderBy: [
                { date: 'desc' },
                { batch_id: 'asc' }
            ]
        });

        // Calculate overall statistics
        const total = attendance.length;
        const present = attendance.filter((a: any) => a.status === 'PRESENT').length;
        const absent = attendance.filter((a: any) => a.status === 'ABSENT').length;
        const late = attendance.filter((a: any) => a.status === 'LATE').length;

        return {
            attendance,
            summary: {
                total,
                present,
                absent,
                late,
                percentage: total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0
            }
        };
    }
}
