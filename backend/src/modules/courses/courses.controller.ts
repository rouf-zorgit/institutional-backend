import { Request, Response } from 'express';
import { CoursesService } from './courses.service';
import { CourseStatus } from '@prisma/client';

export class CoursesController {
    // ============================================================================
    // CATEGORY CONTROLLERS
    // ============================================================================

    static async createCategory(req: Request, res: Response) {
        const result = await CoursesService.createCategory(req.body);
        res.status(201).json({
            success: true,
            data: result,
        });
    }

    static async listCategories(req: Request, res: Response) {
        const result = await CoursesService.findAllCategories();
        res.json({
            success: true,
            data: result,
        });
    }

    static async updateCategory(req: Request, res: Response) {
        const { id } = req.params;
        const result = await CoursesService.updateCategory(id, req.body);
        res.json({
            success: true,
            data: result,
        });
    }

    static async deleteCategory(req: Request, res: Response) {
        const { id } = req.params;
        const result = await CoursesService.deleteCategory(id);
        res.json({
            success: true,
            data: result,
        });
    }

    // ============================================================================
    // COURSE CONTROLLERS
    // ============================================================================

    static async listCourses(req: Request, res: Response) {
        const { page, limit, category_id, status, search } = req.query;

        const result = await CoursesService.findAllCourses({
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
            category_id: category_id as string,
            status: status as CourseStatus,
            search: search as string,
        });

        res.json({
            success: true,
            data: result,
        });
    }

    static async getCourse(req: Request, res: Response) {
        const { id } = req.params;
        const result = await CoursesService.findCourseById(id);
        res.json({
            success: true,
            data: result,
        });
    }

    static async createCourse(req: Request, res: Response) {
        const userId = req.user!.id;
        const result = await CoursesService.createCourse(req.body, userId);
        res.status(201).json({
            success: true,
            data: result,
        });
    }

    static async updateCourse(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user!.id;
        const result = await CoursesService.updateCourse(id, req.body, userId);
        res.json({
            success: true,
            data: result,
        });
    }

    static async deleteCourse(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user!.id;
        const result = await CoursesService.deleteCourse(id, userId);
        res.json({
            success: true,
            data: result,
        });
    }
}

export default CoursesController;
