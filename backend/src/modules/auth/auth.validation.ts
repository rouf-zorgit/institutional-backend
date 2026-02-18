import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        name: z.string().min(2, 'Name must be at least 2 characters'),
        phone: z.string().optional(),
    }),
});

export const refreshSchema = z.object({
    body: z.object({
        refresh_token: z.string().min(1, 'Refresh token is required'),
    }),
});

export const logoutSchema = z.object({
    body: z.object({
        refresh_token: z.string().min(1, 'Refresh token is required'),
    }),
});

export const verifySchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Token is required'),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Token is required'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
});

export const updateRoleSchema = z.object({
    params: z.object({
        userId: z.string().uuid('Invalid user ID'),
    }),
    body: z.object({
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'STUDENT']),
    }),
});
