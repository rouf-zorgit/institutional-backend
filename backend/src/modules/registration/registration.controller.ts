import { Request, Response, NextFunction } from 'express';
import { RegistrationService } from './registration.service';

export class RegistrationController {
    /**
     * Submit registration (Step 0)
     */
    static async submit(req: Request, res: Response, next: NextFunction) {
        try {
            const registration = await RegistrationService.submitRegistration(req.user!.id, req.body);
            res.status(201).json({
                success: true,
                data: registration
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Step 1: Academic Review
     */
    static async academicReview(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status, admin_notes } = req.body;
            const registration = await RegistrationService.academicReview(id, req.user!.id, status, admin_notes);
            res.json({
                success: true,
                data: registration
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Step 2: Financial Verification
     */
    static async financialVerify(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status, admin_notes } = req.body;
            const registration = await RegistrationService.financialVerify(id, req.user!.id, status, admin_notes);
            res.json({
                success: true,
                data: registration
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Step 3: Final Approval
     */
    static async finalApprove(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status, admin_notes } = req.body;
            const registration = await RegistrationService.finalApprove(id, req.user!.id, status, admin_notes);
            res.json({
                success: true,
                data: registration
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * List all registrations
     */
    static async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { status } = req.query;
            const registrations = await RegistrationService.listRegistrations(status as any);
            res.json({
                success: true,
                data: registrations
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get registration details
     */
    static async get(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const registration = await RegistrationService.getRegistration(id);
            res.json({
                success: true,
                data: registration
            });
        } catch (error) {
            next(error);
        }
    }
}
