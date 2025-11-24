import { useEffect, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAuthStore } from '@/store/authStore'
import { getProjectTasks } from '@/services/tasks'
import { getUserProjects } from '@/services/projects'
import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'

export const Calendar = () => {
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      // Get all projects user has access to
      const userProjects = await getUserProjects(user.uid)
      
      // Get tasks from all projects
      const allTasks: Task[] = []
      for (const project of userProjects) {
        const projectTasks = await getProjectTasks(project.id)
        allTasks.push(...projectTasks)
      }
      
      setTasks(allTasks)
    } catch (error: any) {
      showToast('Failed to load tasks', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.uid, showToast])

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user, loadTasks])

  const calendarEvents = tasks.map(task => ({
    id: task.id,
    title: task.taskName,
    start: task.startDate,
    end: task.endDate,
    backgroundColor: task.status === 'completed' ? '#10b981' : task.status === 'in_progress' ? '#3b82f6' : '#6b7280',
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">View and manage project tasks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="[&_.fc]:bg-background [&_.fc]:text-foreground">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              height="auto"
              editable={false}
              selectable={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

