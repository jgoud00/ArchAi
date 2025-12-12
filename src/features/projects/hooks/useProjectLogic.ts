import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/services/supabase'
import {
    getProject,
    getProjectScans,
    getProjectTeam,
    updateProject,
    deleteProject,
    removeTeamMember,
    deleteScan
} from '@/features/projects/services/projects'
import { uploadScan, deleteScanFile } from '@/services/storage'
import { generateProjectReport } from '@/services/reports'
import { projectSchema, inviteMemberSchema } from '@/utils/validators'
import { Project, Scan, TeamMember } from '@/types'

type ProjectFormData = z.infer<typeof projectSchema>
type InviteFormData = z.infer<typeof inviteMemberSchema>

export const useProjectLogic = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { showToast } = useToast()

    const [project, setProject] = useState<Project | null>(null)
    const [scans, setScans] = useState<Scan[]>([])
    const [team, setTeam] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)

    // Modals state
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

    const loadProjectData = useCallback(async () => {
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
        } catch (error: unknown) {
            showToast('Failed to load project data', 'error')
        } finally {
            setLoading(false)
        }
    }, [id, user, navigate, showToast])

    // Initial load
    useEffect(() => {
        if (id && user) {
            loadProjectData()
        }
    }, [id, user, loadProjectData])

    // Reset form when project loads
    useEffect(() => {
        if (project) {
            projectForm.reset({
                name: project.name,
                description: project.description,
            })
        }
    }, [project, projectForm])

    const isOwner = project?.ownerId === user?.uid
    const isMember = team.some((member) => member.userId === user?.uid)

    const handleUploadScan = useCallback(async (file: File, onProgress: (progress: number) => void) => {
        if (!id || !user?.uid) return

        try {
            await uploadScan(file, id, user.uid, onProgress)

            showToast('Scan uploaded successfully!', 'success')
            setUploadModalOpen(false)
            await loadProjectData()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Upload failed. Please try again.'
            showToast(message, 'error')
            throw error
        }
    }, [id, user?.uid, loadProjectData, showToast])

    const handleDeleteScan = useCallback(async (scan: Scan) => {
        if (!id || !isOwner) return

        try {
            await deleteScan(id, scan.id)
            await deleteScanFile(scan.url)
            showToast('Scan deleted successfully', 'success')
            await loadProjectData()
        } catch (error: unknown) {
            showToast('Failed to delete scan', 'error')
        }
    }, [id, isOwner, loadProjectData, showToast])

    const handleUpdateProject = useCallback(async (data: ProjectFormData) => {
        if (!id || !isOwner) return

        try {
            await updateProject(id, data)
            showToast('Project updated successfully!', 'success')
            setSettingsModalOpen(false)
            await loadProjectData()
        } catch (error: unknown) {
            showToast('Failed to update project', 'error')
        }
    }, [id, isOwner, loadProjectData, showToast])

    const handleDeleteProject = useCallback(async () => {
        if (!id || !isOwner) return

        try {
            await deleteProject(id)
            showToast('Project deleted successfully', 'success')
            navigate('/dashboard')
        } catch (error: unknown) {
            showToast('Failed to delete project', 'error')
        }
    }, [id, isOwner, navigate, showToast])

    const handleInviteMember = useCallback(async (data: InviteFormData) => {
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

            const memberRole = (data.role || 'viewer') as 'editor' | 'viewer'

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
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to invite member'
            showToast(message, 'error')
        }
    }, [id, isOwner, project, team, inviteForm, loadProjectData, showToast])

    const handleRemoveMember = useCallback(async (memberId: string) => {
        if (!id || !isOwner) return

        try {
            await removeTeamMember(id, memberId)
            showToast('Member removed successfully', 'success')
            await loadProjectData()
        } catch (error: unknown) {
            showToast('Failed to remove member', 'error')
        }
    }, [id, isOwner, loadProjectData, showToast])

    const handleGenerateReport = useCallback(async () => {
        if (!project) return

        try {
            await generateProjectReport(project, scans)
            showToast('Report generated successfully!', 'success')
        } catch (error: unknown) {
            showToast('Failed to generate report', 'error')
        }
    }, [project, scans, showToast])

    return {
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
        // Refresh
        refresh: loadProjectData
    }
}
