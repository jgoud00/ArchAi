/**
 * Application Error Classes
 * 
 * Provides standardized error handling across the application
 * with proper error codes, status codes, and context
 */

export class AppError extends Error {
    public readonly code: string
    public readonly statusCode: number
    public readonly context?: Record<string, unknown>

    constructor(
        message: string,
        code: string,
        statusCode: number = 500,
        context?: Record<string, unknown>
    ) {
        super(message)
        this.name = 'AppError'
        this.code = code
        this.statusCode = statusCode
        this.context = context

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if ('captureStackTrace' in Error && typeof (Error as { captureStackTrace?: (target: object, constructor: new (...args: any[]) => any) => void }).captureStackTrace === 'function') {
            (Error as { captureStackTrace: (target: object, constructor: new (...args: any[]) => any) => void }).captureStackTrace(this, this.constructor as new (...args: any[]) => any)
        }
    }
}

/**
 * Validation Error - 400
 * Thrown when user input fails validation
 */
export class ValidationError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'VALIDATION_ERROR', 400, context)
        this.name = 'ValidationError'
    }
}

/**
 * Authentication Error - 401
 * Thrown when user is not authenticated
 */
export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required', context?: Record<string, unknown>) {
        super(message, 'AUTH_ERROR', 401, context)
        this.name = 'AuthenticationError'
    }
}

/**
 * Authorization Error - 403
 * Thrown when user lacks permissions
 */
export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions', context?: Record<string, unknown>) {
        super(message, 'AUTHORIZATION_ERROR', 403, context)
        this.name = 'AuthorizationError'
    }
}

/**
 * Not Found Error - 404
 * Thrown when requested resource doesn't exist
 */
export class NotFoundError extends AppError {
    constructor(resource: string, id?: string, context?: Record<string, unknown>) {
        const message = id ? `${resource} with id ${id} not found` : `${resource} not found`
        super(message, 'NOT_FOUND', 404, { ...context, resource, id })
        this.name = 'NotFoundError'
    }
}

/**
 * Conflict Error - 409
 * Thrown when operation conflicts with existing state
 */
export class ConflictError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'CONFLICT_ERROR', 409, context)
        this.name = 'ConflictError'
    }
}

/**
 * Database Error - 500
 * Thrown when database operation fails
 */
export class DatabaseError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'DATABASE_ERROR', 500, context)
        this.name = 'DatabaseError'
    }
}

/**
 * External Service Error - 502
 * Thrown when external API/service fails
 */
export class ExternalServiceError extends AppError {
    constructor(service: string, message: string, context?: Record<string, unknown>) {
        super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, { ...context, service })
        this.name = 'ExternalServiceError'
    }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
    if (isAppError(error)) {
        return error
    }

    if (error instanceof Error) {
        return new AppError(error.message, 'UNKNOWN_ERROR', 500)
    }

    return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500)
}
