import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Image as ImageIcon, Users, AlertTriangle } from 'lucide-react'
import { getUserProjects, createProject } from '@/services/projects'
import { getBudgetAlerts } from '@/services/budgets'
import { useAuthStore } from '@/store/authStore'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/utils/validators'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { z } from 'zod'
import { Project, BudgetAlert } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { ShowIfHasRole } from '@/components/RoleGuard'
import { Badge } from '@/components/ui/Badge'
import { SearchBar } from '@/components/SearchBar'

type ProjectFormData = z.infer<typeof projectSchema>

export const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toasts, showToast, dismissToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const loadBudgetAlerts = useCallback(async () => {
    try {
      const alerts = await getBudgetAlerts()
      setBudgetAlerts(alerts)
    } catch (error) {
      console.error('Failed to load budget alerts:', error)
    }
  }, [])

  const loadProjects = useCallback(async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userProjects = await getUserProjects(user.uid)
      setProjects(userProjects)
      setFilteredProjects(userProjects)
    } catch (error: any) {
      showToast('Failed to load projects. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.uid, showToast])

  useEffect(() => {
    if (user) {
      loadProjects()
      loadBudgetAlerts()
    } else {
      setLoading(false)
    }
  }, [user, loadProjects, loadBudgetAlerts])

  const handleSearch = (query: string, filters: any) => {
    let filtered = [...projects]

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status)
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(p => new Date(p.createdAt) <= new Date(filters.dateTo))
    }

    setFilteredProjects(filtered)
  }

  const onCreateProject = async (data: ProjectFormData) => {
    if (!user?.uid) return

    try {
      setCreating(true)
      const projectId = await createProject(data.name, data.description, user.uid)
      showToast('Project created successfully!', 'success')
      setCreateModalOpen(false)
      reset()
      await loadProjects()
      navigate(`/projects/${projectId}`)
    } catch (error: any) {
      showToast(error.message || 'Failed to create project. Please try again.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const totalScans = projects.reduce((sum, p) => sum + (p.scanCount || 0), 0)
  const totalMembers = projects.reduce((sum, p) => sum + (p.memberCount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your construction projects</p>
        </div>
        {/* Only users, supervisors, and admins can create projects */}
        <ShowIfHasRole requiredRole={['user', 'supervisor', 'admin']}>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </ShowIfHasRole>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">Budget Alerts</h3>
            </div>
            <div className="space-y-2">
              {budgetAlerts.map((alert) => (
                <div key={alert.projectId} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{alert.projectName}</span>
                  <Badge variant="destructive">
                    {alert.exceededByPercent.toFixed(1)}% over threshold
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold mt-1">{filteredProjects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold mt-1">{totalScans}</p>
              </div>
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold mt-1">{totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} projects={projects} />

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to get started
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          reset()
        }}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit(onCreateProject)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Project Name
            </label>
            <Input
              id="name"
              placeholder="My Construction Project"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Project description..."
              {...register('description')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}