import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getProjectTasks } from '@/services/tasks'
import { getProject } from '@/services/projects'
import { Task, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'
// @ts-ignore - frappe-gantt doesn't have TypeScript definitions
// @ts-ignore - frappe-gantt doesn't have TypeScript definitions
import Gantt from 'frappe-gantt'

export const Timeline = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const ganttRef = useRef<SVGSVGElement>(null)
  const [ganttInstance, setGanttInstance] = useState<Gantt | null>(null)
  
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [projectData, tasksData] = await Promise.all([
        getProject(id),
        getProjectTasks(id),
      ])
      setProject(projectData)
      setTasks(tasksData)
    } catch (error: any) {
      showToast(error.message || 'Failed to load timeline', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id, loadData])

  useEffect(() => {
    // Clear previous instance
    if (ganttInstance) {
      ganttRef.current!.innerHTML = ''
    }

    if (ganttRef.current && tasks.length > 0) {
      const ganttData = tasks.map((task) => ({
        id: task.id,
        name: task.taskName,
        start: task.startDate.toISOString().split('T')[0],
        end: task.endDate.toISOString().split('T')[0],
        progress: task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0,
        custom_class: task.status,
      }))

      try {
        const gantt = new Gantt(ganttRef.current, ganttData, {
          view_mode: 'Month',
          language: 'en',
          on_click: () => {
            // Handle task click
          },
          on_date_change: () => {
            // Handle date change
          },
          on_progress_change: (_task: any, _progress: number) => {
            // Handle progress change
          },
        })

        setGanttInstance(gantt)
      } catch (error) {
        console.error('Error initializing Gantt chart:', error)
      }
    }
  }, [tasks, ganttInstance])

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
          <h1 className="text-3xl font-bold">{project?.name} - Timeline</h1>
          <p className="text-muted-foreground mt-1">View and manage project timeline</p>
        </div>
        <Button onClick={() => navigate(`/projects/${id}/timeline/new-task`)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gantt Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks yet. Create your first task to see the timeline.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <svg ref={ganttRef} className="w-full" style={{ minHeight: '400px' }} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{task.taskName}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

