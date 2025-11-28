
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Folder, Users, LayoutDashboard, TrendingUp, Home as HomeIcon } from 'lucide-react'
import { getUserProjects, createProject } from '@/services/projects'
import { useAuthStore } from '@/store/authStore'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/utils/validators'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { z } from 'zod'
import { Project, DashboardKPIs, ChartDataPoint } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type ProjectFormData = z.infer<typeof projectSchema>

const KPICard: React.FC<{ title: string; value: string | number; change?: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => (
  <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-cyan-500/30 hover:shadow-lg group">
    <div>
      <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      {change && (
        <p className="text-xs text-green-400 mt-2 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" /> {change} this month
        </p>
      )}
    </div>
    <div className="text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
      {icon}
    </div>
  </div>
)

export const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toasts, showToast, dismissToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // State for KPIs and Chart
  const [kpiData, setKpiData] = useState<DashboardKPIs>({
    totalProjects: 0,
    activeBuilds: 0,
    tasksPending: 0,
    teamMembers: 0
  })
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const loadProjects = useCallback(async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const userProjects = await getUserProjects(user.uid)
      setProjects(userProjects)

      // Calculate KPIs from real data where possible
      const activeCount = userProjects.filter(p => p.status === 'active').length
      const memberCount = userProjects.reduce((sum, p) => sum + (p.memberCount || 0), 0)

      setKpiData({
        totalProjects: userProjects.length,
        activeBuilds: activeCount,
        tasksPending: 0, // Placeholder as we don't have tasks API yet
        teamMembers: memberCount
      })

      // Calculate chart data (last 6 months)
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

      const newChartData = last6Months.map(month => {
        const projectsInMonth = userProjects.filter(p => {
          const d = new Date(p.createdAt)
          return d.getMonth() === month.monthIndex && d.getFullYear() === month.year
        }).length

        return {
          name: month.name,
          projects: projectsInMonth,
          tasks: Math.floor(Math.random() * 10) // Placeholder for tasks
        }
      })

      setChartData(newChartData)

    } catch (error) {
      showToast('Failed to load projects. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.uid, showToast])

  useEffect(() => {
    if (user) {
      loadProjects()
    } else {
      setLoading(false)
    }
  }, [user, loadProjects])

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
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden p-4 lg:p-8">
      <div className="blueprint-grid absolute inset-0 z-0 opacity-10 pointer-events-none"></div>

      <div className="relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-slate-400 mt-1">Welcome back, {user?.displayName || 'Architect'}</p>
          </div>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" /> New Project
          </Button>
        </header>

        {/* KPIs Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Total Projects" value={kpiData.totalProjects} icon={<Folder size={32} />} />
          <KPICard title="Active Builds" value={kpiData.activeBuilds} icon={<HomeIcon size={32} />} />
          <KPICard title="Tasks Pending" value={kpiData.tasksPending} icon={<LayoutDashboard size={32} />} />
          <KPICard title="Team Members" value={kpiData.teamMembers} icon={<Users size={32} />} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects Section */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold text-white">Recent Projects</h2>
            {projects.length === 0 ? (
              <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 p-12 rounded-xl text-center">
                <Folder className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-300">No projects yet</h3>
                <p className="text-slate-500 mb-6">Create your first project to get started</p>
                <Button onClick={() => setCreateModalOpen(true)} variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-950">
                  Create Project
                </Button>
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
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Monthly Progress</h2>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl h-80 flex items-center justify-center">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#94A3B8"
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projects"
                      stroke="#06B6D4"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#06B6D4', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#22D3EE', strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#A78BFA', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-500">
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
