import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
    /**
     * POST /api/auth/login
     */
    static async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        const result = await AuthService.login(email, password, ipAddress, userAgent);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * POST /api/auth/register
     */
    static async register(req: Request, res: Response) {
        const { email, password, name, phone } = req.body;

        const result = await AuthService.register({
            email,
            password,
            name,
            phone,
        });

        res.status(201).json({
            success: true,
            data: result,
        });
    }

    /**
     * POST /api/auth/refresh
     */
    static async refresh(req: Request, res: Response) {
        const { refresh_token } = req.body;

        const result = await AuthService.refresh(refresh_token);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * POST /api/auth/logout
     */
    static async logout(req: Request, res: Response) {
        const { refresh_token } = req.body;
        const accessToken = req.headers.authorization?.substring(7) || '';
        const userId = req.user!.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        const result = await AuthService.logout(refresh_token, accessToken, userId, ipAddress, userAgent);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * POST /api/auth/logout-all
     */
    static async logoutAll(req: Request, res: Response) {
        const accessToken = req.headers.authorization?.substring(7) || '';
        const userId = req.user!.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        const result = await AuthService.logoutAll(userId, accessToken, ipAddress, userAgent);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * GET /api/auth/me
     */
    static async me(req: Request, res: Response) {
        const user = req.user!;

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });
    }

    /**
     * POST /api/auth/verify
     */
    static async verify(req: Request, res: Response) {
        const { token } = req.body;

        const result = await AuthService.verifyToken(token);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * POST /api/auth/forgot-password
     */
    static async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;

        const result = await AuthService.forgotPassword(email);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * POST /api/auth/reset-password
     */
    static async resetPassword(req: Request, res: Response) {
        const { token, password } = req.body;

        const result = await AuthService.resetPassword(token, password);

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * PATCH /api/auth/users/:userId/role
     */
    static async updateRole(req: Request, res: Response) {
        const { userId } = req.params;
        const { role } = req.body;
        const adminId = req.user!.id;

        const result = await AuthService.updateRole(adminId, userId, role);

        res.json({
            success: true,
            data: result,
        });
    }
}

export default AuthController;
