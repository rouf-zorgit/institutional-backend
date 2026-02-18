import { prisma } from '../src/common/config/database';
import { redis } from '../src/common/config/redis';

// Mock Redis and Ratelimit to avoid external connections during tests
jest.mock('../src/common/config/redis', () => ({
    __esModule: true,
    redis: {
        get: jest.fn(),
        set: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
        ping: jest.fn().mockResolvedValue('PONG'),
        quit: jest.fn(),
    },
    default: {
        get: jest.fn(),
        set: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
        ping: jest.fn().mockResolvedValue('PONG'),
        quit: jest.fn(),
    },
}));

jest.mock('@upstash/ratelimit', () => {
    const mockRatelimit = jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockResolvedValue({
            success: true,
            limit: 10,
            remaining: 9,
            reset: Date.now() + 1000,
        }),
    }));

    // Add static methods
    (mockRatelimit as any).slidingWindow = jest.fn().mockReturnValue({});
    (mockRatelimit as any).fixedWindow = jest.fn().mockReturnValue({});

    return {
        __esModule: true,
        Ratelimit: mockRatelimit,
    };
});

beforeAll(async () => {
    // Ensure database connection
    try {
        await prisma.$connect();
    } catch (error) {
        console.error('Failed to connect to database for testing', error);
        process.exit(1);
    }
});

afterAll(async () => {
    // Disconnect from database
    await prisma.$disconnect();
    // Close redis connection (if it was a real connection)
    await (redis as any).quit?.();
});

// Helper to clear all tables
export const clearDatabase = async () => {
    const tablenames = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
        `SELECT tablename FROM pg_tables WHERE schemaname='public'`
    );

    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');

    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
        console.log({ error });
    }
};
