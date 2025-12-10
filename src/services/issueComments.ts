/**
 * Issue Comments Service
 * 
 * Handles CRUD operations for comments on project issues.
 */

import { supabase } from './supabase'

export interface IssueComment {
    id: string
    issueId: string
    userId: string
    content: string
    createdAt: Date
    updatedAt: Date
    user?: {
        displayName: string
        email: string
        avatar?: string
    }
}

/**
 * Retrieves all comments for a specific issue.
 * 
 * @param issueId - The unique identifier of the issue.
 * @returns A promise that resolves to an array of issue comments.
 */
export const getIssueComments = async (issueId: string): Promise<IssueComment[]> => {
    const { data, error } = await supabase
        .from('issue_comments')
        .select(`
      *,
      users:user_id (
        display_name,
        email,
        avatar
      )
    `)
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true })

    if (error) {
        throw new Error(error.message || 'Failed to load comments')
    }

    if (!data) return []

    return data.map((comment) => ({
        id: comment.id,
        issueId: comment.issue_id,
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
 * Creates a new comment on an issue.
 * 
 * @param issueId - The unique identifier of the issue.
 * @param userId - The unique identifier of the user creating the comment.
 * @param content - The text content of the comment.
 * @returns A promise that resolves to the newly created comment.
 */
export const createIssueComment = async (
    issueId: string,
    userId: string,
    content: string
): Promise<IssueComment> => {
    const { data, error } = await supabase
        .from('issue_comments')
        .insert({
            issue_id: issueId,
            user_id: userId,
            content,
        })
        .select()
        .single()

    if (error || !data) {
        throw new Error(error?.message || 'Failed to create comment')
    }

    // Fetch user info
    const { data: userData } = await supabase
        .from('users')
        .select('display_name, email, avatar')
        .eq('id', userId)
        .single()

    return {
        id: data.id,
        issueId: data.issue_id,
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
 * Updates an existing comment.
 * 
 * @param commentId - The unique identifier of the comment.
 * @param content - The new text content.
 */
export const updateIssueComment = async (
    commentId: string,
    content: string
): Promise<void> => {
    const { error } = await supabase
        .from('issue_comments')
        .update({ content })
        .eq('id', commentId)

    if (error) {
        throw new Error(error.message || 'Failed to update comment')
    }
}

/**
 * Deletes a comment.
 * 
 * @param commentId - The unique identifier of the comment.
 */
export const deleteIssueComment = async (commentId: string): Promise<void> => {
    const { error } = await supabase
        .from('issue_comments')
        .delete()
        .eq('id', commentId)

    if (error) {
        throw new Error(error.message || 'Failed to delete comment')
    }
}
