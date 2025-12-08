import { useEffect, useState, useCallback, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction'
import { useAuthStore } from '@/store/authStore'
import { Task, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/services/supabase'
import { DatesSetArg, EventDropArg } from '@fullcalendar/core'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getUserProjects } from '@/services/projects'
import { createTask } from '@/services/tasks'
import { logger } from '@/utils/logger'

export const Calendar = () => {
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const calendarRef = useRef<FullCalendar>(null)

  // Create Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [newTask, setNewTask] = useState({
    projectId: '',
    taskName: '',
    startDate: '',
    endDate: ''
  })

  const fetchTasks = useCallback(async (start: Date, end: Date) => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects!inner(id, name, owner_id)
        `)
        .gte('start_date', start.toISOString())
        .lte('end_date', end.toISOString())

      if (error) throw error
      setTasks(data as unknown as Task[])
    } catch (error) {
      logger.error('Failed to load tasks', error)
      showToast('Failed to load tasks', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.uid, showToast])

  const fetchProjects = useCallback(async () => {
    if (!user?.uid) return
    try {
      const userProjects = await getUserProjects(user.uid)
      setProjects(userProjects)
      if (userProjects.length > 0) {
        setNewTask(prev => ({ ...prev, projectId: userProjects[0].id }))
      }
    } catch (error) {
      logger.error('Failed to load projects', error)
    }
  }, [user?.uid])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    fetchTasks(arg.start, arg.end)
  }, [fetchTasks])

  const handleDateClick = (arg: DateClickArg) => {
    setNewTask({
      projectId: projects[0]?.id || '',
      taskName: '',
      startDate: arg.dateStr,
      endDate: arg.dateStr
    })
    setIsModalOpen(true)
  }

  const handleCreateTask = async () => {
    if (!newTask.projectId || !newTask.taskName || !newTask.startDate || !newTask.endDate) {
      showToast('Please fill in all fields', 'error')
      return
    }

    try {
      await createTask(
        newTask.projectId,
        newTask.taskName,
        new Date(newTask.startDate),
        new Date(newTask.endDate),
        'pending'
      )
      showToast('Task created successfully', 'success')
      setIsModalOpen(false)
      // Refresh tasks
      if (calendarRef.current) {
        const api = calendarRef.current.getApi()
        fetchTasks(api.view.activeStart, api.view.activeEnd)
      }
    } catch (error) {
      logger.error('Failed to create task', error)
      showToast('Failed to create task', 'error')
    }
  }

  const handleEventDrop = async (arg: EventDropArg) => {
    const { event } = arg
    const newStart = event.start
    const newEnd = event.end || event.start

    if (!newStart) return

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          start_date: newStart.toISOString(),
          end_date: newEnd?.toISOString()
        })
        .eq('id', event.id)

      if (error) throw error
      showToast('Task updated', 'success')
    } catch (error) {
      logger.error('Failed to update task (drag)', error)
      showToast('Failed to update task', 'error')
      arg.revert()
    }
  }

  const handleEventResize = async (arg: EventResizeDoneArg) => {
    const { event } = arg
    const newStart = event.start
    const newEnd = event.end

    if (!newStart || !newEnd) return

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          start_date: newStart.toISOString(),
          end_date: newEnd.toISOString()
        })
        .eq('id', event.id)

      if (error) throw error
      showToast('Task updated', 'success')
    } catch (error) {
      logger.error('Failed to update task (resize)', error)
      showToast('Failed to update task', 'error')
      arg.revert()
    }
  }

  const calendarEvents = tasks.map(task => ({
    id: task.id,
    title: task.taskName,
    start: task.startDate,
    end: task.endDate,
    backgroundColor: task.status === 'completed' ? '#10b981' : task.status === 'in_progress' ? '#3b82f6' : '#6b7280',
    extendedProps: {
      status: task.status
    }
  }))

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
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              height="auto"
              editable={true}
              selectable={true}
              datesSet={handleDatesSet}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              eventClick={(info) => {
                logger.debug('Clicked task:', { task: info.event.toPlainObject() })
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Project</label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newTask.projectId}
              onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Task Name</label>
            <Input
              value={newTask.taskName}
              onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
              placeholder="Task Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </div>
        </div>
      </Modal>

      {loading && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  )
}
