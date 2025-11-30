import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Building2, Paintbrush, Copy, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { createProject } from '@/services/projects'
import { createOrUpdateBudget } from '@/services/budgets'
import { createTask } from '@/services/tasks'
import { useToast } from '@/hooks/useToast'
import { Spinner } from '@/components/ui/Spinner'
import { supabase } from '@/services/supabase'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: string
  default_budget: number
  tasks?: { task_name: string; duration_days: number }[]
}

const iconMap: Record<string, any> = {
  Home,
  Building2,
  Paintbrush,
}

export const Templates = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuthStore()
  const { showToast } = useToast()
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)

  // Admin State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    default_budget: 0,
    icon: 'Home'
  })

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_templates')
        .select(`
          *,
          tasks:project_template_tasks(task_name, duration_days, order_index)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error(error)
      showToast('Failed to load templates', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleCreateFromTemplate = async (template: ProjectTemplate) => {
    if (!user?.uid) return

    try {
      setCreating(template.id)
      const projectId = await createProject(
        template.name,
        template.description,
        user.uid
      )

      // Create default budget if specified
      if (template.default_budget) {
        await createOrUpdateBudget(projectId, template.default_budget, 0)
      }

      // Create default tasks if specified
      if (template.tasks && template.tasks.length > 0) {
        const now = new Date()
        // Sort tasks by order_index if available, but here we just have the array
        // Ideally the query should order them, but let's assume they are somewhat ordered or order doesn't matter for creation time

        // We need to handle async properly in loop
        for (let i = 0; i < template.tasks.length; i++) {
          const task = template.tasks[i]
          const startDate = new Date(now)
          // Simple logic: each task starts 1 week after the previous one? 
          // Or all start now? Or use duration?
          // Let's assume sequential for now based on index
          startDate.setDate(startDate.getDate() + i * 7)

          const endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + (task.duration_days || 7))

          await createTask(
            projectId,
            task.task_name,
            startDate,
            endDate,
            'pending'
          )
        }
      }

      showToast('Project created from template successfully!', 'success')
      navigate(`/projects/${projectId}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create project from template'
      showToast(message, 'error')
    } finally {
      setCreating(null)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const { error } = await supabase
        .from('project_templates')
        .insert([newTemplate])

      if (error) throw error

      showToast('Template created', 'success')
      setIsModalOpen(false)
      fetchTemplates()
    } catch (error) {
      console.error(error)
      showToast('Failed to create template', 'error')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    try {
      const { error } = await supabase
        .from('project_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
      showToast('Template deleted', 'success')
      fetchTemplates()
    } catch (error) {
      console.error(error)
      showToast('Failed to delete template', 'error')
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Templates</h1>
          <p className="text-muted-foreground mt-1">
            Start your project quickly with pre-configured templates
          </p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = iconMap[template.icon] || Home
          const isCreating = creating === template.id

          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow relative group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  {isAdmin() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTemplate(template.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {template.default_budget > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Default Budget: </span>
                      ${template.default_budget.toLocaleString()}
                    </div>
                  )}
                  {template.tasks && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Includes: </span>
                      {template.tasks.length} default tasks
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => handleCreateFromTemplate(template)}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Use Template
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Template"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="Template Name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              placeholder="Description"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default Budget</label>
            <Input
              type="number"
              value={newTemplate.default_budget}
              onChange={(e) => setNewTemplate({ ...newTemplate, default_budget: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTemplate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

