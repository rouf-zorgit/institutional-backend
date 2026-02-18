import bcrypt from 'bcrypt';
import { prisma } from '../../common/config/database';
import { AppError } from '../../common/middleware/errorHandler.middleware';
import { logger } from '../../common/utils/logger.service';
import { Role, UserStatus, Prisma } from '@prisma/client';

export class UsersService {
    /**
     * Find all users with pagination and filters
     */
    static async findAll(params: {
        page?: number;
        limit?: number;
        role?: Role;
        status?: UserStatus;
        search?: string;
    }) {
        const { page = 1, limit = 10, role, status, search } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {
            deleted_at: null,
            ...(role && { role }),
            ...(status && { status }),
            ...(search && {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { profile: { name: { contains: search, mode: 'insensitive' } } },
                ],
            }),
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: { profile: true },
                orderBy: { created_at: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Find user by ID
     */
    static async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id, deleted_at: null },
            include: { profile: true },
        });

        if (!user) {
            throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
        }

        return user;
    }

    /**
     * Create a new user (admin/staff action)
     */
    static async createUser(data: {
        email: string;
        password_hash: string;
        name: string;
        phone?: string;
        role?: Role;
        status?: UserStatus;
    }) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError(400, 'User with this email already exists', 'USER_EXISTS');
        }

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password_hash: data.password_hash,
                role: data.role || 'STUDENT',
                status: data.status || 'ACTIVE',
                profile: {
                    create: {
                        name: data.name,
                        phone: data.phone,
                    },
                },
            },
            include: { profile: true },
        });

        logger.info('User created via admin activity', { userId: user.id, email: user.email });
        return user;
    }

    /**
     * Update user profile
     */
    static async updateProfile(id: string, data: any) {
        const { name, phone, address, photo_url, documents } = data;

        const user = await prisma.user.update({
            where: { id },
            data: {
                profile: {
                    update: {
                        ...(name && { name }),
                        ...(phone && { phone }),
                        ...(address && { address }),
                        ...(photo_url && { photo_url }),
                        ...(documents && { documents }),
                    },
                },
            },
            include: { profile: true },
        });

        logger.info('User profile updated', { userId: id });
        return user;
    }

    /**
     * Update user status
     */
    static async updateStatus(id: string, status: UserStatus, adminId: string) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { status },
            include: { profile: true },
        });

        await prisma.auditLog.create({
            data: {
                user_id: adminId,
                action: 'STATUS_UPDATE',
                entity: 'user',
                entity_id: id,
                old_value: { status: user.status },
                new_value: { status },
            },
        });

        logger.info('User status updated', { userId: id, status, adminId });
        return updatedUser;
    }

    /**
     * Update user role
     */
    static async updateRole(id: string, role: Role, adminId: string) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            include: { profile: true },
        });

        await prisma.auditLog.create({
            data: {
                user_id: adminId,
                action: 'ROLE_UPDATE',
                entity: 'user',
                entity_id: id,
                old_value: { role: user.role },
                new_value: { role },
            },
        });

        logger.info('User role updated', { userId: id, role, adminId });
        return updatedUser;
    }

    /**
     * Soft delete user
     */
    static async deleteUser(id: string, adminId: string) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
        }

        await prisma.user.update({
            where: { id },
            data: { deleted_at: new Date() },
        });

        await prisma.auditLog.create({
            data: {
                user_id: adminId,
                action: 'USER_DELETE',
                entity: 'user',
                entity_id: id,
            },
        });

        logger.info('User soft deleted', { userId: id, adminId });
        return { success: true, message: 'User deleted successfully' };
    }
}

export default UsersService;
