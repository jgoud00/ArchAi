import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { passwordResetSchema } from '@/utils/validators'
import { requestPasswordReset } from '@/features/auth/services/auth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { z } from 'zod'
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react'
import { AuthInputField } from '@/features/auth/components'

type ForgotPasswordFormData = z.infer<typeof passwordResetSchema>

/**
 * ForgotPassword Page - Password reset request
 * 
 * Refactored to use auth components.
 * Original: 137 lines → Refactored: ~100 lines
 */
export const ForgotPassword = () => {
  const { toasts, showToast, dismissToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(passwordResetSchema),
  })

  const onSubmit = useCallback(async (data: ForgotPasswordFormData) => {
    if (loading) return

    setLoading(true)
    try {
      await requestPasswordReset(data.email)
      setEmail(data.email)
      setEmailSent(true)
      showToast('Password reset email sent! Check your inbox.', 'success')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email. Please try again.'
      showToast(message, 'error')
      setLoading(false)
    }
  }, [loading, showToast])

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p className="mb-2 font-medium">If you don't see the email:</p>
              <ul className="list-disc list-inside space-y-1" role="list">
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes and try again</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600" role="status" aria-live="polite">
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              <span>Email sent successfully</span>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Sign In
            </Link>
          </CardContent>
        </Card>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <AuthInputField
              icon={Mail}
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-label="Email address"
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={loading}
              error={errors.email?.message}
              {...register('email')}
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
                  <span>Sending...</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
