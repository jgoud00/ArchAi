/**
 * Activity Tracking Service
 * 
 * Handles project activity logging and retrieval.
 */

import { supabase } from './supabase'
import { ProjectActivity } from '../types'

/**
 * Retrieves the activity log for a specific project.
 * 
 * @param projectId - The unique identifier of the project.
 * @param limit - The maximum number of activities to retrieve. Defaults to 50.
 * @returns A promise that resolves to an array of project activities.
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
 * Logs a custom activity for a project.
 * 
 * Note: Most activities are logged automatically by database triggers.
 * Use this function for custom activities that are not covered by triggers.
 * 
 * @param projectId - The unique identifier of the project.
 * @param userId - The unique identifier of the user performing the activity.
 * @param activityType - The type of activity being logged.
 * @param description - A descriptive message for the activity.
 * @param metadata - Optional key-value pairs providing additional context.
 * @returns A promise that resolves when the activity is logged.
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

