import { supabase } from './supabase'
import { Project, Scan, TeamMember } from '../types'

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
    console.error('Error adding owner to team:', teamError)
    // Continue anyway - project is created
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

  // Transform data and get counts
  const transformedProjects: Project[] = []

  for (const project of allProjects) {
    // Get scan count
    const { count: scanCount } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)

    // Get member count
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)

    // Get file count
    const { count: fileCount } = await supabase
      .from('project_files')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)

    // Get comment count
    const { count: commentCount } = await supabase
      .from('project_comments')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)

    transformedProjects.push({
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.owner_id,
      status: project.status,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
      scanCount: scanCount || 0,
      memberCount: memberCount || 0,
      fileCount: fileCount || 0,
      commentCount: commentCount || 0,
    })
  }

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