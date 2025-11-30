/**
 * User Management Service
 * 
 * Handles administrative user operations such as fetching all users and updating roles.
 */

import { supabase } from './supabase'
import { User, UserRole } from '../types'

/**
 * Retrieves all users in the system (Admin only).
 * 
 * @returns A promise that resolves to an array of user objects, ordered by creation date (newest first).
 * @throws Will throw an error if the database query fails.
 */
export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to fetch users')
  }

  if (!data) {
    return []
  }

  return data.map((user) => ({
    uid: user.id,
    email: user.email,
    displayName: user.display_name || user.email,
    avatar: user.avatar || undefined,
    role: (user.role as UserRole) || 'user',
    createdAt: new Date(user.created_at),
  }))
}

/**
 * Updates the role of a specific user (Admin only).
 * 
 * @param userId - The unique identifier of the user to update.
 * @param newRole - The new role to assign ('admin', 'user', etc.).
 * @returns A promise that resolves when the role is updated.
 * @throws Will throw an error if the database operation fails.
 */
export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message || 'Failed to update user role')
  }
}

/**
 * Retrieves a specific user by their ID.
 * 
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to the user object or null if not found.
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    uid: data.id,
    email: data.email,
    displayName: data.display_name || data.email,
    avatar: data.avatar || undefined,
    role: (data.role as UserRole) || 'user',
    createdAt: new Date(data.created_at),
  }
}

