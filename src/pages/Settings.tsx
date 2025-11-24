import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Trash2, Key, Save, Upload, X, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase'
import { updateProfile, uploadAvatar } from '@/services/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { AlertTriangle } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'

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
  const { t, i18n } = useTranslation()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
    showToast('Language changed successfully!', 'success')
  }

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
  }, [user])

  const handleUpdateProfile = async (data: ProfileFormData) => {
    if (!user) return

    try {
      const updatedUser = await updateProfile({
        displayName: data.displayName,
        avatar: avatarPreview || undefined,
      })

      setUser(updatedUser)
      showToast('Profile updated successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error')
      return
    }

    setUploadingAvatar(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload avatar
      const avatarUrl = await uploadAvatar(file)

      // Update profile with new avatar
      const updatedUser = await updateProfile({
        avatar: avatarUrl,
      })

      setUser(updatedUser)
      setAvatarPreview(avatarUrl)
      showToast('Avatar uploaded successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to upload avatar', 'error')
      setAvatarPreview(user.avatar || null)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user) return

    try {
      const updatedUser = await updateProfile({
        avatar: undefined,
      })

      setUser(updatedUser)
      setAvatarPreview(null)
      showToast('Avatar removed successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to remove avatar', 'error')
    }
  }

  const handleChangePassword = async (data: PasswordFormData) => {
    if (!user) return

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) {
        throw error
      }

      showToast('Password updated successfully!', 'success')
      passwordForm.reset()
    } catch (error: any) {
      showToast(error.message || 'Failed to update password', 'error')
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      // Delete user from Supabase Auth (this will cascade delete from database)
      const { error } = await supabase.auth.admin.deleteUser(user.uid)
      
      if (error) {
        // If admin API is not available, use regular API
        const { error: deleteError } = await supabase.rpc('delete_user_account')
        if (deleteError) {
          throw deleteError
        }
      }

      showToast('Account deleted successfully', 'success')
      await logout()
    } catch (error: any) {
      showToast(error.message || 'Failed to delete account', 'error')
    }
  }

  if (!user) {
    return (
      <div className="space-y-6 max-w-2xl">
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">

      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input 
                id="email" 
                type="email" 
                value={user.email} 
                disabled 
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

                <div className="space-y-4">
                  {/* Avatar Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Avatar</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="h-20 w-20 rounded-full object-cover border-2 border-border"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                            <User className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        {uploadingAvatar && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <Spinner size="sm" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {avatarPreview ? 'Change' : 'Upload'}
                        </Button>
                        {avatarPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveAvatar}
                            disabled={uploadingAvatar}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a profile picture (max 5MB, JPG, PNG, or GIF)
                    </p>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="text-sm font-medium">
                      Display Name
                    </label>
                    <Input
                      id="displayName"
                      {...profileForm.register('displayName')}
                      className={profileForm.formState.errors.displayName ? 'border-destructive' : ''}
                    />
                    {profileForm.formState.errors.displayName && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.displayName.message}
                      </p>
                    )}
                  </div>
                </div>

            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5" />
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register('newPassword')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit">
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Language Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5" />
            <div>
              <CardTitle>Language</CardTitle>
              <CardDescription>Customize your app language</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={i18n.language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeLanguage('en')}
              >
                English
              </Button>
              <Button
                type="button"
                variant={i18n.language === 'hi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeLanguage('hi')}
              >
                हिंदी
              </Button>
              <Button
                type="button"
                variant={i18n.language === 'te' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeLanguage('te')}
              >
                తెలుగు
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}