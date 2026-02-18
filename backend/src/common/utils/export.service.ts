import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export class ExportService {
    /**
     * Convert JSON data to CSV format
     */
    static generateCSV<T extends Record<string, any>>(
        data: T[],
        fields?: string[]
    ): string {
        try {
            const parser = new Parser({ fields });
            return parser.parse(data);
        } catch (error) {
            throw new Error(`Failed to generate CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate PDF from data
     */
    static async generatePDF(
        title: string,
        data: Array<Record<string, any>>,
        columns: Array<{ key: string; label: string }>
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Add title
                doc.fontSize(20).text(title, { align: 'center' });
                doc.moveDown();

                // Add generation date
                doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
                doc.moveDown();

                // Add table headers
                const startY = doc.y;
                const columnWidth = (doc.page.width - 100) / columns.length;

                doc.fontSize(12).fillColor('#000');
                columns.forEach((col, i) => {
                    doc.text(col.label, 50 + i * columnWidth, startY, {
                        width: columnWidth,
                        align: 'left',
                    });
                });

                doc.moveDown();
                doc.strokeColor('#000').lineWidth(1);
                doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
                doc.moveDown(0.5);

                // Add table rows
                doc.fontSize(10);
                data.forEach((row) => {
                    const rowY = doc.y;

                    columns.forEach((col, i) => {
                        const value = row[col.key] !== null && row[col.key] !== undefined
                            ? String(row[col.key])
                            : '-';

                        doc.text(value, 50 + i * columnWidth, rowY, {
                            width: columnWidth,
                            align: 'left',
                        });
                    });

                    doc.moveDown(0.5);

                    // Add page break if needed
                    if (doc.y > doc.page.height - 100) {
                        doc.addPage();
                    }
                });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Format data for export by selecting and renaming fields
     */
    static formatDataForExport<T extends Record<string, any>>(
        data: T[],
        fieldMapping: Record<string, string>
    ): Array<Record<string, any>> {
        return data.map((item) => {
            const formatted: Record<string, any> = {};

            Object.entries(fieldMapping).forEach(([originalKey, newKey]) => {
                formatted[newKey] = item[originalKey];
            });

            return formatted;
        });
    }
}
