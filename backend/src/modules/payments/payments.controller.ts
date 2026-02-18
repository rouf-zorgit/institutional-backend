import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { InvoiceService } from './invoice.service';
import { StorageService } from '@/common/utils/storage.service';

export class PaymentsController {
    /**
     * POST /api/v1/payments - Upload payment
     */
    static async uploadPayment(req: Request, res: Response) {
        const { enrollment_id, amount, transaction_id, phone_number, payment_method, notes } = req.body;
        const student_id = req.user!.id;
        const screenshot = req.file;

        if (!screenshot) {
            return res.status(400).json({
                success: false,
                message: 'Payment screenshot is required'
            });
        }

        const payment = await PaymentsService.createPayment({
            enrollment_id,
            student_id,
            amount: parseFloat(amount),
            transaction_id,
            phone_number,
            payment_method,
            notes,
            screenshot
        });

        return res.status(201).json({
            success: true,
            message: 'Payment uploaded successfully',
            data: payment
        });
    }

    /**
     * GET /api/v1/payments - List all payments with filters
     */
    static async listPayments(req: Request, res: Response) {
        const { page, pageSize, status, student_id, enrollment_id, date_from, date_to } = req.query;

        const result = await PaymentsService.listPayments({
            page: page ? parseInt(page as string) : undefined,
            pageSize: pageSize ? parseInt(pageSize as string) : undefined,
            status: status as any,
            student_id: student_id as string,
            enrollment_id: enrollment_id as string,
            date_from: date_from ? new Date(date_from as string) : undefined,
            date_to: date_to ? new Date(date_to as string) : undefined
        });

        return res.json({
            success: true,
            data: result.payments,
            pagination: result.pagination
        });
    }

    /**
     * GET /api/v1/payments/my-payments - Get logged-in student's payments
     */
    static async getMyPayments(req: Request, res: Response) {
        const student_id = req.user!.id;
        const { page, pageSize } = req.query;

        const result = await PaymentsService.getStudentPaymentHistory(
            student_id,
            page ? parseInt(page as string) : undefined,
            pageSize ? parseInt(pageSize as string) : undefined
        );

        return res.json({
            success: true,
            data: result.payments,
            pagination: result.pagination
        });
    }

    /**
     * GET /api/v1/payments/:id/invoice - Download invoice
     */
    static async downloadInvoice(req: Request, res: Response) {
        const { id } = req.params;

        // Get payment to check if invoice exists
        const payment = await PaymentsService.getPayment(id);

        if (!payment.invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found for this payment'
            });
        }

        // Download invoice
        const { buffer, filename } = await InvoiceService.downloadInvoice(payment.invoice.id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);
    }

    /**
     * POST /api/v1/payments/:id/approve
     */
    static async approvePayment(req: Request, res: Response) {
        const { id } = req.params;
        const approvedBy = req.user!.id;

        // Get idempotency key from header
        const idempotencyKey = req.headers['idempotency-key'] as string;

        const result = await PaymentsService.approvePayment(
            id,
            approvedBy,
            idempotencyKey
        );

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * POST /api/v1/payments/:id/reject
     */
    static async rejectPayment(req: Request, res: Response) {
        const { id } = req.params;
        const { reason } = req.body;
        const rejectedBy = req.user!.id;

        const idempotencyKey = req.headers['idempotency-key'] as string;

        const result = await PaymentsService.rejectPayment(
            id,
            rejectedBy,
            reason,
            idempotencyKey
        );

        res.json({
            success: true,
            data: result,
        });
    }

    /**
     * GET /api/v1/payments/:id
     */
    static async getPayment(req: Request, res: Response) {
        const { id } = req.params;

        const payment = await PaymentsService.getPayment(id);

        res.json({
            success: true,
            data: payment,
        });
    }

    /**
     * GET /api/v1/payments/pending
     */
    static async getPendingPayments(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;

        const result = await PaymentsService.getPendingPayments(page, pageSize);

        res.json({
            success: true,
            data: result,
        });
    }
}

export default PaymentsController;
