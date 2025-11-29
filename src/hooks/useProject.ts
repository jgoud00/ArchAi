import { useState, useEffect } from 'react'
import { getProject } from '@/services/projects'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]) // loadProject is stable and doesn't need to be in deps

  const loadProject = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      setError(null)
      const projectData = await getProject(projectId)
      setProject(projectData)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load project'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return { project, loading, error, refetch: loadProject }
}
