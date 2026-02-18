import PDFDocument from 'pdfkit';
import { prisma } from '../../common/config/database';
import { StorageService } from '../../common/utils/storage.service';
import { logger } from '../../common/utils/logger.service';
import { AppError } from '../../common/middleware/errorHandler.middleware';

/**
 * Invoice Generation Service
 */
export class InvoiceService {
    /**
     * Generate unique invoice number
     * Format: INV-YYYYMMDD-XXXX
     */
    private static async generateInvoiceNumber(): Promise<string> {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

        // Get count of invoices created today
        const todayStart = new Date(date.setHours(0, 0, 0, 0));
        const todayEnd = new Date(date.setHours(23, 59, 59, 999));

        const count = await prisma.invoice.count({
            where: {
                generated_at: {
                    gte: todayStart,
                    lte: todayEnd
                }
            }
        });

        const sequence = String(count + 1).padStart(4, '0');
        return `INV-${dateStr}-${sequence}`;
    }

    /**
     * Generate invoice PDF
     */
    private static async generateInvoicePDF(data: {
        invoiceNumber: string;
        studentName: string;
        studentEmail: string;
        courseName: string;
        batchName: string;
        amount: string;
        transactionId: string;
        paymentMethod: string;
        paymentDate: Date;
    }): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(24)
                .font('Helvetica-Bold')
                .text('PAYMENT INVOICE', { align: 'center' })
                .moveDown();

            // Institution Info (customize as needed)
            doc.fontSize(10)
                .font('Helvetica')
                .text('Institutional Management System', { align: 'center' })
                .text('Email: info@institution.edu', { align: 'center' })
                .moveDown(2);

            // Invoice Details Box
            const startY = doc.y;
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text(`Invoice Number: ${data.invoiceNumber}`)
                .font('Helvetica')
                .text(`Date: ${new Date().toLocaleDateString()}`)
                .moveDown();

            // Student Details
            doc.font('Helvetica-Bold').text('Bill To:');
            doc.font('Helvetica')
                .text(data.studentName)
                .text(data.studentEmail)
                .moveDown(2);

            // Payment Details Table
            const tableTop = doc.y;
            const col1X = 50;
            const col2X = 300;

            // Table Header
            doc.font('Helvetica-Bold')
                .fontSize(11)
                .text('Description', col1X, tableTop)
                .text('Amount', col2X, tableTop);

