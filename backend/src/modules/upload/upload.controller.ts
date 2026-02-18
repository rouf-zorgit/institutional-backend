import { Request, Response } from 'express';
import { StorageService } from '@/common/utils/storage.service';

export class UploadController {
    static async uploadFile(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { category } = req.body;
        const validCategories = ['payments', 'invoices', 'assignments', 'study-materials', 'temp'];

        if (!category || !validCategories.includes(category)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing category' });
        }

        const url = await StorageService.uploadFile(req.file, category);

        return res.json({
            success: true,
            data: {
                url,
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    }
}
