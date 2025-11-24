import { supabase } from './supabase'
import { Issue } from '../types'

const STORAGE_BUCKET = 'project-files'

export const getProjectIssues = async (projectId: string): Promise<Issue[]> => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error || !data) {
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

  if (error || !data) {
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
      status: 'open',
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
  const updateData: any = {}

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
        try {
          const url = new URL(issue.photo_url)
          const pathParts = url.pathname.split('/')
          const bucketIndex = pathParts.indexOf('project-files')
          if (bucketIndex !== -1) {
            const filePath = pathParts.slice(bucketIndex + 1).join('/')
            await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
          }
        } catch (e) {
          // Ignore deletion errors
        }
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
    try {
      const url = new URL(issue.photo_url)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.indexOf('project-files')
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/')
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
      }
    } catch (e) {
      // Ignore deletion errors
    }
  }

  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', issueId)

  if (error) {
    throw new Error(error.message)
  }
}

