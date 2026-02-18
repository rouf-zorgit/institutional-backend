import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';

import { config } from './common/config/env';
import { errorHandler, notFoundHandler } from './common/middleware/errorHandler.middleware';
import { logger } from './common/utils/logger.service';
import { StorageService } from './common/utils/storage.service';

// Initialize Express app
const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.app.allowedOrigins,
    credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from storage
app.use('/storage', express.static('storage'));

// Logging middleware
if (config.isDevelopment) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// API routes
import apiRoutes from './api';
app.use('/api', apiRoutes);

// Health check endpoint
import { prisma } from './common/config/database';
import { redis } from './common/config/redis';
import { supabaseAdmin } from './common/config/supabase';

app.get('/health', async (req, res) => {
    const health: any = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
        services: {
            database: 'unknown',
            redis: 'unknown',
            supabase: 'unknown',
        }
    };

    // Check Database
    try {
        await prisma.$queryRaw`SELECT 1`;
        health.services.database = 'connected';
    } catch (error) {
        health.services.database = 'disconnected';
        health.status = 'unhealthy';
    }

    // Check Redis
    try {
        await redis.ping();
        health.services.redis = 'connected';
    } catch (error) {
        health.services.redis = 'disconnected';
        health.status = 'unhealthy';
    }

    // Check Supabase
    try {
        const { error } = await supabaseAdmin.storage.listBuckets();
        health.services.supabase = error ? 'disconnected' : 'connected';
        if (error) health.status = 'unhealthy';
    } catch (error) {
        health.services.supabase = 'disconnected';
        health.status = 'unhealthy';
    }

    res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

// Initialize storage service
StorageService.initialize().then(() => {
    logger.info('Storage service initialized');
}).catch((error) => {
    logger.error('Failed to initialize storage service', error);
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`, {
            environment: config.env,
            nodeVersion: process.version,
        });
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

export default app;
