import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from '@/utils/validators'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { Logo } from '@/components/Logo'
import { z } from 'zod'
import { Zap, Shield, Users } from 'lucide-react'

type SignupFormData = z.infer<typeof signupSchema>

export const Signup = () => {
  const navigate = useNavigate()
  const { signup } = useAuthStore()
  const { toasts, showToast, dismissToast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    try {
      await signup(data.email, data.password, data.name)
      navigate('/dashboard')
    } catch (error: any) {
      showToast(error.message || 'Sign up failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      title: "AI-Powered Analysis",
      desc: "Automated blueprint scanning and issue detection."
    },
    {
      icon: <Shield className="w-5 h-5 text-green-400" />,
      title: "Secure & Compliant",
      desc: "Enterprise-grade security for your sensitive project data."
    },
    {
      icon: <Users className="w-5 h-5 text-blue-400" />,
      title: "Team Collaboration",
      desc: "Real-time updates and seamless communication."
    }
  ]

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 animate-fade-in">
        <div className="mb-8">
          <Logo size="md" showText={true} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">Create an account</h1>
          <p className="text-muted-foreground">
            Start managing your construction projects smarter today.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name')}
              className={`h-11 ${errors.name ? 'border-destructive' : ''}`}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              {...register('email')}
              className={`h-11 ${errors.email ? 'border-destructive' : ''}`}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={`h-11 ${errors.password ? 'border-destructive' : ''}`}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={`h-11 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 btn-primary-enhanced"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
              onClick={(e) => loading && e.preventDefault()}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>

      {/* Right Panel - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
        <div className="absolute inset-0 blueprint-grid opacity-10" />

        {/* Decorative Circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Content Container */}
        <div className="relative z-10 max-w-lg w-full">
          <h2 className="text-3xl font-bold text-white mb-8 leading-tight">
            Join the future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              Construction Management
            </span>
          </h2>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass p-4 rounded-xl border border-white/5 flex items-start gap-4 transition-all hover:translate-x-2 duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mt-1 p-2 rounded-lg bg-white/5 border border-white/10">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
