/**
 * Dashboard Service
 * 
 * Handles data retrieval for the main dashboard.
 */

import { supabase } from '@/services/supabase'

/**
 * Represents the aggregated statistics for the user's dashboard.
 */
export interface DashboardStats {
  /** Total number of projects associated with the user. */
  total_projects: number
  /** Number of currently active projects. */
  active_builds: number
  /** Number of pending tasks assigned to the user or their projects. */
  tasks_pending: number
  /** Total number of team members across all projects. */
  team_members: number
}

/**
 * Retrieves dashboard statistics for a specific user.
 * 
 * This function calls a PostgreSQL RPC function `get_dashboard_stats` to fetch aggregated data.
 * 
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to the dashboard statistics object.
 * @throws Will throw an error if the RPC call fails.
 */
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  const { data, error } = await supabase.rpc('get_dashboard_stats', {
    user_uuid: userId
  })

  if (error) throw error
  return data as DashboardStats
}
