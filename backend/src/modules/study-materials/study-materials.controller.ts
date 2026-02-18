import { Request, Response } from 'express';
import { StudyMaterialsService } from './study-materials.service';

export class StudyMaterialsController {
    static async createStudyMaterial(req: Request, res: Response) {
        const userId = req.user!.id;
        const result = await StudyMaterialsService.createStudyMaterial(req.body, userId);
        return res.status(201).json({ success: true, data: result });
    }

    static async listStudyMaterials(req: Request, res: Response) {
        const { page, limit, batch_id } = req.query;
        const result = await StudyMaterialsService.findAllStudyMaterials({
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
            batch_id: batch_id as string,
        });
        return res.json({ success: true, data: result });
    }

    static async getStudyMaterial(req: Request, res: Response) {
        const { id } = req.params;
        const result = await StudyMaterialsService.findStudyMaterialById(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Study Material not found' });
        }
        return res.json({ success: true, data: result });
    }

    static async updateStudyMaterial(req: Request, res: Response) {
        const { id } = req.params;
        const result = await StudyMaterialsService.updateStudyMaterial(id, req.body);
        return res.json({ success: true, data: result });
    }

    static async deleteStudyMaterial(req: Request, res: Response) {
        const { id } = req.params;
        await StudyMaterialsService.deleteStudyMaterial(id);
        return res.json({ success: true, message: 'Study Material deleted successfully' });
    }
}
