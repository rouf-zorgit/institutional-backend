import { config } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    [key: string]: any;
}

class Logger {
    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    info(message: string, context?: LogContext): void {
        console.log(this.formatMessage('info', message, context));
    }

    warn(message: string, context?: LogContext): void {
        console.warn(this.formatMessage('warn', message, context));
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        const errorContext = {
            ...context,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
            } : error,
        };
        console.error(this.formatMessage('error', message, errorContext));
    }

    debug(message: string, context?: LogContext): void {
        if (config.isDevelopment) {
            console.debug(this.formatMessage('debug', message, context));
        }
    }

    // HTTP request logging
    http(method: string, path: string, statusCode: number, duration: number): void {
        const message = `${method} ${path} ${statusCode} - ${duration}ms`;

        if (statusCode >= 500) {
            this.error(message);
        } else if (statusCode >= 400) {
            this.warn(message);
        } else {
            this.info(message);
        }
    }
}

export const logger = new Logger();
export default logger;
