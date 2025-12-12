
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Folder, Users, LayoutDashboard, Home as HomeIcon, Calendar, FileText, Settings } from 'lucide-react'
import { getUserProjects, createProject } from '@/features/projects/services/projects'
import { getDashboardStats } from '@/features/dashboard/services/dashboard'
import { useAuthStore } from '@/features/auth/store/authStore'
import { KPICard } from '@/features/dashboard/components/KPICard'
import { ProjectsGrid } from '@/features/dashboard/components/ProjectsGrid'
import { QuickActions } from '@/features/dashboard/components/QuickActions'
import { PageLayout } from '@/components/layout/PageLayout'
import { lazy, Suspense } from 'react'

const DashboardChart = lazy(() => import('@/features/dashboard/components/DashboardChart').then(m => ({ default: m.DashboardChart })))
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
import { CardGrid } from '@/components/layout/CardGrid'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { FormField, FormActions, FieldError } from '@/components/ui/FormComponents'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/utils/validators'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { z } from 'zod'
import { Project } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { layout } from '@/styles/designTokens'
import { PageTransition, AnimatedList, FadeIn } from '@/components/ui/animations'

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

  // Memoize Chart Data calculation
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

      return {
        name: month.name,
        projects: projectsInMonth,
        tasks: 0
      }
    })
  }, [projects])

  const onCreateProject = useCallback(async (data: ProjectFormData) => {
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
  }, [user?.uid, showToast, reset, loadDashboardData, navigate])

  const handleOpenCreateModal = useCallback(() => setCreateModalOpen(true), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <PageLayout>
      <PageTransition>
        <div className="blueprint-grid absolute inset-0 -z-10 opacity-30 pointer-events-none mix-blend-multiply dark:mix-blend-overlay"></div>

        <div className={layout.sectionSpacing}>
          <PageHeader
            title="Dashboard Overview"
            description={`Welcome back, ${user?.displayName || 'Architect'}`}
            actions={
              <Button className="btn-primary-enhanced" onClick={handleOpenCreateModal}>
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" /> New Project
              </Button>
            }
          />

          {/* KPIs Section */}
          <Section>
            <CardGrid cols={4}>
              <AnimatedList staggerDelay={75}>
                <KPICard title="Total Projects" value={stats.totalProjects} icon={<Folder size={32} />} />
                <KPICard title="Active Builds" value={stats.activeBuilds} icon={<HomeIcon size={32} />} />
                <KPICard title="Tasks Pending" value={stats.tasksPending} icon={<LayoutDashboard size={32} />} />
                <KPICard title="Team Members" value={stats.teamMembers} icon={<Users size={32} />} />
              </AnimatedList>
            </CardGrid>
          </Section>

          <FadeIn delay={200}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
              {/* Recent Projects Section */}
              <Section className="lg:col-span-2" title="Recent Projects">
                <ProjectsGrid projects={projects} onCreateProject={handleOpenCreateModal} />
              </Section>

              {/* Chart and Quick Actions */}
              <div className="space-y-6">
                <Suspense fallback={<div className="h-80 flex items-center justify-center"><Spinner /></div>}>
                  <DashboardChart data={chartData} />
                </Suspense>

                {/* Quick Actions */}
                <Section title="Quick Actions">
                  <QuickActions
                    items={[
                      {
                        id: 'new-project',
                        title: 'New Project',
                        description: 'Create a new project',
                        icon: <Plus className="h-5 w-5" />,
                        onClick: handleOpenCreateModal,
                      },
                      {
                        id: 'calendar',
                        title: 'Calendar',
                        description: 'View schedule',
                        icon: <Calendar className="h-5 w-5" />,
                        onClick: () => navigate('/calendar'),
                      },
                      {
                        id: 'templates',
                        title: 'Templates',
                        description: 'Browse templates',
                        icon: <FileText className="h-5 w-5" />,
                        onClick: () => navigate('/templates'),
                      },
                      {
                        id: 'settings',
                        title: 'Settings',
                        description: 'Configure app',
                        icon: <Settings className="h-5 w-5" />,
                        onClick: () => navigate('/settings'),
                      },
                    ]}
                  />
                </Section>
              </div>
            </div>
          </FadeIn>
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
            <FormField>
              <label htmlFor="name" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="name"
                placeholder="My Construction Project"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </FormField>

            <FormField>
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Project description..."
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <FieldError>{errors.description?.message}</FieldError>
            </FormField>

            <FormActions>
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
            </FormActions>
          </form>
        </Modal>


        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </PageTransition>
    </PageLayout>
  )
}
