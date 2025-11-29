import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Upload,
  Download,
  Trash2,
  FileText,
  UserPlus,
  Calendar,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { FileUpload } from '@/components/FileUpload'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { ProjectHeader } from '@/components/projects/ProjectHeader'
import { ProjectStats } from '@/components/projects/ProjectStats'
import { ProjectMembers } from '@/components/projects/ProjectMembers'
import { ProjectFiles } from '@/components/projects/ProjectFiles'
import { useProjectLogic } from '@/hooks/useProjectLogic'

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { toasts, dismissToast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')

  const {
    project,
    scans,
    team,
    loading,
    isOwner,
    isMember,
    // Modals
    uploadModalOpen,
    setUploadModalOpen,
    inviteModalOpen,
    setInviteModalOpen,
    settingsModalOpen,
    setSettingsModalOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    previewScan,
    setPreviewScan,
    // Forms
    projectForm,
    inviteForm,
    // Handlers
    handleUploadScan,
    handleDeleteScan,
    handleUpdateProject,
    handleDeleteProject,
    handleInviteMember,
    handleRemoveMember,
    handleGenerateReport,
  } = useProjectLogic()

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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <ProjectHeader
        project={project}
        isOwner={isOwner}
        onGenerateReport={handleGenerateReport}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scans">Scans ({scans.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({team.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <ProjectStats
            project={project}
            scansCount={scans.length}
            teamCount={team.length}
          />

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
                    <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </Button>
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
                  className="h-auto flex-col py-4 hover-lift border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => navigate(`/projects/${id}/issues`)}
                >
                  <AlertTriangle className="h-5 w-5 mb-2 text-primary" />
                  Issues
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4 hover-lift border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => navigate(`/projects/${id}/progress`)}
                >
                  <ImageIcon className="h-5 w-5 mb-2 text-primary" />
                  Progress Photos
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4 hover-lift border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => navigate(`/projects/${id}/budget`)}
                >
                  <FileText className="h-5 w-5 mb-2 text-primary" />
                  Budget
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4 hover-lift border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => navigate(`/projects/${id}/documents`)}
                >
                  <FileText className="h-5 w-5 mb-2 text-primary" />
                  Documents
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4 hover-lift border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => navigate(`/projects/${id}/sketch`)}
                >
                  <FileText className="h-5 w-5 mb-2 text-primary" />
                  Blueprint
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4 hover-lift border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => navigate(`/projects/${id}/inventory`)}
                >
                  <FileText className="h-5 w-5 mb-2 text-primary" />
                  Inventory
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col py-4 hover-lift border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => navigate(`/projects/${id}/timeline`)}
                >
                  <Calendar className="h-5 w-5 mb-2 text-primary" />
                  Timeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scans Tab */}
        <TabsContent value="scans" className="space-y-4">
          <ProjectFiles
            scans={scans}
            isOwner={isOwner}
            isMember={isMember}
            onUpload={() => setUploadModalOpen(true)}
            onPreview={setPreviewScan}
            onDelete={(scan) => {
              if (confirm('Are you sure you want to delete this scan?')) {
                handleDeleteScan(scan)
              }
            }}
          />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <ProjectMembers
            team={team}
            isOwner={isOwner}
            onInvite={() => setInviteModalOpen(true)}
            onRemoveMember={(memberId) => {
              if (confirm('Remove this member from the project?')) {
                handleRemoveMember(memberId)
              }
            }}
          />
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
