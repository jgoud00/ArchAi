import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Upload,
  Download,
  Trash2,
  FileText,
  Plus,
  UserPlus,
  Settings as SettingsIcon,
  Users,
  Calendar,
  Image as ImageIcon,
  AlertTriangle,
  X,
} from 'lucide-react'
import { ShowIfHasRole } from '@/components/RoleGuard'
import {
  getProject,
  getProjectScans,
  getProjectTeam,
  updateProject,
  deleteProject,
  deleteScan,
  removeTeamMember,
} from '@/services/projects'
import { uploadScan, deleteScanFile } from '@/services/storage'
import { generateProjectReport } from '@/services/reports'
import { useAuthStore } from '@/store/authStore'
import { Project, Scan, TeamMember } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { FileUpload } from '@/components/FileUpload'
import { Input } from '@/components/ui/Input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, inviteMemberSchema } from '@/utils/validators'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { z } from 'zod'
// TEMP: Auth bypass - import supabase for invite member (will be used when auth restored)
import { supabase } from '@/services/supabase'

type ProjectFormData = z.infer<typeof projectSchema>
type InviteFormData = z.infer<typeof inviteMemberSchema>

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toasts, showToast, dismissToast } = useToast()
  
  const [project, setProject] = useState<Project | null>(null)
  const [scans, setScans] = useState<Scan[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [previewScan, setPreviewScan] = useState<Scan | null>(null)

  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteMemberSchema),
  })

  useEffect(() => {
    if (id && user) {
      loadProjectData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]) // loadProjectData is stable and doesn't need to be in deps

  useEffect(() => {
    if (project) {
      projectForm.reset({
        name: project.name,
        description: project.description,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]) // projectForm.reset is stable

  const loadProjectData = async () => {
    if (!id) return
    if (!user) return

    try {
      setLoading(true)
      const [projectData, scansData, teamData] = await Promise.all([
        getProject(id),
        getProjectScans(id),
        getProjectTeam(id),
      ])

      if (!projectData) {
        showToast('Project not found', 'error')
        navigate('/dashboard')
        return
      }

      setProject(projectData)
      setScans(scansData)
      setTeam(teamData)
    } catch (error: any) {
      showToast('Failed to load project data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const isOwner = project?.ownerId === user?.uid
  const isMember = team.some((member) => member.userId === user?.uid)

  const handleUploadScan = async (file: File, onProgress: (progress: number) => void) => {
    if (!id || !user?.uid) return

    try {
      await uploadScan(file, id, user.uid, onProgress)

      showToast('Scan uploaded successfully!', 'success')
      setUploadModalOpen(false)
      await loadProjectData()
    } catch (error: any) {
      showToast(error.message || 'Upload failed. Please try again.', 'error')
      throw error
    }
  }

  const handleDeleteScan = async (scan: Scan) => {
    if (!id || !isOwner) return

    try {
      // Delete from Supabase database
      await deleteScan(id, scan.id)
      // Delete from Storage
      await deleteScanFile(scan.url)
      showToast('Scan deleted successfully', 'success')
      await loadProjectData()
    } catch (error: any) {
      showToast('Failed to delete scan', 'error')
    }
  }

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!id || !isOwner) return

    try {
      await updateProject(id, data)
      showToast('Project updated successfully!', 'success')
      setSettingsModalOpen(false)
      await loadProjectData()
    } catch (error: any) {
      showToast('Failed to update project', 'error')
    }
  }

  const handleDeleteProject = async () => {
    if (!id || !isOwner) return

    try {
      await deleteProject(id)
      showToast('Project deleted successfully', 'success')
      navigate('/dashboard')
    } catch (error: any) {
      showToast('Failed to delete project', 'error')
    }
  }

  const handleInviteMember = async (data: InviteFormData) => {
    if (!id || !isOwner || !project) return

    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', data.email)
        .single()
      
      if (userError || !userData) {
        showToast('User not found. They need to sign up first.', 'warning')
        return
      }

      // Check if already a member
      const existingMember = team.find((m) => m.userId === userData.id)
      if (existingMember) {
        showToast('User is already a member of this project', 'warning')
        return
      }

      // Use role from form, default to 'viewer' if not provided
      const memberRole = (data.role || 'viewer') as 'editor' | 'viewer'

      // Add to team
      const { error: teamError } = await supabase
        .from('team_members')
        .insert({
          project_id: id,
          user_id: userData.id,
          email: data.email,
          role: memberRole,
        })

      if (teamError) {
        throw teamError
      }

      showToast('Member invited successfully!', 'success')
      setInviteModalOpen(false)
      inviteForm.reset()
      await loadProjectData()
    } catch (error: any) {
      showToast(error.message || 'Failed to invite member', 'error')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!id || !isOwner) return

    try {
      await removeTeamMember(id, memberId)
      showToast('Member removed successfully', 'success')
      await loadProjectData()
    } catch (error: any) {
      showToast('Failed to remove member', 'error')
    }
  }

  const handleGenerateReport = async () => {
    if (!project) return

    try {
      await generateProjectReport(project, scans)
      showToast('Report generated successfully!', 'success')
    } catch (error: any) {
      showToast('Failed to generate report', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-1">{project.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {format(project.createdAt, 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button onClick={() => setSettingsModalOpen(true)}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scans">Scans ({scans.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({team.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Scans</p>
                    <p className="text-2xl font-bold mt-1">{scans.length}</p>
                  </div>
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                    <p className="text-2xl font-bold mt-1">{team.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(isOwner || isMember) && (
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Scan
                  </Button>
                )}
                {isOwner && (
                  <>
                    <Button variant="outline" onClick={() => setInviteModalOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                    {/* Only admins and supervisors can delete projects */}
                    <ShowIfHasRole requiredRole={['admin', 'supervisor']}>
                      <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </Button>
                    </ShowIfHasRole>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Modules</CardTitle>
              <CardDescription>Access all project management features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4"
                  onClick={() => navigate(`/projects/${id}/issues`)}
                >
                  <AlertTriangle className="h-5 w-5 mb-2" />
                  Issues
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4"
                  onClick={() => navigate(`/projects/${id}/progress`)}
                >
                  <ImageIcon className="h-5 w-5 mb-2" />
                  Progress Photos
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4"
                  onClick={() => navigate(`/projects/${id}/budget`)}
                >
                  <FileText className="h-5 w-5 mb-2" />
                  Budget
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4"
                  onClick={() => navigate(`/projects/${id}/documents`)}
                >
                  <FileText className="h-5 w-5 mb-2" />
                  Documents
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4"
                  onClick={() => navigate(`/projects/${id}/sketch`)}
                >
                  <FileText className="h-5 w-5 mb-2" />
                  Blueprint
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4"
                  onClick={() => navigate(`/projects/${id}/inventory`)}
                >
                  <FileText className="h-5 w-5 mb-2" />
                  Inventory
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4"
                  onClick={() => navigate(`/projects/${id}/timeline`)}
                >
                  <Calendar className="h-5 w-5 mb-2" />
                  Timeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scans Tab */}
        <TabsContent value="scans" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project Scans</h2>
            {(isOwner || isMember) && (
              <Button onClick={() => setUploadModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Scan
              </Button>
            )}
          </div>

          {scans.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first scan to get started
                </p>
                {(isOwner || isMember) && (
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Scan
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {scans.map((scan) => (
                <Card key={scan.id} className="overflow-hidden">
                  <div
                    className="relative aspect-video bg-muted cursor-pointer"
                    onClick={() => setPreviewScan(scan)}
                  >
                    {scan.type === 'image' ? (
                      <img
                        src={scan.url}
                        alt={scan.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={scan.url}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {isOwner && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this scan?')) {
                            handleDeleteScan(scan)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{scan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(scan.uploadedAt, 'MMM dd, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Team Members</h2>
            {isOwner && (
              <Button onClick={() => setInviteModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {team.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Joined {format(member.joinedAt, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  {isOwner && member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Remove this member from the project?')) {
                          handleRemoveMember(member.id)
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Scan"
      >
        <FileUpload onUpload={handleUploadScan} />
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false)
          inviteForm.reset()
        }}
        title="Invite Team Member"
      >
        <form onSubmit={inviteForm.handleSubmit(handleInviteMember)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              {...inviteForm.register('email')}
            />
            {inviteForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {inviteForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <select
              id="role"
              {...inviteForm.register('role')}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              defaultValue="viewer"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            {inviteForm.formState.errors.role && (
              <p className="text-sm text-destructive">
                {inviteForm.formState.errors.role.message}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setInviteModalOpen(false)
                inviteForm.reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Invite</Button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsModalOpen}
        onClose={() => {
          setSettingsModalOpen(false)
          projectForm.reset()
        }}
        title="Project Settings"
      >
        <form onSubmit={projectForm.handleSubmit(handleUpdateProject)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Project Name
            </label>
            <Input
              id="name"
              {...projectForm.register('name')}
              className={projectForm.formState.errors.name ? 'border-destructive' : ''}
            />
            {projectForm.formState.errors.name && (
              <p className="text-sm text-destructive">
                {projectForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              {...projectForm.register('description')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {projectForm.formState.errors.description && (
              <p className="text-sm text-destructive">
                {projectForm.formState.errors.description.message}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSettingsModalOpen(false)
                projectForm.reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium">Are you sure you want to delete this project?</p>
          </div>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All scans and team data will be permanently deleted.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewScan && (
        <Modal
          isOpen={!!previewScan}
          onClose={() => setPreviewScan(null)}
          title={previewScan.name}
          className="max-w-4xl"
        >
          <div className="space-y-4">
            {previewScan.type === 'image' ? (
              <img src={previewScan.url} alt={previewScan.name} className="w-full rounded-lg" />
            ) : (
              <video src={previewScan.url} controls className="w-full rounded-lg" />
            )}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Uploaded {format(previewScan.uploadedAt, 'MMM dd, yyyy')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(previewScan.url, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
