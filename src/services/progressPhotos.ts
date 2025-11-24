import { supabase } from './supabase'
import { ProgressPhoto } from '../types'

const STORAGE_BUCKET = 'project-files'

export const getProjectProgressPhotos = async (projectId: string): Promise<ProgressPhoto[]> => {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  if (error || !data) {
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

export const deleteProgressPhoto = async (photoId: string): Promise<void> => {
  // Get photo to delete file
  const { data: photo } = await supabase
    .from('progress_photos')
    .select('photo_url')
    .eq('id', photoId)
    .single()

  // Delete file from storage
  if (photo?.photo_url) {
    try {
      const url = new URL(photo.photo_url)
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
    .from('progress_photos')
    .delete()
    .eq('id', photoId)

  if (error) {
    throw new Error(error.message)
  }
}

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

