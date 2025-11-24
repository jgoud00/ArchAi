import { useState, useEffect } from 'react'
import { getProject, getUserProjects } from '@/services/projects'
import { Project } from '@/types'

export const useProject = (projectId: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    loadProject()
  }, [projectId])

  const loadProject = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      setError(null)
      const projectData = await getProject(projectId)
      setProject(projectData)
    } catch (err: any) {
      setError(err.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  return { project, loading, error, refetch: loadProject }
}
