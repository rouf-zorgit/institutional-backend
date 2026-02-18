import nodemailer from 'nodemailer';
import { prisma } from '../../common/config/database';
import { logger } from './logger.service';

type EmailType = 'REGISTRATION_APPROVED' | 'REGISTRATION_REJECTED' | 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED' | 'ASSIGNMENT_DEADLINE' | 'LOW_ATTENDANCE';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    userId: string;
    type: EmailType;
}

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    /**
     * Send email and log to database
     */
    static async sendEmail(options: EmailOptions): Promise<void> {
        const emailLog = await prisma.emailLog.create({
            data: {
                user_id: options.userId,
                type: options.type,
                subject: options.subject,
                status: 'PENDING',
            },
        });

        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || 'noreply@institution.com',
                to: options.to,
                subject: options.subject,
                html: options.html,
            });

            await prisma.emailLog.update({
                where: { id: emailLog.id },
                data: {
                    status: 'SENT',
                    sent_at: new Date(),
                },
            });

            logger.info('Email sent successfully', {
                emailLogId: emailLog.id,
                to: options.to,
                type: options.type,
            });
        } catch (error) {
            await prisma.emailLog.update({
                where: { id: emailLog.id },
                data: {
                    status: 'FAILED',
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
            });

            logger.error('Failed to send email', {
                emailLogId: emailLog.id,
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            throw error;
        }
    }

    /**
     * Send a password reset email
     */
    static async sendPasswordResetEmail(email: string, token: string) {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        logger.info(`[EmailService] Password reset link for ${email}: ${resetLink}`);
        // TODO: Implement with actual email sending when user_id is available
        return true;
    }

    /**
     * Send a welcome email
     */
    static async sendWelcomeEmail(email: string, name: string) {
        logger.info(`[EmailService] Welcome email sent to ${name} (${email})`);
        // TODO: Implement with actual email sending when user_id is available
        return true;
    }

    /**
     * Registration approval email template
     */
    static async sendRegistrationApproval(
        email: string,
        userId: string,
        studentName: string,
        courseName: string
    ): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Registration Approved!</h2>
                <p>Dear ${studentName},</p>
                <p>Congratulations! Your registration for <strong>${courseName}</strong> has been approved.</p>
                <p>You can now proceed with enrollment and payment.</p>
                <p>Best regards,<br/>Academic Team</p>
            </div>
        `;

        await this.sendEmail({
            to: email,
            subject: 'Registration Approved',
            html,
            userId,
            type: 'REGISTRATION_APPROVED',
        });
    }

    /**
     * Registration rejection email template
     */
    static async sendRegistrationRejection(
        email: string,
        userId: string,
        studentName: string,
        courseName: string,
        reason?: string
    ): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f44336;">Registration Not Approved</h2>
                <p>Dear ${studentName},</p>
                <p>We regret to inform you that your registration for <strong>${courseName}</strong> was not approved.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>Please contact the academic office for more information.</p>
                <p>Best regards,<br/>Academic Team</p>
            </div>
        `;

        await this.sendEmail({
            to: email,
            subject: 'Registration Update',
            html,
            userId,
            type: 'REGISTRATION_REJECTED',
        });
    }

    /**
     * Payment approval email template
     */
    static async sendPaymentApproval(
        email: string,
        userId: string,
        studentName: string,
        amount: number,
        invoiceUrl?: string
    ): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Payment Approved!</h2>
                <p>Dear ${studentName},</p>
                <p>Your payment of <strong>৳${amount}</strong> has been approved.</p>
                ${invoiceUrl ? `<p><a href="${invoiceUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Invoice</a></p>` : ''}
                <p>Thank you for your payment!</p>
                <p>Best regards,<br/>Finance Team</p>
            </div>
        `;

        await this.sendEmail({
            to: email,
            subject: 'Payment Approved',
            html,
            userId,
            type: 'PAYMENT_APPROVED',
        });
    }

    /**
     * Payment rejection email template
     */
    static async sendPaymentRejection(
        email: string,
        userId: string,
        studentName: string,
        amount: number,
        reason?: string
    ): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f44336;">Payment Not Approved</h2>
                <p>Dear ${studentName},</p>
                <p>Your payment of <strong>৳${amount}</strong> was not approved.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>Please resubmit your payment with the correct information.</p>
                <p>Best regards,<br/>Finance Team</p>
            </div>
        `;

        await this.sendEmail({
            to: email,
            subject: 'Payment Update',
            html,
            userId,
            type: 'PAYMENT_REJECTED',
        });
    }

    /**
     * Assignment deadline reminder email template
     */
    static async sendAssignmentDeadlineReminder(
        email: string,
        userId: string,
        studentName: string,
        assignmentTitle: string,
        deadline: Date
    ): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FF9800;">Assignment Deadline Reminder</h2>
                <p>Dear ${studentName},</p>
                <p>This is a reminder that the assignment <strong>${assignmentTitle}</strong> is due on <strong>${deadline.toLocaleDateString()}</strong>.</p>
                <p>Please submit your assignment before the deadline.</p>
                <p>Best regards,<br/>Academic Team</p>
            </div>
        `;

        await this.sendEmail({
            to: email,
            subject: `Assignment Deadline: ${assignmentTitle}`,
            html,
            userId,
            type: 'ASSIGNMENT_DEADLINE',
        });
    }

    /**
     * Low attendance warning email template
     */
    static async sendLowAttendanceWarning(
        email: string,
        userId: string,
        studentName: string,
        attendancePercentage: number,
        batchName: string
    ): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f44336;">Low Attendance Warning</h2>
                <p>Dear ${studentName},</p>
                <p>Your attendance in <strong>${batchName}</strong> is currently at <strong>${attendancePercentage}%</strong>.</p>
                <p>Please ensure you maintain at least 75% attendance to remain eligible for the course.</p>
                <p>Best regards,<br/>Academic Team</p>
            </div>
        `;

        await this.sendEmail({
            to: email,
            subject: 'Low Attendance Warning',
            html,
            userId,
            type: 'LOW_ATTENDANCE',
        });
    }
}

export default EmailService;
