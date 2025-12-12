import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Upload,
  Trash2,
  FileText,
  UserPlus,
  Calendar,
  Image as ImageIcon,
  AlertTriangle,
  PenTool,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { FileUpload } from '@/components/FileUpload'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { ProjectHeader } from '@/features/projects/components/ProjectHeader'
import { ProjectStats } from '@/features/projects/components/ProjectStats'
import { ProjectMembers } from '@/features/projects/components/ProjectMembers'
import { ProjectFiles } from '@/features/projects/components/ProjectFiles'
import { ModuleButton } from '@/features/projects/components/ModuleButton'
import { InviteMemberModal } from '@/features/projects/components/InviteMemberModal'
import { ProjectSettingsModal } from '@/features/projects/components/ProjectSettingsModal'
import { DeleteProjectModal } from '@/features/projects/components/DeleteProjectModal'
import { ScanPreviewModal } from '@/features/projects/components/ScanPreviewModal'
import { useProjectLogic } from '@/features/projects/hooks/useProjectLogic'

/**
 * ProjectDetail - Project management page with tabs for overview, scans, and team
 * 
 * Refactored from 423 to ~200 lines by extracting:
 * - ModuleButton: Reusable navigation button
 * - InviteMemberModal: Team member invitation form
 * - ProjectSettingsModal: Project settings form
 * - DeleteProjectModal: Deletion confirmation
 * - ScanPreviewModal: Scan preview with download
 */
export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toasts, dismissToast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  const {
    project,
    scans,
    team,
    loading,
    isOwner,
    isMember,
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
    projectForm,
    inviteForm,
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
      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                <ModuleButton icon={AlertTriangle} label="Issues" onClick={() => navigate(`/projects/${id}/issues`)} />
                <ModuleButton icon={ImageIcon} label="Progress Photos" onClick={() => navigate(`/projects/${id}/progress`)} />
                <ModuleButton icon={FileText} label="Budget" onClick={() => navigate(`/projects/${id}/budget`)} />
                <ModuleButton icon={FileText} label="Documents" onClick={() => navigate(`/projects/${id}/documents`)} />
                <ModuleButton icon={PenTool} label="CAD Blueprint" onClick={() => navigate(`/projects/${id}/blueprint`)} />
                <ModuleButton icon={FileText} label="Inventory" onClick={() => navigate(`/projects/${id}/inventory`)} />
                <ModuleButton icon={Calendar} label="Timeline" onClick={() => navigate(`/projects/${id}/timeline`)} />
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

      {/* Modals */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Scan"
      >
        <FileUpload onUpload={handleUploadScan} />
      </Modal>

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        form={inviteForm}
        onSubmit={handleInviteMember}
      />

      <ProjectSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        form={projectForm}
        onSubmit={handleUpdateProject}
      />

      <DeleteProjectModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProject}
      />

      <ScanPreviewModal
        scan={previewScan}
        onClose={() => setPreviewScan(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
