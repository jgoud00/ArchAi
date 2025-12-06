/**
 * Project Management Service
 * 
 * Handles the core project lifecycle including creation, retrieval, updates, and deletion.
 * Also manages project assets (scans, team members) and handles cascading deletions of stored files.
 */

import { supabase } from './supabase'
import { Project, Scan, TeamMember } from '../types'
import { STORAGE_BUCKETS, BATCH_SIZES } from '../constants'

const STORAGE_BUCKET = STORAGE_BUCKETS.PROJECT_FILES

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
    const bucketIndex = parts.indexOf(STORAGE_BUCKET)
    if (bucketIndex === -1) return null
    return parts.slice(bucketIndex + 1).join('/')
  } catch {
    return null
  }
}

/**
 * Splits an array into smaller chunks.
 * 
 * @param items - The array to split.
 * @param size - The size of each chunk.
 * @returns An array of chunks.
 */
const chunkArray = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

/**
 * Deletes multiple objects from Supabase storage in batches.
 * 
 * @param paths - An array of storage paths to delete.
 * @returns A promise that resolves when all deletions are complete.
 * @throws Will throw an error if any batch deletion fails.
 */
const deleteStorageObjects = async (paths: string[]): Promise<void> => {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)))
  if (uniquePaths.length === 0) return

  for (const batch of chunkArray(uniquePaths, BATCH_SIZES.DELETE_OPERATIONS)) {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(batch)
    if (error) {
      throw new Error(error.message || 'Failed to remove project files from storage')
    }
  }
}

/**
 * Creates a new project in the database.
 * 
 * @param name - The name of the project.
 * @param description - A brief description of the project.
 * @param ownerId - The UUID of the user who owns the project.
 * @returns A Promise resolving to the newly created project's ID.
 * @throws Error if project creation fails or if adding the owner as a team member fails.
 */
export const createProject = async (
  name: string,
  description: string,
  ownerId: string
): Promise<string> => {
  // Create project
  // Note: created_by is set automatically by DEFAULT auth.uid() in the database
  // We only set owner_id explicitly
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      owner_id: ownerId,
      status: 'active',
      // created_by will be set automatically by DEFAULT auth.uid()
    })
    .select()
    .single()

  if (projectError || !projectData) {
    throw new Error(projectError?.message || 'Failed to create project')
  }

  // Get owner email
  const { data: ownerData } = await supabase
    .from('users')
    .select('email')
    .eq('id', ownerId)
    .single()

  // Add owner as team member
  const { error: teamError } = await supabase
    .from('team_members')
    .insert({
      project_id: projectData.id,
      user_id: ownerId,
      email: ownerData?.email || '',
      role: 'owner',
    })

  if (teamError) {
    await supabase.from('projects').delete().eq('id', projectData.id)
    throw new Error(teamError.message || 'Failed to add project owner to team')
  }

  return projectData.id
}

/**
 * Retrieves a project by its ID.
 * 
 * @param projectId - The UUID of the project to retrieve.
 * @returns A Promise resolving to the Project object or null if not found.
 */
export const getProject = async (projectId: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    ownerId: data.owner_id,
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

/**
 * Retrieves all projects associated with a user (owned or member).
 * 
 * @param userId - The UUID of the user.
 * @returns A Promise resolving to an array of Project objects.
 */
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  // Get projects where user is owner
  const { data: ownedProjects, error: ownedError } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)

  // Get projects where user is a member
  const { data: memberProjects, error: memberError } = await supabase
    .from('team_members')
    .select('project_id, projects(*)')
    .eq('user_id', userId)

  if (ownedError || memberError) {
    console.error('Error fetching projects:', ownedError || memberError)
    return []
  }

  type RawProject = {
    id: string
    name: string
    description: string
    owner_id: string
    status: 'active' | 'archived' | 'completed'
    created_at: string
    updated_at: string
  }

  const allProjects = [
    ...(ownedProjects || []),
    ...(memberProjects?.map((m) => m.projects) || []),
  ].filter(Boolean) as RawProject[]

  // Remove duplicates
  const uniqueProjects = Array.from(new Map(allProjects.map((p) => [p.id, p])).values())

  return uniqueProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    ownerId: p.owner_id,
    status: p.status,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  }))
}

/**
 * Updates project details.
 * 
 * @param projectId - The unique identifier of the project.
 * @param updates - An object containing the fields to update (name, description, status).
 * @returns A promise that resolves when the project is updated.
 * @throws Will throw an error if the database operation fails.
 */
