/**
 * Issue Tracking Service
 * 
 * Handles creation, retrieval, updating, and deletion of project issues.
 * Supports attaching photos to issues.
 */

import { supabase } from './supabase'
import { Issue } from '../types'
import { STORAGE_BUCKETS, ISSUE_STATUS } from '../constants'
import { extractStoragePath } from '../utils/storageUtils'

const STORAGE_BUCKET = STORAGE_BUCKETS.PROJECT_FILES

/**
 * Deletes a file from Supabase storage.
 * 
 * @param path - The storage path of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 * @throws Will throw an error if the deletion fails.
 */
const deleteFromStorage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  if (error) {
    throw new Error(error.message || 'Failed to delete issue file from storage')
  }
}

/**
 * Retrieves all issues associated with a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to an array of issue objects, ordered by creation date (newest first).
 * @throws Will throw an error if the database query fails.
 */
export const getProjectIssues = async (projectId: string): Promise<Issue[]> => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to load issues')
  }

  if (!data) {
    return []
  }

  return data.map((issue) => ({
    id: issue.id,
    projectId: issue.project_id,
    title: issue.title,
    description: issue.description || undefined,
    priority: issue.priority,
    status: issue.status,
    photoUrl: issue.photo_url || undefined,
    createdBy: issue.created_by,
    createdAt: new Date(issue.created_at),
    updatedAt: new Date(issue.updated_at),
  }))
}

/**
 * Retrieves a specific issue by its ID.
 * 
 * @param issueId - The unique identifier of the issue.
 * @returns A promise that resolves to the issue object or null if not found.
 * @throws Will throw an error if the database query fails.
 */
export const getIssue = async (issueId: string): Promise<Issue | null> => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', issueId)
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to load issue')
  }

  if (!data) {
    return null
  }

  return {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    description: data.description || undefined,
    priority: data.priority,
    status: data.status,
    photoUrl: data.photo_url || undefined,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

/**
 * Creates a new issue for a project.
 * 
 * This function handles:
 * 1. Uploading an optional photo to Supabase Storage.
 * 2. Creating an issue record in the database.
 * 
 * @param projectId - The unique identifier of the project.
 * @param title - The title of the issue.
 * @param description - A detailed description of the issue.
 * @param priority - The priority level ('low', 'medium', 'high').
 * @param createdBy - The unique identifier of the user creating the issue.
 * @param photoFile - Optional photo file to attach to the issue.
 * @returns A promise that resolves to the ID of the newly created issue.
 * @throws Will throw an error if upload or database insertion fails.
 */
export const createIssue = async (
  projectId: string,
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high',
  createdBy: string,
  photoFile?: File
): Promise<string> => {
  let photoUrl: string | undefined

  // Upload photo if provided
  if (photoFile) {
    const timestamp = Date.now()
    const fileName = `${timestamp}_${photoFile.name}`
    const filePath = `issues/${projectId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, photoFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        photoUrl = urlData.publicUrl
      }
    }
  }

  const { data, error } = await supabase
    .from('issues')
    .insert({
      project_id: projectId,
      title,
      description: description || null,
      priority,
      status: ISSUE_STATUS.OPEN,
      photo_url: photoUrl || null,
      created_by: createdBy,
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create issue')
  }

  return data.id
}

/**
 * Updates an existing issue.
 * 
 * This function handles:
 * 1. Updating issue fields (title, description, priority, status).
 * 2. Replacing the attached photo if a new one is provided (deleting the old one).
 * 
 * @param issueId - The unique identifier of the issue to update.
 * @param updates - An object containing the fields to update.
 * @param photoFile - Optional new photo file to replace the existing one.
 * @returns A promise that resolves when the issue is updated.
 * @throws Will throw an error if the database or storage operation fails.
 */
export const updateIssue = async (
  issueId: string,
  updates: Partial<Pick<Issue, 'title' | 'description' | 'priority' | 'status'>>,
  photoFile?: File
): Promise<void> => {
  const updateData: {
    title?: string
    description?: string | null
    priority?: 'low' | 'medium' | 'high'
    status?: 'open' | 'in_progress' | 'resolved'
    photo_url?: string
  } = {}

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.priority !== undefined) updateData.priority = updates.priority
  if (updates.status !== undefined) updateData.status = updates.status

  // Upload new photo if provided
  if (photoFile) {
    const { data: issue } = await supabase
      .from('issues')
      .select('project_id, photo_url')
      .eq('id', issueId)
      .single()

    if (issue) {
      // Delete old photo if exists
      if (issue.photo_url) {
        const filePath = extractStoragePath(issue.photo_url, STORAGE_BUCKET)
        if (!filePath) {
          throw new Error('Unable to resolve existing issue photo path for deletion')
        }
        await deleteFromStorage(filePath)
      }

      // Upload new photo
      const timestamp = Date.now()
      const fileName = `${timestamp}_${photoFile.name}`
      const filePath = `issues/${issue.project_id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath)

        if (urlData?.publicUrl) {
          updateData.photo_url = urlData.publicUrl
        }
      }
    }
  }

  const { error } = await supabase
    .from('issues')
    .update(updateData)
    .eq('id', issueId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Deletes an issue and its attached photo.
 * 
 * @param issueId - The unique identifier of the issue to delete.
 * @returns A promise that resolves when the issue is deleted.
 * @throws Will throw an error if the database or storage operation fails.
 */
export const deleteIssue = async (issueId: string): Promise<void> => {
  // Get issue to delete photo
  const { data: issue } = await supabase
    .from('issues')
    .select('photo_url')
    .eq('id', issueId)
    .single()

  // Delete photo if exists
  if (issue?.photo_url) {
    const filePath = extractStoragePath(issue.photo_url, STORAGE_BUCKET)
    if (!filePath) {
      throw new Error('Unable to resolve issue photo path for deletion')
    }
    await deleteFromStorage(filePath)
  }

  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', issueId)

  if (error) {
    throw new Error(error.message)
  }
}
