/**
 * Document Management Service
 * 
 * Handles uploading, retrieving, and deleting project documents.
 */

import { supabase } from './supabase'
import { Document } from '../types'

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
    throw new Error(error.message || 'Failed to delete file from storage')
  }
}

/**
 * Retrieves all documents associated with a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to an array of document objects.
 * @throws Will throw an error if the database query fails.
 */
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
    updatedAt: new Date(doc.uploaded_at), // Fallback to uploaded_at if updated_at is missing
  }))
}

/**
 * Uploads a new document for a project.
 * 
 * This function handles:
 * 1. Uploading the file to Supabase Storage.
 * 2. Generating a public URL for the file.
 * 3. Creating a document record in the database.
 * 
 * @param projectId - The unique identifier of the project.
 * @param file - The file object to upload.
 * @param uploadedBy - The unique identifier of the user uploading the file.
 * @returns A promise that resolves to the ID of the newly created document.
 * @throws Will throw an error if upload or database insertion fails.
 */
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

/**
 * Deletes a document and its associated file from storage.
 * 
 * @param documentId - The unique identifier of the document to delete.
 * @returns A promise that resolves when the document is deleted.
 * @throws Will throw an error if the database or storage operation fails.
 */
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

