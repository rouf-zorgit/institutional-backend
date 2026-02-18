import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.service';
import { supabaseAdmin } from '../config/supabase';
import { config } from '../config/env';

/**
 * Storage Service - Abstraction for file storage
 * Supports local filesystem in development and Supabase Storage in production
 */
export class StorageService {
    private static baseDir = process.env.STORAGE_PATH || './storage';

    /**
     * Initialize storage directories (local only)
     */
    static async initialize() {
        if (config.isProduction) {
            logger.info('Storage initialized for Supabase in production mode');
            return;
        }

        const dirs = [
            path.join(this.baseDir, 'payments'),
            path.join(this.baseDir, 'invoices'),
            path.join(this.baseDir, 'assignments'),
            path.join(this.baseDir, 'study-materials'),
            path.join(this.baseDir, 'temp')
        ];

        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
                logger.info(`Storage directory created/verified: ${dir}`);
            } catch (error) {
                logger.error(`Failed to create storage directory: ${dir}`, error);
                throw error;
            }
        }
    }

    /**
     * Upload file to storage
     */
    static async uploadFile(
        file: Express.Multer.File,
        category: 'payments' | 'invoices' | 'assignments' | 'study-materials' | 'temp'
    ): Promise<string> {
        const filename = `${Date.now()}-${file.originalname}`;

        if (config.isProduction) {
            const { data, error } = await supabaseAdmin.storage
                .from(category)
                .upload(filename, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                });

            if (error) {
                logger.error('Supabase upload failed', error, { filename, category });
                throw new Error('Failed to upload file to Supabase');
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from(category)
                .getPublicUrl(filename);

            logger.info('File uploaded to Supabase Storage', { publicUrl, category });
            return publicUrl;
        } else {
            const filepath = path.join(this.baseDir, category, filename);
            try {
                await fs.writeFile(filepath, file.buffer);
                logger.info('File uploaded to local storage', { filepath, category });
                return `/storage/${category}/${filename}`;
            } catch (error) {
                logger.error('Local file upload failed', error, { filepath });
                throw new Error('Failed to upload file locally');
            }
        }
    }

    /**
     * Save buffer to storage (for generated files like PDFs)
     */
    static async saveBuffer(
        buffer: Buffer,
        filename: string,
        category: 'payments' | 'invoices' | 'temp'
    ): Promise<string> {
        if (config.isProduction) {
            const { data, error } = await supabaseAdmin.storage
                .from(category)
                .upload(filename, buffer, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (error) {
                logger.error('Supabase buffer save failed', error, { filename, category });
                throw new Error('Failed to save buffer to Supabase');
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from(category)
                .getPublicUrl(filename);

            logger.info('Buffer saved to Supabase Storage', { publicUrl, category });
            return publicUrl;
        } else {
            const filepath = path.join(this.baseDir, category, filename);
            try {
                await fs.writeFile(filepath, buffer);
                logger.info('Buffer saved to local storage', { filepath, category });
                return `/storage/${category}/${filename}`;
            } catch (error) {
                logger.error('Local buffer save failed', error, { filepath });
                throw new Error('Failed to save buffer locally');
            }
        }
    }

    /**
     * Get file from storage
     */
    static async getFile(relativePath: string): Promise<Buffer> {
        if (config.isProduction) {
            // relativePath for Supabase might be a full URL or a path within a bucket
            // If it's a full URL, we need to extract the bucket and path
            try {
                const url = new URL(relativePath);
                const pathParts = url.pathname.split('/storage/v1/object/public/')[1]?.split('/');
                if (!pathParts || pathParts.length < 2) {
                    throw new Error('Invalid Supabase URL');
                }
                const bucket = pathParts[0];
                const filePath = pathParts.slice(1).join('/');

                const { data, error } = await supabaseAdmin.storage
                    .from(bucket)
                    .download(filePath);

                if (error || !data) {
                    logger.error('Supabase file download failed', error, { relativePath });
                    throw new Error('File not found in Supabase');
                }

                return Buffer.from(await data.arrayBuffer());
            } catch (error) {
                logger.error('Error downloading from Supabase', error, { relativePath });
                throw new Error('Failed to get file from Supabase');
            }
        } else {
            const cleanPath = relativePath.replace(/^\/storage\//, '');
            const filepath = path.join(this.baseDir, cleanPath);

            try {
                const buffer = await fs.readFile(filepath);
                return buffer;
            } catch (error) {
                logger.error('Local file retrieval failed', error, { filepath });
                throw new Error('File not found locally');
            }
        }
    }

    /**
     * Delete file from storage
     */
    static async deleteFile(relativePath: string): Promise<void> {
        if (config.isProduction) {
            try {
                const url = new URL(relativePath);
                const pathParts = url.pathname.split('/storage/v1/object/public/')[1]?.split('/');
                if (!pathParts || pathParts.length < 2) {
                    throw new Error('Invalid Supabase URL');
                }
                const bucket = pathParts[0];
                const filePath = pathParts.slice(1).join('/');

                const { error } = await supabaseAdmin.storage
                    .from(bucket)
                    .remove([filePath]);

                if (error) {
                    logger.error('Supabase file deletion failed', error, { relativePath });
                    throw new Error('Failed to delete file from Supabase');
                }

                logger.info('File deleted from Supabase Storage', { relativePath });
            } catch (error) {
                logger.error('Error deleting from Supabase', error, { relativePath });
                throw new Error('Failed to delete file from Supabase');
            }
        } else {
            const cleanPath = relativePath.replace(/^\/storage\//, '');
            const filepath = path.join(this.baseDir, cleanPath);

            try {
                await fs.unlink(filepath);
                logger.info('File deleted from local storage', { filepath });
            } catch (error) {
                logger.error('Local file deletion failed', error, { filepath });
                throw new Error('Failed to delete file locally');
            }
        }
    }

    /**
     * Get absolute file path (local only)
     */
    static getAbsolutePath(relativePath: string): string {
        if (config.isProduction) {
            // For production/Supabase, we don't have a local absolute path
            // This might need rethinking if other services depend on local paths
            logger.warn('getAbsolutePath called in production mode. This may not return a valid local path.');
            return relativePath;
        }
        const cleanPath = relativePath.replace(/^\/storage\//, '');
        return path.join(this.baseDir, cleanPath);
    }
}
