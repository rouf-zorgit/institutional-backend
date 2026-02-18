import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/common/config/database';
import { clearDatabase } from '../setup';
import bcrypt from 'bcrypt';

describe('Auth Integration Tests', () => {
    beforeEach(async () => {
        await clearDatabase();
    });

    const API_PREFIX = '/api/v1/auth';

    describe('POST /api/v1/auth/register', () => {
        it('should register a new student', async () => {
            const res = await request(app)
                .post(`${API_PREFIX}/register`)
                .send({
                    email: 'student@example.com',
                    password: 'Password123!',
                    name: 'Test Student',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe('student@example.com');
            expect(res.body.data.user.role).toBe('STUDENT');
        });

        it('should fail if email already exists', async () => {
            await prisma.user.create({
                data: {
                    email: 'duplicate@example.com',
                    password_hash: await bcrypt.hash('Password123!', 10),
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    profile: {
                        create: {
                            name: 'Existing User',
                        },
                    },
                },
            });

            const res = await request(app)
                .post(`${API_PREFIX}/register`)
                .send({
                    email: 'duplicate@example.com',
                    password: 'Password123!',
                    name: 'New User',
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const password = 'Password123!';
            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.user.create({
                data: {
                    email: 'login@example.com',
                    password_hash: hashedPassword,
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    profile: {
                        create: {
                            name: 'Login User',
                        },
                    },
                },
            });

            const res = await request(app)
                .post(`${API_PREFIX}/login`)
                .send({
                    email: 'login@example.com',
                    password: password,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('access_token');
            expect(res.body.data).toHaveProperty('refresh_token');
        });

        it('should fail with incorrect password', async () => {
            await prisma.user.create({
                data: {
                    email: 'wrongpass@example.com',
                    password_hash: await bcrypt.hash('Password123!', 10),
                    role: 'STUDENT',
                    status: 'ACTIVE',
                },
            });

            const res = await request(app)
                .post(`${API_PREFIX}/login`)
                .send({
                    email: 'wrongpass@example.com',
                    password: 'WrongPassword!',
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('should returns user profile when authenticated', async () => {
            // 1. Register and login to get token
            await request(app)
                .post(`${API_PREFIX}/register`)
                .send({
                    email: 'me@example.com',
                    password: 'Password123!',
                    name: 'Me User',
                });

            const loginRes = await request(app)
                .post(`${API_PREFIX}/login`)
                .send({
                    email: 'me@example.com',
                    password: 'Password123!',
                });

            const token = loginRes.body.data.access_token;

            const res = await request(app)
                .get(`${API_PREFIX}/me`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('me@example.com');
        });

        it('should fail when no token provided', async () => {
            const res = await request(app).get(`${API_PREFIX}/me`);
            expect(res.status).toBe(401);
        });
    });
});