            doc.moveTo(col1X, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();

            // Table Content
            let currentY = tableTop + 25;
            doc.font('Helvetica')
                .fontSize(10)
                .text(`Course: ${data.courseName}`, col1X, currentY)
                .text(`₹${data.amount}`, col2X, currentY);

            currentY += 20;
            doc.text(`Batch: ${data.batchName}`, col1X, currentY);

            currentY += 30;
            doc.moveTo(col1X, currentY)
                .lineTo(550, currentY)
                .stroke();

            // Total
            currentY += 10;
            doc.font('Helvetica-Bold')
                .fontSize(12)
                .text('Total Amount:', col1X, currentY)
                .text(`₹${data.amount}`, col2X, currentY);

            currentY += 40;
            doc.moveTo(col1X, currentY)
                .lineTo(550, currentY)
                .stroke();

            // Payment Information
            currentY += 20;
            doc.font('Helvetica-Bold')
                .fontSize(11)
                .text('Payment Information:', col1X, currentY);

            currentY += 20;
            doc.font('Helvetica')
                .fontSize(10)
                .text(`Transaction ID: ${data.transactionId}`, col1X, currentY);

            currentY += 15;
            doc.text(`Payment Method: ${data.paymentMethod}`, col1X, currentY);

            currentY += 15;
            doc.text(`Payment Date: ${data.paymentDate.toLocaleDateString()}`, col1X, currentY);

            // Footer
            doc.fontSize(8)
                .font('Helvetica-Oblique')
                .text(
                    'This is a computer-generated invoice and does not require a signature.',
                    50,
                    750,
                    { align: 'center', width: 500 }
                );

            doc.end();
        });
    }

    /**
     * Create invoice for approved payment
     */
    static async createInvoice(paymentId: string, generatedBy: string) {
        try {
            // Get payment details
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: {
                    enrollment: {
                        include: {
                            batch: {
                                include: {
                                    course: true
                                }
                            },
                            student: {
                                include: {
                                    profile: true
                                }
                            }
                        }
                    }
                }
            });

            if (!payment) {
                throw new AppError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
            }

            if (payment.status !== 'APPROVED') {
                throw new AppError(
                    400,
                    'Invoice can only be generated for approved payments',
                    'PAYMENT_NOT_APPROVED'
                );
            }

            // Check if invoice already exists
            const existingInvoice = await prisma.invoice.findUnique({
                where: { payment_id: paymentId }
            });

            if (existingInvoice) {
                logger.info('Invoice already exists for payment', { paymentId });
                return existingInvoice;
            }

            // Generate invoice number
            const invoiceNumber = await this.generateInvoiceNumber();

            // Generate PDF
            const pdfBuffer = await this.generateInvoicePDF({
                invoiceNumber,
                studentName: payment.enrollment.student.profile?.name || 'N/A',
                studentEmail: payment.enrollment.student.email,
                courseName: payment.enrollment.batch.course.title,
                batchName: payment.enrollment.batch.name,
                amount: payment.amount.toString(),
                transactionId: payment.transaction_id,
                paymentMethod: payment.payment_method,
                paymentDate: payment.approved_at || payment.created_at
            });

            // Save PDF to storage
            const filename = `${invoiceNumber}.pdf`;
            const pdfUrl = await StorageService.saveBuffer(pdfBuffer, filename, 'invoices');

            // Create invoice record
            const invoice = await prisma.invoice.create({
                data: {
                    payment_id: paymentId,
                    invoice_number: invoiceNumber,
                    pdf_url: pdfUrl,
                    generated_by: generatedBy
                }
            });

            logger.info('Invoice generated successfully', {
                invoiceId: invoice.id,
                invoiceNumber,
                paymentId
            });

            return invoice;
        } catch (error) {
            logger.error('Invoice generation failed', error, { paymentId });
            throw error;
        }
    }

    /**
     * Get invoice by ID
     */
    static async getInvoiceById(invoiceId: string) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                payment: {
                    include: {
                        enrollment: {
                            include: {
                                batch: {
                                    include: {
                                        course: true
                                    }
                                },
                                student: {
                                    include: {
                                        profile: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!invoice) {
            throw new AppError(404, 'Invoice not found', 'INVOICE_NOT_FOUND');
        }

        return invoice;
    }

    /**
     * Get invoice by payment ID
     */
    static async getInvoiceByPaymentId(paymentId: string) {
        const invoice = await prisma.invoice.findUnique({
            where: { payment_id: paymentId },
            include: {
                payment: {
                    include: {
                        enrollment: {
                            include: {
                                batch: {
                                    include: {
                                        course: true
                                    }
                                },
                                student: {
                                    include: {
                                        profile: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!invoice) {
            throw new AppError(404, 'Invoice not found for this payment', 'INVOICE_NOT_FOUND');
        }

        return invoice;
    }

    /**
     * Download invoice PDF
     */
    static async downloadInvoice(invoiceId: string): Promise<{ buffer: Buffer; filename: string }> {
        const invoice = await this.getInvoiceById(invoiceId);

        try {
            const buffer = await StorageService.getFile(invoice.pdf_url);
            return {
                buffer,
                filename: `${invoice.invoice_number}.pdf`
            };
        } catch (error) {
            logger.error('Invoice download failed', error, { invoiceId });
            throw new AppError(500, 'Failed to download invoice', 'DOWNLOAD_FAILED');
        }
    }
}
