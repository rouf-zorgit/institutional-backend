import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { prisma } from '../../common/config/database';
import { config } from '../../common/config/env';
import { AppError } from '../../common/middleware/errorHandler.middleware';
import { TokenBlacklistService } from '../../common/utils/tokenBlacklist.service';
import { logger } from '../../common/utils/logger.service';
import { EmailService } from '../../common/utils/email.service';
import { Role } from '@prisma/client';

interface TokenPayload {
    sub: string;
    email: string;
    role: string;
    status: string;
    type: 'access' | 'refresh';
    jti?: string;
    exp?: number;
}

export class AuthService {
    /**
     * Generate access token (short-lived: 15 minutes)
     */
    private static generateAccessToken(user: any): string {
        return jwt.sign(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                type: 'access',
            },
            config.jwt.secret as string,
            { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
        );
    }

    /**
     * Generate refresh token (long-lived: 7 days)
     */
    private static generateRefreshToken(userId: string): string {
        const jti = uuidv4(); // Unique token ID for revocation

        return jwt.sign(
            {
                sub: userId,
                type: 'refresh',
                jti,
            },
            config.jwt.refreshSecret as string,
            { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
        );
    }

    /**
     * Login with email and password
     */
    static async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
        // ... (existing code)
        // 1. Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });

        if (!user) {
            logger.warn('Login attempt with invalid email', { email });
            throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
        }

        // 2. Check if user is active
        if (user.status !== 'ACTIVE') {
            logger.warn('Login attempt for inactive account', { email, status: user.status });
            throw new AppError(403, 'Account is not active', 'ACCOUNT_INACTIVE');
        }

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            logger.warn('Login attempt with invalid password', { email });
            throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
        }

        // 4. Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user.id);

        // 5. Store refresh token in database
        const decoded = jwt.decode(refreshToken) as unknown as TokenPayload;
        await prisma.session.create({
            data: {
                user_id: user.id,
                refresh_token: refreshToken,
                expires_at: new Date(decoded.exp! * 1000),
            },
        });

        // 6. Create audit log
        await prisma.auditLog.create({
            data: {
                user_id: user.id,
                action: 'LOGIN',
                entity: 'auth',
                entity_id: user.id,
                ip_address: ipAddress,
                user_agent: userAgent,
            },
        });

        logger.info('User logged in successfully', { userId: user.id, email: user.email });

