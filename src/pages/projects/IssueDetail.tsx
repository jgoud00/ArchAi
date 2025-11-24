import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { getIssue, updateIssue, deleteIssue } from '@/services/issues'
import { useAuthStore } from '@/store/authStore'
import { Issue } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

export const IssueDetail = () => {
  const { id, issueId } = useParams<{ id: string; issueId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [status, setStatus] = useState<'open' | 'in_progress' | 'resolved'>('open')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  useEffect(() => {
    if (issueId) {
      loadIssue()
    }
  }, [issueId])

  useEffect(() => {
    if (issue) {
      setStatus(issue.status)
      setPriority(issue.priority)
    }
  }, [issue])

  const loadIssue = async () => {
    if (!issueId) return
    try {
      setLoading(true)
      const issueData = await getIssue(issueId)
      setIssue(issueData)
    } catch (error: any) {
      showToast(error.message || 'Failed to load issue', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!issue) return
    try {
      await updateIssue(issue.id, { status, priority })
      showToast('Issue updated successfully', 'success')
      setEditModalOpen(false)
      loadIssue()
    } catch (error: any) {
      showToast(error.message || 'Failed to update issue', 'error')
    }
  }

  const handleDelete = async () => {
    if (!issue) return
    try {
      await deleteIssue(issue.id)
      showToast('Issue deleted successfully', 'success')
      navigate(`/projects/${id}/issues`)
    } catch (error: any) {
      showToast(error.message || 'Failed to delete issue', 'error')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Issue not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}/issues`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{issue.title}</h1>
          <p className="text-muted-foreground mt-1">Created {format(issue.createdAt, 'MMM d, yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                  {issue.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <div className="mt-1">
                <Badge variant={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
              </div>
            </div>
            {issue.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">{issue.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {issue.photoUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={issue.photoUrl}
                alt={issue.title}
                className="w-full rounded-lg"
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Issue"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Issue"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this issue? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

