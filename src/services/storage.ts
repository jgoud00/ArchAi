/**
 * Storage Service
 * 
 * Handles generic file storage operations using Supabase Storage.
 * Primarily used for scan uploads and file deletion.
 */

import { supabase } from './supabase'

const STORAGE_BUCKET = 'project-files'

/**
 * Uploads a scan file (image or video) to Supabase Storage and creates a database record.
 * 
 * @param file - The file object to upload.
 * @param projectId - The unique identifier of the project.
 * @param uploadedBy - The unique identifier of the user uploading the file.
 * @param onProgress - Optional callback function to track upload progress (simulated).
 * @returns A promise that resolves to the ID of the newly created scan record.
 * @throws Will throw an error if upload or database insertion fails.
 */
export const uploadScan = async (
  file: File,
  projectId: string,
  uploadedBy: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const filePath = `projects/${projectId}/scans/${fileName}`

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

  // Determine file type
  const fileType = file.type.startsWith('image/') ? 'image' : 'video'

  // Save scan metadata to database
  const { data: scanData, error: scanError } = await supabase
    .from('scans')
    .insert({
      project_id: projectId,
      name: file.name,
      url: urlData.publicUrl,
      type: fileType,
      uploaded_by: uploadedBy,
    })
    .select()
    .single()

  if (scanError || !scanData) {
    // Try to delete uploaded file if database insert fails
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
    throw new Error(scanError?.message || 'Failed to save scan metadata')
  }

  // Note: Supabase Storage doesn't support progress callbacks like Firebase
  // For a better UX, you could use chunked uploads or client-side progress
  if (onProgress) {
    onProgress(100)
  }

  return scanData.id
}

/**
 * Deletes a file from Supabase Storage using its public URL.
 * 
 * @param fileUrl - The public URL of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 * @throws Will throw an error if the URL is invalid or deletion fails.
 */
export const deleteScanFile = async (fileUrl: string): Promise<void> => {
  // Extract file path from URL
  // URL format: https://[project].supabase.co/storage/v1/object/public/project-files/path/to/file
  try {
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.indexOf('project-files')

    if (bucketIndex === -1) {
      throw new Error('Invalid file URL')
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to delete file: ${message}`)
  }
}

/**
 * Generates the public URL for a file in storage.
 * 
 * @param filePath - The path of the file within the storage bucket.
 * @returns The public URL string.
 */
export const getPublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}