        // 7. Return tokens and user info
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                profile: user.profile,
            },
        };
    }

    /**
     * Refresh access token using refresh token
     */
    static async refresh(refreshToken: string) {
        try {
            // 1. Verify refresh token
            const decoded = (jwt.verify(refreshToken, config.jwt.refreshSecret as string)) as unknown as TokenPayload;

            if (decoded.type !== 'refresh') {
                throw new AppError(401, 'Invalid token type', 'INVALID_TOKEN');
            }

            // 2. Check if token exists in database
            const session = await prisma.session.findUnique({
                where: { refresh_token: refreshToken },
                include: { user: { include: { profile: true } } },
            });

            if (!session) {
                logger.warn('Refresh attempt with invalid token', { jti: decoded.jti });
                throw new AppError(401, 'Invalid refresh token', 'INVALID_TOKEN');
            }

            // 3. Check if user is still active
            if (session.user.status !== 'ACTIVE') {
                logger.warn('Refresh attempt for inactive account', { userId: session.user.id });
                throw new AppError(403, 'Account is not active', 'ACCOUNT_INACTIVE');
            }

            // 4. Generate new access token
            const newAccessToken = this.generateAccessToken(session.user);

            // 5. Rotate refresh token (security best practice)
            const newRefreshToken = this.generateRefreshToken(session.user.id);
            const newDecoded = jwt.decode(newRefreshToken) as unknown as TokenPayload;

            // Update session with new refresh token
            await prisma.session.update({
                where: { id: session.id },
                data: {
                    refresh_token: newRefreshToken,
                    expires_at: new Date(newDecoded.exp! * 1000),
                },
            });

            logger.info('Token refreshed successfully', { userId: session.user.id });

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
                throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_TOKEN');
            }
            throw error;
        }
    }

    /**
     * Logout (single device)
     */
    static async logout(refreshToken: string, accessToken: string, userId: string, ipAddress?: string, userAgent?: string) {
        // 1. Delete refresh token from database
        await prisma.session.deleteMany({
            where: { refresh_token: refreshToken },
        });

        // 2. Blacklist access token (until it expires)
        const decoded = jwt.decode(accessToken) as unknown as TokenPayload;
        const expiresAt = new Date(decoded.exp! * 1000);
        await TokenBlacklistService.blacklistToken(accessToken, expiresAt);

        // 3. Create audit log
        await prisma.auditLog.create({
            data: {
                user_id: userId,
                action: 'LOGOUT',
                entity: 'auth',
                entity_id: userId,
                ip_address: ipAddress,
                user_agent: userAgent,
            },
        });

        logger.info('User logged out successfully', { userId });

        return { message: 'Logged out successfully' };
    }

    /**
     * Logout from all devices
     */
    static async logoutAll(userId: string, accessToken: string, ipAddress?: string, userAgent?: string) {
        // 1. Delete all user sessions
        await prisma.session.deleteMany({
            where: { user_id: userId },
        });

        // 2. Blacklist all user tokens
        const decoded = jwt.decode(accessToken) as unknown as TokenPayload;
        const expiresAt = new Date(decoded.exp! * 1000);
        await TokenBlacklistService.blacklistUserTokens(userId, expiresAt);

        // 3. Create audit log
        await prisma.auditLog.create({
            data: {
                user_id: userId,
                action: 'LOGOUT_ALL',
                entity: 'auth',
                entity_id: userId,
                ip_address: ipAddress,
                user_agent: userAgent,
            },
        });

        logger.info('User logged out from all devices', { userId });

        return { message: 'Logged out from all devices successfully' };
    }

    /**
     * Register new user
     */
    static async register(data: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role?: string;
    }) {
        // 1. Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError(400, 'Email already exists', 'EMAIL_EXISTS');
        }

        // 2. Hash password
        const password_hash = await bcrypt.hash(data.password, 10);

        // 3. Create user with profile
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password_hash,
                role: (data.role as Role) || 'STUDENT',
                status: 'ACTIVE',
                profile: {
                    create: {
                        name: data.name,
                        phone: data.phone,
                    },
                },
            },
            include: { profile: true },
        });

        logger.info('New user registered', { userId: user.id, email: user.email });

        // 4. Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user.id);

        // 5. Store refresh token
        const decoded = jwt.decode(refreshToken) as unknown as TokenPayload;
        await prisma.session.create({
            data: {
                user_id: user.id,
                refresh_token: refreshToken,
                expires_at: new Date(decoded.exp! * 1000),
            },
        });

        // 6. Send welcome email
        await EmailService.sendWelcomeEmail(user.email, user.profile!.name);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                profile: user.profile as any,
            },
        };
    }

    /**
     * Verify access token
     */
    static async verifyToken(token: string) {
        try {
            // Check if blacklisted
            const isBlacklisted = await TokenBlacklistService.isBlacklisted(token);
            if (isBlacklisted) {
                throw new AppError(401, 'Token has been revoked', 'TOKEN_REVOKED');
            }

            // Verify token
            const decoded = (jwt.verify(token, config.jwt.secret as string)) as unknown as TokenPayload;

            if (decoded.type !== 'access') {
                throw new AppError(401, 'Invalid token type', 'INVALID_TOKEN');
            }

            // Check if user tokens are globally blacklisted
            const isUserBlacklisted = await TokenBlacklistService.isUserBlacklisted(decoded.sub);
            if (isUserBlacklisted) {
                throw new AppError(401, 'All user tokens have been revoked', 'TOKEN_REVOKED');
            }

            return {
                userId: decoded.sub,
                email: decoded.email,
                role: decoded.role,
                status: decoded.status,
            };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError(401, 'Invalid token', 'INVALID_TOKEN');
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new AppError(401, 'Token expired', 'TOKEN_EXPIRED');
            }
            throw error;
        }
    }

    /**
     * Forgot Password - Generate and send reset token
     */
    static async forgotPassword(email: string) {
        // 1. Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Dev tip: Don't reveal if email exists for security, 
            // but for this implementation we can just return success
            logger.info('Forgot password requested for non-existent email', { email });
            return { message: 'If an account with that email exists, a reset link has been sent.' };
        }

        // 2. Generate random token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

        // 3. Store token in database
        await (prisma as any).passwordResetToken.create({
            data: {
                email,
                token,
                expires_at: expiresAt,
            },
        });

        // 4. Send email
        await EmailService.sendPasswordResetEmail(email, token);

        logger.info('Password reset token generated', { email });

        return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    /**
     * Reset Password using token
     */
    static async resetPassword(token: string, password_new: string) {
        // 1. Find and validate token
        const resetToken = await (prisma as any).passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken || resetToken.expires_at < new Date()) {
            throw new AppError(400, 'Invalid or expired reset token', 'INVALID_TOKEN');
        }

        // 2. Update user password
        const password_hash = await bcrypt.hash(password_new, 10);
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password_hash },
        });

        // 3. Delete the used token
        await (prisma as any).passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        // 4. Blacklist all current tokens for this user for security
        const user = await prisma.user.findUnique({ where: { email: resetToken.email } });
        if (user) {
            await TokenBlacklistService.blacklistUserTokens(user.id, new Date(Date.now() + 3600000));
        }

        logger.info('Password reset successfully', { email: resetToken.email });

        return { message: 'Password has been reset successfully.' };
    }

    /**
     * Update user role (Super Admin only)
     */
    static async updateRole(adminId: string, targetUserId: string, newRole: Role) {
        // 1. Ensure target user exists
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
        }

        // 2. Update role
        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole },
            include: { profile: true },
        });

        // 3. Create audit log
        await prisma.auditLog.create({
            data: {
                user_id: adminId,
                action: 'ROLE_UPDATE',
                entity: 'user',
                entity_id: targetUserId,
                old_value: { role: targetUser.role },
                new_value: { role: newRole },
            },
        });

        logger.info('User role updated', { targetUserId, newRole, adminId });

        return updatedUser;
    }
}

export default AuthService;
