import { Request, Response } from 'express';
import { SubmissionsService } from './submissions.service';

export class SubmissionsController {
    static async create(req: Request, res: Response) {
        // req.user is set by auth middleware
        const studentId = req.user?.id;
        if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const result = await SubmissionsService.create(req.body, studentId);
        return res.status(201).json({ success: true, data: result });
    }

    static async list(req: Request, res: Response) {
        const { assignment_id, student_id } = req.query;
        // Teachers can see all for an assignment. Students only their own.
        // For simplicity, validation is done in service or by checking roles in middleware.

        const result = await SubmissionsService.findAll({
            assignment_id: assignment_id as string,
            student_id: student_id as string
        });
        return res.json({ success: true, data: result });
    }

    static async grade(req: Request, res: Response) {
        const { id } = req.params;
        const graderId = req.user?.id;
        if (!graderId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const result = await SubmissionsService.grade(id, req.body, graderId);
        return res.json({ success: true, data: result });
    }
}
