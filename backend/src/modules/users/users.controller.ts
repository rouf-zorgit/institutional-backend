import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { Role, UserStatus } from '@prisma/client';

export class UsersController {
    /**
     * GET /api/v1/users
     */
    static async list(req: Request, res: Response) {
        const { page, limit, role, status, search } = req.query;

        const result = await UsersService.findAll({
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
            role: role as Role,
            status: status as UserStatus,
            search: search as string,
        });

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * GET /api/v1/users/:id
     */
    static async get(req: Request, res: Response) {
        const { id } = req.params;
        const result = await UsersService.findById(id);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * POST /api/v1/users
     */
    static async create(req: Request, res: Response) {
        const { email, password, name, phone, role, status } = req.body;

        const password_hash = await bcrypt.hash(password, 10);

        const result = await UsersService.createUser({
            email,
            password_hash,
            name,
            phone,
            role,
            status,
        });

        res.status(201).json({
            success: true,
            data: result,
        });
    }

    /**
     * PATCH /api/v1/users/:id
     */
    static async updateProfile(req: Request, res: Response) {
        const { id } = req.params;
        const result = await UsersService.updateProfile(id, req.body);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * PATCH /api/v1/users/:id/status
     */
    static async updateStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = req.user!.id;

        const result = await UsersService.updateStatus(id, status, adminId);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * PATCH /api/v1/users/:id/role
     */
    static async updateRole(req: Request, res: Response) {
        const { id } = req.params;
        const { role } = req.body;
        const adminId = req.user!.id;

        const result = await UsersService.updateRole(id, role, adminId);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * DELETE /api/v1/users/:id
     */
    static async delete(req: Request, res: Response) {
        const { id } = req.params;
        const adminId = req.user!.id;

        const result = await UsersService.deleteUser(id, adminId);

        res.json({
            success: true,
            data: result,
        });
    }
}

export default UsersController;
