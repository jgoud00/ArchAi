import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createTask } from '@/features/projects/services/tasks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const taskSchema = z.object({
  taskName: z.string().min(1, 'Task name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(['pending', 'in_progress', 'completed']),
}).refine((data) => {
  return new Date(data.endDate) >= new Date(data.startDate)
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type TaskFormData = z.infer<typeof taskSchema>

export const NewTask = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  })

  const onSubmit = async (data: TaskFormData) => {
    if (!id) return

    try {
      setLoading(true)
      await createTask(
        id,
        data.taskName,
        new Date(data.startDate),
        new Date(data.endDate),
        data.status
      )
      showToast('Task created successfully', 'success')
      navigate(`/projects/${id}/timeline`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create task'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}/timeline`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-muted-foreground mt-1">Add a new task to the project timeline</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Task Name *</label>
              <Input
                {...register('taskName')}
                placeholder="e.g., Foundation work, Electrical installation"
                className={errors.taskName ? 'border-destructive' : ''}
              />
              {errors.taskName && (
                <p className="text-sm text-destructive mt-1">{errors.taskName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date *</label>
                <Input
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-destructive' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">End Date *</label>
                <Input
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-destructive' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status *</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/projects/${id}/timeline`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Create Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

