import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react'
import { getProjectIssues, deleteIssue } from '@/services/issues'
import { getProject } from '@/services/projects'
import { Issue, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

export const IssuesList = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [projectData, issuesData] = await Promise.all([
        getProject(id),
        getProjectIssues(id),
      ])
      setProject(projectData)
      setIssues(issuesData)
    } catch (error: any) {
      showToast(error.message || 'Failed to load issues', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id, loadData])

  const handleDelete = async () => {
    if (!issueToDelete) return
    try {
      await deleteIssue(issueToDelete.id)
      showToast('Issue deleted successfully', 'success')
      setDeleteModalOpen(false)
      setIssueToDelete(null)
      loadData()
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">{project?.name} - Issues</h1>
          <p className="text-muted-foreground mt-1">Track and manage project issues</p>
        </div>
        <Button onClick={() => navigate(`/projects/${id}/issues/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          New Issue
        </Button>
      </div>

      {issues.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No issues found. Create your first issue to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/projects/${id}/issues/${issue.id}`)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(issue.status)}
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                    </div>
                    {issue.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                    <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Created {format(issue.createdAt, 'MMM d, yyyy')}</span>
                  {issue.photoUrl && (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Has photo
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/projects/${id}/issues/${issue.id}`)
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIssueToDelete(issue)
                      setDeleteModalOpen(true)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setIssueToDelete(null)
        }}
        title="Delete Issue"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this issue? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false)
                setIssueToDelete(null)
              }}
            >
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

