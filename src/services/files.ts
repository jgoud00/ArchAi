/**
 * File Management Service
 * 
 * Handles file uploads, downloads, and management for projects.
 * Files are stored in Supabase Storage and metadata in PostgreSQL.
 */

import { supabase } from './supabase'
import { ProjectFile } from '../types'

/**
 * Upload a file to a project
 * 
 * @param file - The file to upload
 * @param projectId - The project ID
 * @param userId - The user ID uploading the file
 * @param category - Optional file category
 * @param description - Optional file description
 * @param onProgress - Optional progress callback
 */
export const uploadFile = async (
  file: File,
  projectId: string,
  userId: string,
  category?: string,
  description?: string,
  onProgress?: (progress: number) => void
): Promise<ProjectFile> => {
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const timestamp = Date.now()
  const fileName = `${projectId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload file')
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('project-files')
    .getPublicUrl(fileName)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get file URL')
  }

  // Save file metadata to database
  const { data: fileData, error: dbError } = await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: userId,
      category: category || 'other',
      description: description || null,
    })
    .select()
    .single()

  if (dbError || !fileData) {
    // Try to delete uploaded file if database insert fails
    await supabase.storage.from('project-files').remove([fileName])
    throw new Error(dbError?.message || 'Failed to save file metadata')
  }

  return {
    id: fileData.id,
    projectId: fileData.project_id,
    name: fileData.name,
    fileUrl: fileData.file_url,
    fileType: fileData.file_type,
    fileSize: fileData.file_size,
    uploadedBy: fileData.uploaded_by,
    category: fileData.category || undefined,
    description: fileData.description || undefined,
    uploadedAt: new Date(fileData.uploaded_at),
    createdAt: new Date(fileData.created_at),
    updatedAt: new Date(fileData.updated_at),
  }
}

/**
 * Get all files for a project
 */
export const getProjectFiles = async (projectId: string): Promise<ProjectFile[]> => {
  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((file) => ({
    id: file.id,
    projectId: file.project_id,
    name: file.name,
    fileUrl: file.file_url,
    fileType: file.file_type,
    fileSize: file.file_size,
    uploadedBy: file.uploaded_by,
    category: file.category || undefined,
    description: file.description || undefined,
    uploadedAt: new Date(file.uploaded_at),
    createdAt: new Date(file.created_at),
    updatedAt: new Date(file.updated_at),
  }))
}

/**
 * Delete a file
 */
export const deleteFile = async (fileId: string, projectId: string): Promise<void> => {
  // Get file info first
  const { data: fileData, error: fetchError } = await supabase
    .from('project_files')
    .select('file_url')
    .eq('id', fileId)
    .eq('project_id', projectId)
    .single()

  if (fetchError || !fileData) {
    throw new Error('File not found')
  }

  // Extract file path from URL
  const url = new URL(fileData.file_url)
  const pathParts = url.pathname.split('/')
  const fileName = pathParts[pathParts.length - 1]
  const filePath = `${projectId}/${fileName}`

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('project-files')
    .remove([filePath])

  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
    // Continue to delete from database anyway
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('project_files')
    .delete()
    .eq('id', fileId)
    .eq('project_id', projectId)

  if (dbError) {
    throw new Error(dbError.message || 'Failed to delete file')
  }
}

/**
 * Update file metadata
 */
export const updateFile = async (
  fileId: string,
  projectId: string,
  updates: { name?: string; description?: string; category?: string }
): Promise<void> => {
  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.category !== undefined) updateData.category = updates.category

  const { error } = await supabase
    .from('project_files')
    .update(updateData)
    .eq('id', fileId)
    .eq('project_id', projectId)

  if (error) {
    throw new Error(error.message || 'Failed to update file')
  }
}

