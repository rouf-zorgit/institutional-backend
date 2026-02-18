import { Request, Response } from 'express';
import { AssignmentsService } from './assignments.service';

export class AssignmentsController {
    static async createAssignment(req: Request, res: Response) {
        const userId = req.user!.id;
        const result = await AssignmentsService.createAssignment(req.body, userId);
        return res.status(201).json({ success: true, data: result });
    }

    static async listAssignments(req: Request, res: Response) {
        const { page, limit, batch_id, teacher_id } = req.query;
        const result = await AssignmentsService.findAllAssignments({
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
            batch_id: batch_id as string,
            teacher_id: teacher_id as string,
        });
        return res.json({ success: true, data: result });
    }

    static async getAssignment(req: Request, res: Response) {
        const { id } = req.params;
        const result = await AssignmentsService.findAssignmentById(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        return res.json({ success: true, data: result });
    }

    static async updateAssignment(req: Request, res: Response) {
        const { id } = req.params;
        // Ideally check ownership or permissions here
        const result = await AssignmentsService.updateAssignment(id, req.body);
        return res.json({ success: true, data: result });
    }

    static async deleteAssignment(req: Request, res: Response) {
        const { id } = req.params;
        await AssignmentsService.deleteAssignment(id);
        return res.json({ success: true, message: 'Assignment deleted successfully' });
    }

    static async submitAssignment(req: Request, res: Response) {
        const { id } = req.params; // assignment id
        const studentId = req.user!.id;
        const result = await AssignmentsService.submitAssignment(id, studentId, req.body);
        return res.json({ success: true, data: result });
    }

    static async gradeSubmission(req: Request, res: Response) {
        const { submissionId } = req.params;
        const graderId = req.user!.id;
        const result = await AssignmentsService.gradeSubmission(submissionId, graderId, req.body);
        return res.json({ success: true, data: result });
    }
}
