/**
 * Base Service Class
 * 
 * Provides common functionality for all service classes
 * including error handling, logging, and database operations
 */

import { PostgrestError } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { logger } from '@/utils/logger'
import { DatabaseError, NotFoundError, AppError } from '@/types/errors'

export abstract class BaseService<T> {
    protected abstract readonly tableName: string

    /**
     * Find a record by ID
     */
    protected async findById(id: string): Promise<T | null> {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned
                    return null
                }
                throw this.handleDatabaseError(error, 'findById')
            }

            return (data as T) || null
        } catch (error) {
            if (error instanceof AppError) throw error
            throw this.handleError(error, `Error finding ${this.tableName} by id`, { id })
        }
    }

    /**
     * Find all records with optional filters
     */
    protected async findAll(filters?: Record<string, unknown>): Promise<T[]> {
        try {
            let query = supabase.from(this.tableName).select('*')

            // Apply filters
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    query = query.eq(key, value)
                })
            }

            const { data, error } = await query

            if (error) {
                throw this.handleDatabaseError(error, 'findAll')
            }

            return (data as T[]) || []
        } catch (error) {
            if (error instanceof AppError) throw error
            throw this.handleError(error, `Error finding all ${this.tableName}`, { filters })
        }
    }

    /**
     * Create a new record
     */
    protected async create(data: Partial<T>): Promise<T> {
        try {
            const { data: created, error } = await supabase
                .from(this.tableName)
                .insert(data)
                .select()
                .single()

            if (error) {
                throw this.handleDatabaseError(error, 'create')
            }

            if (!created) {
                throw new DatabaseError(`Failed to create ${this.tableName}`)
            }

            return created as T
        } catch (error) {
            if (error instanceof AppError) throw error
            throw this.handleError(error, `Error creating ${this.tableName}`, { data })
        }
    }

    /**
     * Update a record by ID
     */
    protected async update(id: string, data: Partial<T>): Promise<T> {
        try {
            const { data: updated, error } = await supabase
                .from(this.tableName)
                .update(data)
                .eq('id', id)
                .select()
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new NotFoundError(this.tableName, id)
                }
                throw this.handleDatabaseError(error, 'update')
            }

            if (!updated) {
                throw new NotFoundError(this.tableName, id)
            }

            return updated as T
        } catch (error) {
            if (error instanceof AppError) throw error
            throw this.handleError(error, `Error updating ${this.tableName}`, { id, data })
        }
    }

    /**
     * Delete a record by ID
     */
    protected async delete(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .eq('id', id)

            if (error) {
                throw this.handleDatabaseError(error, 'delete')
            }
        } catch (error) {
            if (error instanceof AppError) throw error
            throw this.handleError(error, `Error deleting ${this.tableName}`, { id })
        }
    }

    /**
     * Handle Postgres errors
     */
    protected handleDatabaseError(error: PostgrestError, operation: string): DatabaseError {
        logger.error(`Database error in ${this.tableName}.${operation}`, error, {
            table: this.tableName,
            operation,
            code: error.code,
        })

        // Map common Postgres error codes to user-friendly messages
        const message = this.getDatabaseErrorMessage(error)
        return new DatabaseError(message, {
            table: this.tableName,
            operation,
            code: error.code,
            details: error.details,
        })
    }

    /**
     * Handle generic errors
     */
    protected handleError(error: unknown, context: string, metadata?: Record<string, unknown>): AppError {
        logger.error(context, error, metadata)

        if (error instanceof AppError) {
            return error
        }

        if (error instanceof Error) {
            return new AppError(error.message, 'UNKNOWN_ERROR', 500, metadata)
        }

        return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500, metadata)
    }

    /**
     * Get user-friendly error message from Postgres error
     */
    private getDatabaseErrorMessage(error: PostgrestError): string {
        // Foreign key violation
        if (error.code === '23503') {
            return 'Referenced record does not exist'
        }

        // Unique violation
        if (error.code === '23505') {
            return 'Record already exists'
        }

        // Not null violation
        if (error.code === '23502') {
            return 'Required field is missing'
        }

        // Check violation
        if (error.code === '23514') {
            return 'Invalid data provided'
        }

        return error.message || 'Database operation failed'
    }

    /**
     * Ensure user has access to project
     */
    protected async ensureProjectAccess(projectId: string, userId: string): Promise<void> {
        const { data, error } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .or(`owner_id.eq.${userId},team_members.user_id.eq.${userId}`)
            .single()

        if (error || !data) {
            throw new NotFoundError('Project', projectId)
        }
    }
}
