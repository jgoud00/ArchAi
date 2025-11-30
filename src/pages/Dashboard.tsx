
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Folder, Users, LayoutDashboard, TrendingUp, Home as HomeIcon } from 'lucide-react'
import { getUserProjects, createProject } from '@/services/projects'
import { getDashboardStats } from '@/services/dashboard'
import { useAuthStore } from '@/store/authStore'
import { ProjectCard } from '@/components/ProjectCard'
import { KPICard } from '@/components/dashboard/KPICard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/utils/validators'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { z } from 'zod'
import { Project } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type ProjectFormData = z.infer<typeof projectSchema>

export const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toasts, showToast, dismissToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeBuilds: 0,
    tasksPending: 0,
    teamMembers: 0
  })

  const loadDashboardData = useCallback(async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const [userProjects, dashboardStats] = await Promise.all([
        getUserProjects(user.uid),
        getDashboardStats(user.uid)
      ])

      setProjects(userProjects)
      setStats({
        totalProjects: dashboardStats.total_projects,
        activeBuilds: dashboardStats.active_builds,
        tasksPending: dashboardStats.tasks_pending,
        teamMembers: dashboardStats.team_members
      })
    } catch (error) {
      showToast('Failed to load dashboard data. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.uid, showToast])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [user, loadDashboardData])

  // Memoize Chart Data calculation (Still using project creation dates for now, 
  // but could be enhanced with a specific RPC for chart data if needed)
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const today = new Date()
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1)
      return {
        name: months[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear()
      }
    })

    return last6Months.map(month => {
      const projectsInMonth = projects.filter(p => {
        const d = new Date(p.createdAt)
        return d.getMonth() === month.monthIndex && d.getFullYear() === month.year
      }).length

      // For tasks, we don't have historical data easily accessible without a complex query.
      // For now, we'll leave tasks as 0 in the chart or remove the line if preferred.
      // To keep the visual, we will just show project trends.
      return {
        name: month.name,
        projects: projectsInMonth,
        tasks: 0 // Placeholder removed, set to 0 to avoid misleading random data
      }
    })
  }, [projects])

  const onCreateProject = async (data: ProjectFormData) => {
    if (!user?.uid) return

    try {
      setCreating(true)
      const projectId = await createProject(data.name, data.description, user.uid)
      showToast('Project created successfully!', 'success')
      setCreateModalOpen(false)
      reset()
      await loadDashboardData()
      navigate(`/projects/${projectId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project. Please try again.'
      showToast(message, 'error')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden p-4 lg:p-8">
      <div className="blueprint-grid absolute inset-0 z-0 opacity-20 pointer-events-none"></div>

      <div className="relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.displayName || 'Architect'}</p>
          </div>
          <Button
            className="btn-primary-enhanced"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" /> New Project
          </Button>
        </header>

        {/* KPIs Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <KPICard title="Total Projects" value={stats.totalProjects} icon={<Folder size={32} />} />
          <KPICard title="Active Builds" value={stats.activeBuilds} icon={<HomeIcon size={32} />} />
          <KPICard title="Tasks Pending" value={stats.tasksPending} icon={<LayoutDashboard size={32} />} />
          <KPICard title="Team Members" value={stats.teamMembers} icon={<Users size={32} />} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects Section */}
          <section className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-semibold text-foreground">Recent Projects</h2>
            {projects.length === 0 ? (
              <div className="glass-dark border border-dashed border-border/50 p-12 rounded-xl text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Folder className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">No projects yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start your journey by creating your first construction project. AI-powered tools await.
                  </p>
                  <Button onClick={() => setCreateModalOpen(true)} className="btn-primary-enhanced">
                    <Plus className="h-4 w-4 mr-2" /> Create Project
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>

          {/* Project Progress Chart Section */}
          <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-semibold text-foreground">Monthly Progress</h2>
            <div className="glass border border-border p-6 rounded-xl h-80 flex items-center justify-center">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projects"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'hsl(var(--secondary))', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--secondary))', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No activity data available</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

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
