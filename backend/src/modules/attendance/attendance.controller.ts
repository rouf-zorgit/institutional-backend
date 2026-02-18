import { Request, Response } from 'express';
import { AttendanceService } from './attendance.service';
import {
    markAttendanceSchema,
    bulkMarkAttendanceSchema,
    updateAttendanceSchema,
    attendanceReportQuerySchema
} from './attendance.validation';

export class AttendanceController {
    /**
     * Mark individual attendance
     */
    static async markAttendance(req: Request, res: Response) {
        const validatedData = markAttendanceSchema.parse(req.body) as {
            batch_id: string;
            student_id: string;
            date: string;
            status: string;
            notes?: string;
        };
        const marked_by = req.user!.id;

        const attendance = await AttendanceService.markAttendance({
            ...validatedData,
            status: validatedData.status as any,
            marked_by
        });

        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: attendance
        });
    }

    /**
     * Bulk mark attendance
     */
    static async bulkMarkAttendance(req: Request, res: Response) {
        const validatedData = bulkMarkAttendanceSchema.parse(req.body) as {
            batch_id: string;
            date: string;
            status: string;
            student_ids?: string[];
            notes?: string;
        };
        const marked_by = req.user!.id;

        const result = await AttendanceService.bulkMarkAttendance({
            ...validatedData,
            status: validatedData.status as any,
            marked_by
        });

        res.status(201).json({
            success: true,
            message: `Attendance marked for ${result.marked} students${result.skipped > 0 ? `, ${result.skipped} already marked` : ''}`,
            data: result
        });
    }

    /**
     * Update attendance record
     */
    static async updateAttendance(req: Request, res: Response) {
        const { id } = req.params;
        const validatedData = updateAttendanceSchema.parse(req.body) as {
            status: string;
            notes?: string;
        };

        const attendance = await AttendanceService.updateAttendance(id, {
            ...validatedData,
            status: validatedData.status as any
        });

        res.json({
            success: true,
            message: 'Attendance updated successfully',
            data: attendance
        });
    }

    /**
     * Delete attendance record
     */
    static async deleteAttendance(req: Request, res: Response) {
        const { id } = req.params;
        await AttendanceService.deleteAttendance(id);

        res.json({
            success: true,
            message: 'Attendance deleted successfully'
        });
    }

    /**
     * Get student attendance history
     */
    static async getStudentAttendance(req: Request, res: Response) {
        const { studentId } = req.params;
        const { batch_id, start_date, end_date } = attendanceReportQuerySchema.parse(req.query);

        const result = await AttendanceService.getStudentAttendance({
            student_id: studentId,
            batch_id,
            start_date,
            end_date
        });

        res.json({
            success: true,
            data: result
        });
    }

    /**
     * Get batch attendance for a specific date
     */
    static async getBatchAttendanceByDate(req: Request, res: Response) {
        const { batchId, date } = req.params;

        const result = await AttendanceService.getBatchAttendance(batchId, date);

        res.json({
            success: true,
            data: result
        });
    }

    /**
     * Get student attendance statistics
     */
    static async getStudentStats(req: Request, res: Response) {
        const { studentId } = req.params;
        const { batch_id, start_date, end_date } = attendanceReportQuerySchema.parse(req.query);

        const stats = await AttendanceService.calculateAttendanceStats(
            studentId,
            batch_id,
            start_date,
            end_date
        );

        res.json({
            success: true,
            data: stats
        });
    }

    /**
     * Get attendance report with filters
     */
    static async getAttendanceReport(req: Request, res: Response) {
        const { batch_id, student_id, start_date, end_date } = attendanceReportQuerySchema.parse(req.query);

        const result = await AttendanceService.getAttendanceReport({
            batch_id,
            student_id,
            start_date,
            end_date
        });

        res.json({
            success: true,
            data: result
        });
    }
}
