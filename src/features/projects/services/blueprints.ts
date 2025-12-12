/**
 * Blueprint Management Service
 * 
 * Handles storage, retrieval, and versioning of project blueprints.
 */

import { supabase } from '@/services/supabase'
import { Blueprint } from '@/types'

const STORAGE_BUCKET = 'project-files'

/**
 * Retrieves the current blueprint for a specific project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to the blueprint object or null if not found.
 */
export const getProjectBlueprint = async (projectId: string): Promise<Blueprint | null> => {
  const { data, error } = await supabase
    .from('blueprints')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    projectId: data.project_id,
    pngUrl: data.png_url || undefined,
    jsonUrl: data.json_url || undefined,
    updatedAt: new Date(data.updated_at),
  }
}

/**
 * Saves a new blueprint for a project, uploading both the PNG thumbnail and JSON data.
 * 
 * This function handles:
 * 1. Uploading the PNG thumbnail to storage.
 * 2. Uploading the JSON layout data to storage.
 * 3. Deleting old blueprint files to prevent storage clutter.
 * 4. Updating the blueprint record in the database.
 * 
 * @param projectId - The unique identifier of the project.
 * @param pngBlob - The PNG image data as a Blob.
 * @param jsonData - The JSON layout data as a string.
 * @returns A promise that resolves when the blueprint is successfully saved.
 * @throws Will throw an error if any upload or database operation fails.
 */
export const saveBlueprint = async (
  projectId: string,
  pngBlob: Blob,
  jsonData: string
): Promise<void> => {
  const timestamp = Date.now()
  const pngFileName = `${timestamp}_blueprint.png`
  const jsonFileName = `${timestamp}_blueprint.json`
  const pngPath = `blueprints/${projectId}/${pngFileName}`
  const jsonPath = `blueprints/${projectId}/${jsonFileName}`

  // Upload PNG
  const { data: pngUpload, error: pngError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(pngPath, pngBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/png',
    })

  if (pngError) {
    throw new Error(`Failed to upload PNG: ${pngError.message}`)
  }

  // Upload JSON
  const jsonBlob = new Blob([jsonData], { type: 'application/json' })
  const { error: jsonError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(jsonPath, jsonBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'application/json',
    })

  if (jsonError) {
    // Try to delete PNG if JSON upload fails
    if (pngUpload) {
      await supabase.storage.from(STORAGE_BUCKET).remove([pngPath])
    }
    throw new Error(`Failed to upload JSON: ${jsonError.message}`)
  }

  // Get public URLs
  const { data: pngUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(pngPath)

  const { data: jsonUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(jsonPath)

  if (!pngUrlData?.publicUrl || !jsonUrlData?.publicUrl) {
    throw new Error('Failed to get file URLs')
  }

  // Delete old blueprint files if they exist
  const existing = await getProjectBlueprint(projectId)
  if (existing?.pngUrl) {
    try {
      const url = new URL(existing.pngUrl)
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
  if (existing?.jsonUrl) {
    try {
      const url = new URL(existing.jsonUrl)
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

  // Save or update blueprint record
  const { error } = await supabase
    .from('blueprints')
    .upsert({
      project_id: projectId,
      png_url: pngUrlData.publicUrl,
      json_url: jsonUrlData.publicUrl,
    }, {
      onConflict: 'project_id',
    })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Fetches the blueprint JSON data from a given URL.
 * 
 * @param jsonUrl - The URL of the JSON file to fetch.
 * @returns A promise that resolves to the JSON string.
 * @throws Will throw an error if the URL is invalid, the fetch fails, or times out.
 */
export const loadBlueprintJson = async (jsonUrl: string): Promise<string> => {
  try {
    // Validate URL
    if (!jsonUrl || typeof jsonUrl !== 'string') {
      throw new Error('Invalid JSON URL provided')
    }

    // Guard for SSR - fetch only in browser
    if (typeof window === 'undefined') {
      throw new Error('Cannot fetch in server-side environment')
    }

    // Validate URL format
    let url: URL
    try {
      url = new URL(jsonUrl)
    } catch {
      throw new Error('Invalid URL format')
    }

    // Ensure it's HTTP/HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs are allowed')
    }

    // Create timeout controller for fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(jsonUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId)
    })

    if (!response.ok) {
      throw new Error(`Failed to load blueprint JSON: ${response.status} ${response.statusText}`)
    }

    return await response.text()
  } catch (error) {
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Failed to load blueprint JSON')
      }
      throw error
    }
    throw new Error('Failed to load blueprint JSON: Network error')
  }
}

/**
 * Saves a version snapshot of a blueprint.
 * 
 * @param projectId - The unique identifier of the project.
 * @param data - The blueprint data to save as a version.
 * @returns A promise that resolves when the version is saved.
 * @throws Will throw an error if the database operation fails.
 */
export const saveBlueprintVersion = async (
  projectId: string,
  data: Record<string, unknown>
): Promise<void> => {
  const { error } = await supabase
    .from('blueprint_versions')
    .insert({
      project_id: projectId,
      data: data,
    })

  if (error) {
    throw new Error(`Failed to save version: ${error.message}`)
  }
}

/**
 * Retrieves all saved versions of a blueprint for a specific project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to an array of blueprint versions.
 * @throws Will throw an error if the database query fails.
 */
export const getBlueprintVersions = async (projectId: string): Promise<Record<string, unknown>[]> => {
  const { data, error } = await supabase
    .from('blueprint_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch versions: ${error.message}`)
  }

  return data || []
}
