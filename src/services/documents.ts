import { supabase } from './supabase'
import { Document } from '../types'

const STORAGE_BUCKET = 'project-files'

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

const deleteFromStorage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  if (error) {
    throw new Error(error.message || 'Failed to delete file from storage')
  }
}

export const getProjectDocuments = async (projectId: string): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to load documents')
  }

  if (!data) {
    return []
  }

  return data.map((doc) => ({
    id: doc.id,
    projectId: doc.project_id,
    name: doc.name,
    fileUrl: doc.file_url,
    fileType: doc.file_type,
    uploadedBy: doc.uploaded_by,
    uploadedAt: new Date(doc.uploaded_at),
  }))
}

export const uploadDocument = async (
  projectId: string,
  file: File,
  uploadedBy: string
): Promise<string> => {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const filePath = `project-documents/${projectId}/${fileName}`

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
  const fileType = file.type || 'application/octet-stream'

  // Save document metadata to database
  const { data: docData, error: docError } = await supabase
    .from('documents')
    .insert({
      project_id: projectId,
      name: file.name,
      file_url: urlData.publicUrl,
      file_type: fileType,
      uploaded_by: uploadedBy,
    })
    .select()
    .single()

  if (docError || !docData) {
    // Try to delete uploaded file if database insert fails
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
    throw new Error(docError?.message || 'Failed to save document metadata')
  }

  return docData.id
}

export const deleteDocument = async (documentId: string): Promise<void> => {
  // Get document to delete file
  const { data: doc } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', documentId)
    .single()

  // Delete file from storage
  if (doc?.file_url) {
    const filePath = extractStoragePath(doc.file_url)
    if (!filePath) {
      throw new Error('Unable to resolve document file path for deletion')
    }
    await deleteFromStorage(filePath)
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    throw new Error(error.message)
  }
}

