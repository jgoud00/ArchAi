/**
 * Centralized Logging Utility
 * 
 * Provides environment-aware logging that only outputs in development mode.
 * In production, logs can be sent to external monitoring services like Sentry.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
    [key: string]: unknown
}

class Logger {
    private isDevelopment = import.meta.env.MODE === 'development'

    /**
     * Log debug information (development only)
     */
    debug(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.debug('[DEBUG]', message, context || '')
        }
    }

    /**
     * Log informational messages
     */
    info(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.info('[INFO]', message, context || '')
        }
    }

    /**
     * Log warnings
     */
    warn(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.warn('[WARN]', message, context || '')
        }
        // In production, send to monitoring service
        this.sendToMonitoring('warn', message, context)
    }

    /**
     * Log errors
     */
    error(message: string, error?: Error | unknown, context?: LogContext): void {
        if (this.isDevelopment) {
            console.error('[ERROR]', message, error, context || '')
        }
        // In production, send to monitoring service
        this.sendToMonitoring('error', message, { ...context, error })
    }

    /**
     * Send logs to external monitoring service (Sentry, LogRocket, etc.)
     */
    private sendToMonitoring(_level: LogLevel, _message: string, _context?: LogContext): void {
        if (!this.isDevelopment) {
            // TODO: Integrate with Sentry or other monitoring service
            // Example: Sentry.captureMessage(message, { level, extra: context })
        }
    }
}

export const logger = new Logger()
