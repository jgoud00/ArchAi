import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { newPasswordSchema } from '@/utils/validators'
import { resetPassword } from '@/features/auth/services/auth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { z } from 'zod'
import { CheckCircle, Lock, ArrowLeft } from 'lucide-react'
import { AuthInputField } from '@/features/auth/components'

type ResetPasswordFormData = z.infer<typeof newPasswordSchema>

/**
 * ResetPassword Page - Set new password after email verification
 * 
 * Refactored to use auth components with accessibility improvements.
 * Original: 150 lines → Refactored: ~120 lines
 */
export const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toasts, showToast, dismissToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  })

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const type = searchParams.get('type')

    if (!accessToken || type !== 'recovery') {
      showToast('Invalid or missing reset token. Please request a new password reset.', 'error')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    }
  }, [searchParams, navigate, showToast])

  const onSubmit = useCallback(async (data: ResetPasswordFormData) => {
    if (loading) return

    setLoading(true)
    try {
      await resetPassword(data.password)
      setSuccess(true)
      showToast('Password reset successfully! Redirecting to login...', 'success')

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reset password. Please try again.'
      showToast(message, 'error')
      setLoading(false)
    }
  }, [loading, navigate, showToast])

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
            <CardDescription>Your password has been updated. Redirecting to login...</CardDescription>
          </CardHeader>
        </Card>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <AuthInputField
              icon={Lock}
              id="password"
              type="password"
              placeholder="New password"
              autoComplete="new-password"
              aria-label="New password"
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={loading}
              error={errors.password?.message}
              {...register('password')}
            />

            <AuthInputField
              icon={Lock}
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              aria-label="Confirm new password"
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              disabled={loading}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" aria-hidden="true" />
                  <span>Resetting password...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Sign In
            </Link>
          </form>
        </CardContent>
      </Card>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
