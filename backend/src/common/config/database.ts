import { PrismaClient } from '@prisma/client';
import { config } from './env';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: config.database.poolerUrl, // Use pooled connection
            },
        },
    });

if (!config.isProduction) {
    globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;
