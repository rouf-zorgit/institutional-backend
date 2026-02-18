import { Request, Response } from 'express';
import { BatchService } from './batch.service';
import { BatchStatus } from '@prisma/client';

export class BatchController {
    static async listBatches(req: Request, res: Response) {
        const { page, limit, course_id, teacher_id, status, search } = req.query;

        const result = await BatchService.findAllBatches({
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
            course_id: course_id as string,
            teacher_id: teacher_id as string,
            status: status as BatchStatus,
            search: search as string,
        });

        res.json({
            success: true,
            data: result,
        });
    }

    static async getBatch(req: Request, res: Response) {
        const { id } = req.params;
        const result = await BatchService.findBatchById(id);
        res.json({
            success: true,
            data: result,
        });
    }

    static async createBatch(req: Request, res: Response) {
        const userId = req.user!.id;
        const result = await BatchService.createBatch(req.body, userId);
        res.status(201).json({
            success: true,
            data: result,
        });
    }

    static async updateBatch(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user!.id;
        const result = await BatchService.updateBatch(id, req.body, userId);
        res.json({
            success: true,
            data: result,
        });
    }

    static async deleteBatch(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user!.id;
        const result = await BatchService.deleteBatch(id, userId);
        res.json({
            success: true,
            data: result,
        });
    }
}

export default BatchController;
