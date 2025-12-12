import { Mail, Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthLogic } from '@/features/auth/hooks/useAuthLogic';
import {
  AuthLayout,
  AuthFormCard,
  AuthInputField,
  AuthVisualPanel,
  AuthSubmitButton,
  AuthDivider,
  GoogleAuthButton
} from '@/features/auth/components';

/**
 * Login Page - User authentication
 * 
 * Refactored to use reusable auth components.
 * Original: 177 lines → Refactored: ~70 lines
 */
const Login = () => {
  const { loginForm, handleLogin, handleGoogleLogin, isLoading } = useAuthLogic();
  const { register, handleSubmit, formState: { errors } } = loginForm;

  return (
    <AuthLayout
      visualContent={
        <AuthVisualPanel
          icon={Zap}
          stat="124"
          statLabel="Active Projects Managed"
          quote="ArchitectAI transformed our design process, cutting lead times by 30%! It's the essential tool for modern construction."
          authorInitials="SC"
          authorName="Sarah Chen"
          authorTitle="Lead Architect, NovaBuild"
          gradient="from-purple-500 to-pink-500"
          rotate="left"
        />
      }
    >
      <AuthFormCard
        title="Welcome Back"
        subtitle="Sign in to continue building smarter."
        footer={
          <>
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </>
        }
      >
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleLogin)}>
          <div className="space-y-4">
            <AuthInputField
              icon={Mail}
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              aria-label="Email Address"
              error={errors.email?.message}
              {...register('email')}
            />
            <AuthInputField
              icon={Lock}
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              aria-label="Password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-border bg-background rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </Link>
          </div>

          <AuthSubmitButton
            isLoading={isLoading}
            loadingText="Signing In..."
            submitText="Sign In"
          />

          <AuthDivider />

          <GoogleAuthButton onClick={handleGoogleLogin} isLoading={isLoading} />
        </form>
      </AuthFormCard>
    </AuthLayout>
  );
};

export default Login;
