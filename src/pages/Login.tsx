import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/utils/validators'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { z } from 'zod'

type LoginFormData = z.infer<typeof loginSchema>

export const Login = () => {
  const navigate = useNavigate()
  const { user, login, loading: authLoading } = useAuthStore()
  const { toasts, showToast, dismissToast } = useToast()
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    // Prevent double submission
    if (loading) return

    setLoading(true)
    try {
      // Call login function from auth store
      // This will update the user state
      await login(data.email, data.password)
      
      // Show success message
      showToast('Login successful! Redirecting...', 'success')
      
      // Reset loading state
      setLoading(false)
      
      // Navigate immediately - user state is already updated by login()
      navigate('/dashboard', { replace: true })
      
    } catch (error: any) {
      // Handle specific error types
      let errorMessage = 'Login failed. Please check your credentials.'
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before logging in.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showToast(errorMessage, 'error')
      setLoading(false)
    }
  }

  // Don't render if already logged in (will redirect)
  // Check both user and authLoading to avoid showing spinner unnecessarily
  if (user && !authLoading) {
    return null // Let navigation handle it
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">ArchitectAI</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="space-y-2">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-primary hover:underline"
                  onClick={(e) => loading && e.preventDefault()}
                >
                  Sign up
                </Link>
              </p>
              <p className="text-center text-sm">
                <Link 
                  to="/forgot-password" 
                  className="text-primary hover:underline"
                  onClick={(e) => loading && e.preventDefault()}
                >
                  Forgot your password?
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
