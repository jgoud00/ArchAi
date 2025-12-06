import { supabase } from './supabase'
import { Task } from '../types'

/**
 * Retrieves all tasks for a specific project.
 * 
 * @param projectId - The UUID of the project.
 * @returns A Promise resolving to an array of Task objects, ordered by start date.
 */
export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('start_date', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((task) => ({
    id: task.id,
    projectId: task.project_id,
    taskName: task.task_name,
    startDate: new Date(task.start_date),
    endDate: new Date(task.end_date),
    status: task.status,
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
  }))
}

/**
 * Retrieves a single task by its ID.
 * 
 * @param taskId - The UUID of the task.
 * @returns A Promise resolving to the Task object or null if not found.
 */
export const getTask = async (taskId: string): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    projectId: data.project_id,
    taskName: data.task_name,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

/**
 * Creates a new task for a project.
 * 
 * @param projectId - The UUID of the project.
 * @param taskName - The name/description of the task.
 * @param startDate - The start date of the task.
 * @param endDate - The end date of the task.
 * @param status - The initial status of the task (default: 'pending').
 * @returns A Promise resolving to the newly created task's ID.
 * @throws Error if task creation fails.
 */
export const createTask = async (
  projectId: string,
  taskName: string,
  startDate: Date,
  endDate: Date,
  status: 'pending' | 'in_progress' | 'completed' = 'pending'
): Promise<string> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      task_name: taskName,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create task')
  }

  return data.id
}

/**
 * Updates an existing task.
 * 
 * @param taskId - The UUID of the task to update.
 * @param updates - Partial object containing fields to update.
 * @returns A Promise resolving when the update is complete.
 * @throws Error if the update fails.
 */
export const updateTask = async (
  taskId: string,
  updates: Partial<Pick<Task, 'taskName' | 'startDate' | 'endDate' | 'status'>>
): Promise<void> => {
  const updateData: Record<string, unknown> = {}

  if (updates.taskName !== undefined) updateData.task_name = updates.taskName
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString().split('T')[0]
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate.toISOString().split('T')[0]
  if (updates.status !== undefined) updateData.status = updates.status

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Deletes a task by its ID.
 * 
 * @param taskId - The UUID of the task to delete.
 * @returns A Promise resolving when the deletion is complete.
 * @throws Error if the deletion fails.
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    throw new Error(error.message)
  }
}

