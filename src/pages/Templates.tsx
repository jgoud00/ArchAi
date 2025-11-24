import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Building2, Paintbrush, Copy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { createProject } from '@/services/projects'
import { createOrUpdateBudget } from '@/services/budgets'
import { createTask } from '@/services/tasks'
import { useToast } from '@/hooks/useToast'
import { Spinner } from '@/components/ui/Spinner'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: typeof Home
  defaultBudget?: number
  defaultTasks?: string[]
}

const templates: ProjectTemplate[] = [
  {
    id: 'home-construction',
    name: 'Home Construction',
    description: 'Template for residential home construction projects',
    icon: Home,
    defaultBudget: 500000,
    defaultTasks: [
      'Site Preparation',
      'Foundation',
      'Framing',
      'Roofing',
      'Plumbing',
      'Electrical',
      'Interior Finishing',
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial Building',
    description: 'Template for commercial construction projects',
    icon: Building2,
    defaultBudget: 2000000,
    defaultTasks: [
      'Design & Planning',
      'Permits & Approvals',
      'Site Work',
      'Structure',
      'MEP Systems',
      'Interior Build-out',
      'Final Inspection',
    ],
  },
  {
    id: 'interior-remodel',
    name: 'Interior Remodel',
    description: 'Template for interior renovation projects',
    icon: Paintbrush,
    defaultBudget: 100000,
    defaultTasks: [
      'Design Planning',
      'Demolition',
      'Electrical & Plumbing',
      'Drywall & Painting',
      'Flooring',
      'Fixtures & Finishes',
    ],
  },
]

export const Templates = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const [creating, setCreating] = useState<string | null>(null)

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
      if (template.defaultBudget) {
        // Use static import instead of dynamic import
        await createOrUpdateBudget(projectId, template.defaultBudget, 0)
      }

      // Create default tasks if specified
      if (template.defaultTasks && template.defaultTasks.length > 0) {
        // Use static import instead of dynamic import
        const now = new Date()
        for (let i = 0; i < template.defaultTasks.length; i++) {
          const startDate = new Date(now)
          startDate.setDate(startDate.getDate() + i * 7)
          const endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 7)
          
          await createTask(
            projectId,
            template.defaultTasks[i],
            startDate,
            endDate,
            'pending'
          )
        }
      }

      showToast('Project created from template successfully!', 'success')
      navigate(`/projects/${projectId}`)
    } catch (error: any) {
      showToast(error.message || 'Failed to create project from template', 'error')
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Templates</h1>
        <p className="text-muted-foreground mt-1">
          Start your project quickly with pre-configured templates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = template.icon
          const isCreating = creating === template.id

          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {template.defaultBudget && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Default Budget: </span>
                      ${template.defaultBudget.toLocaleString()}
                    </div>
                  )}
                  {template.defaultTasks && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Includes: </span>
                      {template.defaultTasks.length} default tasks
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
    </div>
  )
}

