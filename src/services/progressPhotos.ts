/**
 * Progress Photo Management Service
 * 
 * Handles uploading, retrieving, updating, and deleting progress photos for projects.
 */

import { supabase } from './supabase'
import { ProgressPhoto } from '../types'

const STORAGE_BUCKET = 'project-files'

/**
 * Extracts the storage path from a public file URL.
 * 
 * @param fileUrl - The public URL of the file.
 * @returns The storage path relative to the bucket, or null if invalid.
 */
const extractStoragePath = (fileUrl?: string | null): string | null => {
  if (!fileUrl) return null
  try {
    const url = new URL(fileUrl)
    const parts = url.pathname.split('/').filter(Boolean)
    const bucketIndex = parts.indexOf('project-files')
    if (bucketIndex === -1) return null
    return parts.slice(bucketIndex + 1).join('/')
  } catch {
    return null
  }
}

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
    throw new Error(error.message || 'Failed to delete photo from storage')
  }
}

/**
 * Retrieves all progress photos associated with a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to an array of progress photo objects, ordered by upload date (newest first).
 * @throws Will throw an error if the database query fails.
 */
export const getProjectProgressPhotos = async (projectId: string): Promise<ProgressPhoto[]> => {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to load progress photos')
  }

  if (!data) {
    return []
  }

  return data.map((photo) => ({
    id: photo.id,
    projectId: photo.project_id,
    photoUrl: photo.photo_url,
    caption: photo.caption || undefined,
    uploadedBy: photo.uploaded_by,
    uploadedAt: new Date(photo.uploaded_at),
  }))
}

/**
 * Uploads a new progress photo for a project.
 * 
 * This function handles:
 * 1. Uploading the photo file to Supabase Storage.
 * 2. Generating a public URL for the photo.
 * 3. Creating a progress photo record in the database.
 * 
 * @param projectId - The unique identifier of the project.
 * @param file - The photo file to upload.
 * @param caption - A caption or description for the photo.
 * @param uploadedBy - The unique identifier of the user uploading the photo.
 * @returns A promise that resolves to the ID of the newly created progress photo.
 * @throws Will throw an error if upload or database insertion fails.
 */
export const uploadProgressPhoto = async (
  projectId: string,
  file: File,
  caption: string,
  uploadedBy: string
): Promise<string> => {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const filePath = `progress/${projectId}/${fileName}`

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  if (!uploadData) {
    throw new Error('Upload failed')
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get file URL')
  }

  // Save photo metadata to database
  const { data: photoData, error: photoError } = await supabase
    .from('progress_photos')
    .insert({
      project_id: projectId,
      photo_url: urlData.publicUrl,
      caption: caption || null,
      uploaded_by: uploadedBy,
    })
    .select()
    .single()

  if (photoError || !photoData) {
    // Try to delete uploaded file if database insert fails
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
    throw new Error(photoError?.message || 'Failed to save photo metadata')
  }

  return photoData.id
}

/**
 * Deletes a progress photo and its associated file from storage.
 * 
 * @param photoId - The unique identifier of the photo to delete.
 * @returns A promise that resolves when the photo is deleted.
 * @throws Will throw an error if the database or storage operation fails.
 */
export const deleteProgressPhoto = async (photoId: string): Promise<void> => {
  // Get photo to delete file
  const { data: photo } = await supabase
    .from('progress_photos')
    .select('photo_url')
    .eq('id', photoId)
    .single()

  // Delete file from storage
  if (photo?.photo_url) {
    const filePath = extractStoragePath(photo.photo_url)
    if (!filePath) {
      throw new Error('Unable to resolve progress photo path for deletion')
    }
    await deleteFromStorage(filePath)
  }

  const { error } = await supabase
    .from('progress_photos')
    .delete()
    .eq('id', photoId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Updates the caption of a progress photo.
 * 
 * @param photoId - The unique identifier of the photo to update.
 * @param caption - The new caption text.
 * @returns A promise that resolves when the caption is updated.
 * @throws Will throw an error if the database operation fails.
 */
export const updateProgressPhotoCaption = async (
  photoId: string,
  caption: string
): Promise<void> => {
  const { error } = await supabase
    .from('progress_photos')
    .update({ caption: caption || null })
    .eq('id', photoId)

  if (error) {
    throw new Error(error.message)
  }
}

