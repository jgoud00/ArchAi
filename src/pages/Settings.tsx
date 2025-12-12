import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/authStore'
import { supabase } from '@/services/supabase'
import { updateProfile, uploadAvatar } from '@/features/auth/services/auth'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { PasswordSettings } from '@/components/settings/PasswordSettings'
import { LanguageSettings } from '@/components/settings/LanguageSettings'
import { DangerZoneSettings } from '@/components/settings/DangerZoneSettings'
import { layout } from '@/styles/designTokens'

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export const Settings = () => {
  const { user, logout, setUser } = useAuthStore()
  const { toasts, showToast, dismissToast } = useToast()
  const { i18n } = useTranslation()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user?.displayName || '',
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [user, profileForm])

  const handleUpdateProfile = useCallback(async (data: ProfileFormData) => {
    if (!user) return

    try {
      const updatedUser = await updateProfile({
        displayName: data.displayName,
        avatar: avatarPreview || undefined,
      })

      setUser(updatedUser)
      showToast('Profile updated successfully!', 'success')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile'
      showToast(message, 'error')
    }
  }, [user, avatarPreview, setUser, showToast])

  const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error')
      return
    }

    setUploadingAvatar(true)

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      const avatarUrl = await uploadAvatar(file)
      const updatedUser = await updateProfile({ avatar: avatarUrl })

      setUser(updatedUser)
      setAvatarPreview(avatarUrl)
      showToast('Avatar uploaded successfully!', 'success')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload avatar'
      showToast(message, 'error')
      setAvatarPreview(user.avatar || null)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [user, setUser, showToast])

  const handleRemoveAvatar = useCallback(async () => {
    if (!user) return

    try {
      const updatedUser = await updateProfile({ avatar: undefined })
      setUser(updatedUser)
      setAvatarPreview(null)
      showToast('Avatar removed successfully!', 'success')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove avatar'
      showToast(message, 'error')
    }
  }, [user, setUser, showToast])

  const handleChangePassword = useCallback(async (data: PasswordFormData) => {
    if (!user) return

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) throw error

      showToast('Password updated successfully!', 'success')
      passwordForm.reset()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update password'
      showToast(message, 'error')
    }
  }, [user, showToast, passwordForm])

  const changeLanguage = useCallback((lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
    showToast('Language changed successfully!', 'success')
  }, [i18n, showToast])

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return

    try {
      const { error: deleteError } = await supabase.rpc('delete_user_account')

      if (deleteError) {
        throw new Error(deleteError.message || 'Failed to delete account. Please contact support.')
      }

      showToast('Account deleted successfully', 'success')
      await logout()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete account'
      showToast(message, 'error')
    }
  }, [user, showToast, logout])

  if (!user) {
    return (
      <PageLayout>
        <p className="text-muted-foreground">Loading user data...</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout maxWidth="2xl">
      <div className={layout.sectionSpacing}>
        <PageHeader
          title="Settings"
          description="Manage your account settings"
        />

        {/* Profile Section */}
        <ProfileSettings
          user={user}
          profileForm={profileForm}
          avatarPreview={avatarPreview}
          uploadingAvatar={uploadingAvatar}
          fileInputRef={fileInputRef}
          onSubmit={handleUpdateProfile}
          onAvatarUpload={handleAvatarUpload}
          onRemoveAvatar={handleRemoveAvatar}
        />

        {/* Password Section */}
        <PasswordSettings
          passwordForm={passwordForm}
          onSubmit={handleChangePassword}
        />

        {/* Language Section */}
        <LanguageSettings
          currentLanguage={i18n.language}
          onLanguageChange={changeLanguage}
        />

        {/* Danger Zone */}
        <DangerZoneSettings
          onDeleteAccount={() => setDeleteConfirmOpen(true)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium">Are you sure you want to delete your account?</p>
          </div>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All your projects, scans, and data will be permanently deleted.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </PageLayout>
  )
}