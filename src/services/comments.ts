/**
 * Comments Service
 * 
 * Handles project comments/notes functionality.
 */

import { supabase } from './supabase'
import { ProjectComment } from '../types'

/**
 * Adds a new comment to a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @param userId - The unique identifier of the user creating the comment.
 * @param content - The text content of the comment.
 * @returns A promise that resolves to the newly created comment object.
 * @throws Will throw an error if the database operation fails.
 */
export const addComment = async (
  projectId: string,
  userId: string,
  content: string
): Promise<ProjectComment> => {
  const { data, error } = await supabase
    .from('project_comments')
    .insert({
      project_id: projectId,
      user_id: userId,
      content,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to add comment')
  }

  // Fetch user info for the comment
  const { data: userData } = await supabase
    .from('users')
    .select('display_name, email, avatar')
    .eq('id', userId)
    .single()

  return {
    id: data.id,
    projectId: data.project_id,
    userId: data.user_id,
    content: data.content,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    user: userData
      ? {
        displayName: userData.display_name || userData.email,
        email: userData.email,
        avatar: userData.avatar || undefined,
      }
      : undefined,
  }
}

/**
 * Retrieves all comments for a specific project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to an array of project comments, ordered by creation date.
 */
export const getProjectComments = async (projectId: string): Promise<ProjectComment[]> => {
  const { data, error } = await supabase
    .from('project_comments')
    .select(`
      *,
      users:user_id (
        display_name,
        email,
        avatar
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((comment) => ({
    id: comment.id,
    projectId: comment.project_id,
    userId: comment.user_id,
    content: comment.content,
    createdAt: new Date(comment.created_at),
    updatedAt: new Date(comment.updated_at),
    user: comment.users
      ? {
        displayName: comment.users.display_name || comment.users.email,
        email: comment.users.email,
        avatar: comment.users.avatar || undefined,
      }
      : undefined,
  }))
}

/**
 * Updates the content of an existing comment.
 * 
 * @param commentId - The unique identifier of the comment to update.
 * @param content - The new text content for the comment.
 * @returns A promise that resolves when the comment is updated.
 * @throws Will throw an error if the database operation fails.
 */
export const updateComment = async (
  commentId: string,
  content: string
): Promise<void> => {
  const { error } = await supabase
    .from('project_comments')
    .update({ content })
    .eq('id', commentId)

  if (error) {
    throw new Error(error.message || 'Failed to update comment')
  }
}

/**
 * Deletes a comment.
 * 
 * @param commentId - The unique identifier of the comment to delete.
 * @returns A promise that resolves when the comment is deleted.
 * @throws Will throw an error if the database operation fails.
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    throw new Error(error.message || 'Failed to delete comment')
  }
}

