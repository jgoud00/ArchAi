import { supabase } from './supabase'
import { User, UserRole } from '../types'

/**
 * Get all users (admin only)
 * Returns list of all users in the system
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
 * Update user role (admin only)
 * Allows admins to change user roles
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
 * Get user by ID
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

