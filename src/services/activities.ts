/**
 * Activity Tracking Service
 * 
 * Handles project activity logging and retrieval.
 */

import { supabase } from './supabase'
import { ProjectActivity } from '../types'

/**
 * Get activity log for a project
 */
export const getProjectActivities = async (
  projectId: string,
  limit: number = 50
): Promise<ProjectActivity[]> => {
  const { data, error } = await supabase
    .from('project_activities')
    .select(`
      *,
      users:user_id (
        display_name,
        email,
        avatar
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data.map((activity) => ({
    id: activity.id,
    projectId: activity.project_id,
    userId: activity.user_id,
    activityType: activity.activity_type,
    description: activity.description,
    metadata: activity.metadata || undefined,
    createdAt: new Date(activity.created_at),
    user: activity.users
      ? {
        displayName: activity.users.display_name || activity.users.email,
        email: activity.users.email,
        avatar: activity.users.avatar || undefined,
      }
      : undefined,
  }))
}

/**
 * Log a custom activity
 * 
 * Note: Most activities are logged automatically by triggers.
 * Use this for custom activities not covered by triggers.
 */
export const logActivity = async (
  projectId: string,
  userId: string,
  activityType: ProjectActivity['activityType'],
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  const { error } = await supabase
    .from('project_activities')
    .insert({
      project_id: projectId,
      user_id: userId,
      activity_type: activityType,
      description,
      metadata: metadata || null,
    })

  if (error) {
    console.error('Error logging activity:', error)
    // Don't throw - activity logging shouldn't break the app
  }
}

