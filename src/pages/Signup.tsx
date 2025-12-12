import { User, Mail, Lock, Zap } from 'lucide-react';
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
 * Signup Page - User registration
 * 
 * Refactored to use reusable auth components.
 * Original: 193 lines → Refactored: ~80 lines
 */
const Signup = () => {
  const { signupForm, handleSignup, handleGoogleLogin, isLoading } = useAuthLogic();
  const { register, handleSubmit, formState: { errors } } = signupForm;

  return (
    <AuthLayout
      visualContent={
        <AuthVisualPanel
          icon={Zap}
          stat="98%"
          statLabel="Client Satisfaction Score"
          quote="ArchitectAI has completely revolutionized how we approach complex structural designs. It's not just a tool; it's a competitive advantage."
          authorInitials="JD"
          authorName="John Doe"
          authorTitle="Principal Architect, UrbanFlow"
          gradient="from-cyan-400 to-blue-500"
          rotate="right"
        />
      }
    >
      <AuthFormCard
        title="Create Account"
        subtitle="Join the future of construction technology."
        footer={
          <>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Log in
            </Link>
          </>
        }
      >
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleSignup)}>
          <div className="space-y-4">
            <AuthInputField
              icon={User}
              type="text"
              placeholder="Full Name"
              autoComplete="name"
              aria-label="Full Name"
              error={errors.name?.message}
              {...register('name')}
            />
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
              autoComplete="new-password"
              aria-label="Password"
              error={errors.password?.message}
              {...register('password')}
            />
            <AuthInputField
              icon={Lock}
              type="password"
              placeholder="Confirm Password"
              autoComplete="new-password"
              aria-label="Confirm Password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <AuthSubmitButton
            isLoading={isLoading}
            loadingText="Creating Account..."
            submitText="Sign Up"
          />

          <AuthDivider />

          <GoogleAuthButton onClick={handleGoogleLogin} isLoading={isLoading} />
        </form>
      </AuthFormCard>
    </AuthLayout>
  );
};

export default Signup;
