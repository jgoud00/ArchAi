import { supabase } from './supabase'
import { Project, Scan, TeamMember } from '../types'

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

const chunkArray = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

const deleteStorageObjects = async (paths: string[]): Promise<void> => {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)))
  if (uniquePaths.length === 0) return

  for (const batch of chunkArray(uniquePaths, 50)) {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(batch)
    if (error) {
      throw new Error(error.message || 'Failed to remove project files from storage')
    }
  }
}

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

  // Combine owned and member projects
  const allProjects: any[] = []
  const projectIds = new Set<string>()

  // Add owned projects
  if (ownedProjects) {
    ownedProjects.forEach((project: any) => {
      allProjects.push(project)
      projectIds.add(project.id)
    })
  }

  // Add member projects (avoid duplicates)
  if (memberProjects) {
    memberProjects.forEach((item: any) => {
      if (item.projects && !projectIds.has(item.projects.id)) {
        allProjects.push(item.projects)
        projectIds.add(item.projects.id)
      }
    })
  }

  // Transform data and get counts efficiently (batch queries instead of N+1)
  const projectIdArray = Array.from(projectIds)
  if (projectIdArray.length === 0) {
    return []
  }

  // Batch fetch all counts in parallel (4 queries total instead of 4*N queries)
  const [scanCountsData, memberCountsData, fileCountsData, commentCountsData] = await Promise.all([
    // Get all scan counts
    supabase
      .from('scans')
      .select('project_id')
      .in('project_id', projectIdArray),
    // Get all member counts
    supabase
      .from('team_members')
      .select('project_id')
      .in('project_id', projectIdArray),
    // Get all file counts
    supabase
      .from('project_files')
      .select('project_id')
      .in('project_id', projectIdArray),
    // Get all comment counts
    supabase
      .from('project_comments')
      .select('project_id')
      .in('project_id', projectIdArray),
  ])

  // Count occurrences per project
  const countByProjectId = (data: any[]): Record<string, number> => {
    const counts: Record<string, number> = {}
    data?.forEach((item) => {
      counts[item.project_id] = (counts[item.project_id] || 0) + 1
    })
    return counts
  }

  const scanCounts = countByProjectId(scanCountsData.data || [])
  const memberCounts = countByProjectId(memberCountsData.data || [])
  const fileCounts = countByProjectId(fileCountsData.data || [])
  const commentCounts = countByProjectId(commentCountsData.data || [])

  // Transform projects with counts
  const transformedProjects: Project[] = allProjects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.owner_id,
    status: project.status,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
    scanCount: scanCounts[project.id] || 0,
    memberCount: memberCounts[project.id] || 0,
    fileCount: fileCounts[project.id] || 0,
    commentCount: commentCounts[project.id] || 0,
  }))

  return transformedProjects
}

export const updateProject = async (
  projectId: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'status'>>
): Promise<void> => {
  const updateData: any = {}

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
    projectId: scan.project_id,
  }))
}

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

  return data.map((member: any) => ({
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
 * Add a team member to a project
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
 * Update team member role
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