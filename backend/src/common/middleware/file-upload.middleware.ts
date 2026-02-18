import multer from 'multer';
import { Request } from 'express';
import { AppError } from './errorHandler.middleware';

/**
 * File upload configuration using Multer
 */

// Allowed file types for payment screenshots
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * File filter function
 */
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                400,
                'Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.',
                'INVALID_FILE_TYPE'
            )
        );
    }
};

/**
 * Multer configuration for memory storage
 * Files are stored in memory as Buffer objects
 */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1 // Only one file per upload
    },
    fileFilter
});

/**
 * Middleware for single file upload
 */
export const uploadSingle = (fieldName: string) => {
    return upload.single(fieldName);
};

/**
 * Error handler for multer errors
 */
export const handleMulterError = (error: any, req: Request, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            throw new AppError(
                400,
                `File size exceeds the maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                'FILE_TOO_LARGE'
            );
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            throw new AppError(400, 'Too many files uploaded', 'TOO_MANY_FILES');
        }
        throw new AppError(400, error.message, 'UPLOAD_ERROR');
    }
    next(error);
};
