import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { createIssue } from '@/services/issues'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
})

type IssueFormData = z.infer<typeof issueSchema>

export const NewIssue = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: 'medium',
    },
  })

  const onSubmit = async (data: IssueFormData) => {
    if (!id || !user) return

    try {
      setLoading(true)
      await createIssue(id, data.title, data.description || '', data.priority, user.uid, photoFile || undefined)
      showToast('Issue created successfully', 'success')
      navigate(`/projects/${id}/issues`)
    } catch (error: any) {
      showToast(error.message || 'Failed to create issue', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}/issues`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Issue</h1>
          <p className="text-muted-foreground mt-1">Report a new issue for this project</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                {...register('title')}
                placeholder="e.g., Crack in wall"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                {...register('description')}
                placeholder="Describe the issue in detail..."
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority *</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Photo (Optional)</label>
              <div className="border-2 border-dashed border-input rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Upload className="h-4 w-4" />
                  {photoFile ? photoFile.name : 'Click to upload photo'}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/projects/${id}/issues`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Create Issue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

