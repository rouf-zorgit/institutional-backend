import { Request, Response } from 'express';
import { ReportingService } from './reporting.service';
import {
    dateRangeSchema,
    enrollmentTrendsSchema,
    exportEnrollmentsSchema,
    exportPaymentsSchema,
    exportAttendanceSchema,
    attendanceStatsSchema
} from './reporting.validation';

export class ReportingController {
    /**
     * Get dashboard statistics
     */
    static async getDashboard(req: Request, res: Response) {
        const stats = await ReportingService.getDashboardStats();

        res.json({
            success: true,
            data: stats
        });
    }

    /**
     * Get teacher statistics
     */
    static async getTeacherStats(req: Request, res: Response) {
        const teacherId = req.user?.id;
        if (!teacherId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const stats = await ReportingService.getTeacherStats(teacherId);

        return res.json({
            success: true,
            data: stats
        });
    }

    /**
     * Get enrollment trends
     */
    static async getEnrollmentTrends(req: Request, res: Response) {
        const validatedQuery = enrollmentTrendsSchema.parse(req.query);
        const trends = await ReportingService.getEnrollmentTrends(validatedQuery);

        res.json({
            success: true,
            data: trends
        });
    }

    /**
     * Get payment analytics
     */
    static async getPaymentAnalytics(req: Request, res: Response) {
        const validatedQuery = dateRangeSchema.parse(req.query);
        const analytics = await ReportingService.getPaymentAnalytics(validatedQuery);

        res.json({
            success: true,
            data: analytics
        });
    }

    /**
     * Get attendance statistics
     */
    static async getAttendanceStats(req: Request, res: Response) {
        const validatedQuery = attendanceStatsSchema.parse(req.query);
        const stats = await ReportingService.getAttendanceStats(validatedQuery);

        res.json({
            success: true,
            data: stats
        });
    }

    /**
     * Export enrollments to CSV
     */
    static async exportEnrollments(req: Request, res: Response) {
        const validatedQuery = exportEnrollmentsSchema.parse(req.query);
        const csv = await ReportingService.exportEnrollments(validatedQuery);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=enrollments-${Date.now()}.csv`);
        res.send(csv);
    }

    /**
     * Export payments to CSV
     */
    static async exportPayments(req: Request, res: Response) {
        const validatedQuery = exportPaymentsSchema.parse(req.query);
        const csv = await ReportingService.exportPayments(validatedQuery);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=payments-${Date.now()}.csv`);
        res.send(csv);
    }

    /**
     * Export attendance to CSV
     */
    static async exportAttendance(req: Request, res: Response) {
        const validatedQuery = exportAttendanceSchema.parse(req.query);
        const csv = await ReportingService.exportAttendance(validatedQuery);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance-${Date.now()}.csv`);
        res.send(csv);
    }
}
