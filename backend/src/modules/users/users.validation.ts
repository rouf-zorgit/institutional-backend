import { z } from 'zod';
import { Role, UserStatus } from '@prisma/client';

export const createUserSchema = z.object({
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
        role: z.nativeEnum(Role).optional(),
        status: z.nativeEnum(UserStatus).optional(),
    }),
});

export const updateUserProfileSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID'),
    }),
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        photo_url: z.string().url('Invalid URL').optional(),
        documents: z.any().optional(),
    }),
});

export const updateUserStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID'),
    }),
    body: z.object({
        status: z.nativeEnum(UserStatus),
    }),
});

export const updateUserRoleSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID'),
    }),
    body: z.object({
        role: z.nativeEnum(Role),
    }),
});

export const getUserSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID'),
    }),
});

export const listUsersSchema = z.object({
    query: z.object({
        page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
        limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
        role: z.nativeEnum(Role).optional(),
        status: z.nativeEnum(UserStatus).optional(),
        search: z.string().optional(),
    }),
});
