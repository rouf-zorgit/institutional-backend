import { Request, Response } from 'express';
import { EnrollmentService } from './enrollment.service';
import { createEnrollmentSchema, updateEnrollmentStatusSchema } from './enrollment.validation';
import { EnrollmentStatus } from '@prisma/client';

export class EnrollmentController {
    /**
     * Create enrollment
     */
    static async create(req: Request, res: Response) {
        const validatedData = createEnrollmentSchema.parse(req.body) as {
            student_id: string;
            batch_id: string;
            status?: EnrollmentStatus;
        };
        const enrollment = await EnrollmentService.createEnrollment(validatedData);

        res.status(201).json({
            success: true,
            message: 'Enrollment created successfully',
            data: enrollment
        });
    }

    /**
     * List enrollments
     */
    static async list(req: Request, res: Response) {
        const { page, limit, batch_id, student_id, status } = req.query;

        const result = await EnrollmentService.findAllEnrollments({
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            batch_id: batch_id as string,
            student_id: student_id as string,
            status: status as EnrollmentStatus
        });

        res.json({
            success: true,
            data: result.enrollments,
            meta: result.meta
        });
    }

    /**
     * Get single enrollment
     */
    static async get(req: Request, res: Response) {
        const { id } = req.params;
        const enrollment = await EnrollmentService.findEnrollmentById(id);

        res.json({
            success: true,
            data: enrollment
        });
    }

    /**
     * Update enrollment status
     */
    static async updateStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = updateEnrollmentStatusSchema.parse(req.body);

        const enrollment = await EnrollmentService.updateEnrollmentStatus(id, status);

        res.json({
            success: true,
            message: 'Enrollment status updated successfully',
            data: enrollment
        });
    }

    /**
     * Delete enrollment
     */
    static async delete(req: Request, res: Response) {
        const { id } = req.params;
        await EnrollmentService.deleteEnrollment(id);

        res.json({
            success: true,
            message: 'Enrollment deleted successfully'
        });
    }
}