export const updateProject = async (
  projectId: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'status'>>
): Promise<void> => {
  const updateData: Record<string, unknown> = {}

  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.status !== undefined) updateData.status = updates.status

  // updated_at is handled by trigger
  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Deletes a project and all associated data.
 * 
 * This function performs a comprehensive cleanup:
 * 1. Retrieves all associated file URLs (documents, photos, issues, scans, blueprints).
 * 2. Deletes all physical files from Supabase Storage.
 * 3. Deletes the project record from the database (cascading delete handles related DB records).
 * 
 * @param projectId - The unique identifier of the project to delete.
 * @returns A promise that resolves when the project and its assets are deleted.
 * @throws Will throw an error if fetching related assets or deletion fails.
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  // Gather storage paths before cascading deletes run
  const [documents, progressPhotos, issues, scans, projectFiles, blueprints] = await Promise.all([
    supabase.from('documents').select('file_url').eq('project_id', projectId),
    supabase.from('progress_photos').select('photo_url').eq('project_id', projectId),
    supabase.from('issues').select('photo_url').eq('project_id', projectId),
    supabase.from('scans').select('url').eq('project_id', projectId),
    supabase.from('project_files').select('file_url').eq('project_id', projectId),
    supabase.from('blueprints').select('png_url, json_url').eq('project_id', projectId).maybeSingle(),
  ])

  const queryErrors = [
    documents.error,
    progressPhotos.error,
    issues.error,
    scans.error,
    projectFiles.error,
    blueprints.error,
  ].filter(Boolean)

  if (queryErrors.length > 0) {
    throw new Error('Failed to load related project assets for deletion')
  }

  const storagePaths: string[] = []

  documents.data?.forEach((doc) => {
    const path = extractStoragePath(doc.file_url)
    if (path) storagePaths.push(path)
  })

  progressPhotos.data?.forEach((photo) => {
    const path = extractStoragePath(photo.photo_url)
    if (path) storagePaths.push(path)
  })

  issues.data?.forEach((issue) => {
    const path = extractStoragePath(issue.photo_url)
    if (path) storagePaths.push(path)
  })

  scans.data?.forEach((scan) => {
    const path = extractStoragePath(scan.url)
    if (path) storagePaths.push(path)
  })

  projectFiles.data?.forEach((file) => {
    const path = extractStoragePath(file.file_url)
    if (path) storagePaths.push(path)
  })

  const blueprintRecord = blueprints.data
  if (blueprintRecord) {
    const pngPath = extractStoragePath(blueprintRecord.png_url)
    const jsonPath = extractStoragePath(blueprintRecord.json_url)
    if (pngPath) storagePaths.push(pngPath)
    if (jsonPath) storagePaths.push(jsonPath)
  }

  // Remove storage assets first to avoid orphaned files
  await deleteStorageObjects(storagePaths)

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Retrieves all scans associated with a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to an array of scan objects.
 */
export const getProjectScans = async (projectId: string): Promise<Scan[]> => {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((scan) => ({
    id: scan.id,
    name: scan.name,
    url: scan.url,
    type: scan.type,
    uploadedBy: scan.uploaded_by,
    uploadedAt: new Date(scan.uploaded_at),
    createdAt: new Date(scan.uploaded_at), // Fallback
    updatedAt: new Date(scan.uploaded_at), // Fallback
    projectId: scan.project_id,
  }))
}

/**
 * Retrieves all team members for a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @returns A promise that resolves to an array of team member objects.
 */
export const getProjectTeam = async (projectId: string): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      users:user_id (
        display_name,
        avatar
      )
    `)
    .eq('project_id', projectId)
    .order('joined_at', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((member) => ({
    id: member.id,
    userId: member.user_id,
    email: member.email,
    role: member.role,
    joinedAt: new Date(member.joined_at),
    user: member.users
      ? {
        displayName: member.users.display_name || member.email,
        avatar: member.users.avatar || undefined,
      }
      : undefined,
  }))
}

/**
 * Adds a new team member to a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @param userId - The unique identifier of the user to add.
 * @param email - The email address of the user.
 * @param role - The role to assign ('editor' or 'viewer'). Default is 'viewer'.
 * @returns A promise that resolves when the member is added.
 * @throws Will throw an error if the user is already a member or if the database operation fails.
 */
export const addTeamMember = async (
  projectId: string,
  userId: string,
  email: string,
  role: 'editor' | 'viewer' = 'viewer'
): Promise<void> => {
  // Check if user is already a member
  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    throw new Error('User is already a member of this project')
  }

  const { error } = await supabase
    .from('team_members')
    .insert({
      project_id: projectId,
      user_id: userId,
      email,
      role,
    })

  if (error) {
    throw new Error(error.message || 'Failed to add team member')
  }
}

/**
 * Updates the role of a team member.
 * 
 * @param projectId - The unique identifier of the project.
 * @param memberId - The unique identifier of the team member record.
 * @param role - The new role ('editor' or 'viewer').
 * @returns A promise that resolves when the role is updated.
 * @throws Will throw an error if the database operation fails.
 */
export const updateTeamMemberRole = async (
  projectId: string,
  memberId: string,
  role: 'editor' | 'viewer'
): Promise<void> => {
  const { error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('id', memberId)
    .eq('project_id', projectId)

  if (error) {
    throw new Error(error.message || 'Failed to update member role')
  }
}

/**
 * Deletes a scan from a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @param scanId - The unique identifier of the scan to delete.
 * @returns A promise that resolves when the scan is deleted.
 * @throws Will throw an error if the database operation fails.
 */
export const deleteScan = async (projectId: string, scanId: string): Promise<void> => {
  const { error } = await supabase
    .from('scans')
    .delete()
    .eq('id', scanId)
    .eq('project_id', projectId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Removes a team member from a project.
 * 
 * @param projectId - The unique identifier of the project.
 * @param memberId - The unique identifier of the team member record to remove.
 * @returns A promise that resolves when the member is removed.
 * @throws Will throw an error if the database operation fails.
 */
export const removeTeamMember = async (projectId: string, memberId: string): Promise<void> => {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId)
    .eq('project_id', projectId)

  if (error) {
    throw new Error(error.message)
  }
}
