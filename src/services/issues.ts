import { supabase } from './supabase'
import { Issue } from '../types'
import { STORAGE_BUCKETS, ISSUE_STATUS } from '../constants'
import { extractStoragePath } from '../utils/storageUtils'

const STORAGE_BUCKET = STORAGE_BUCKETS.PROJECT_FILES

const deleteFromStorage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  if (error) {
    throw new Error(error.message || 'Failed to delete issue file from storage')
  }
}

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
