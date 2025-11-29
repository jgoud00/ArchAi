import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { GoogleLogo } from '../components/ui/GoogleLogo';
import { Link } from 'react-router-dom';
import { useAuthLogic } from '@/hooks/useAuthLogic';
import { Spinner } from '@/components/ui/Spinner';

const Login: React.FC = () => {
  const { loginForm, handleLogin, handleGoogleLogin, isLoading } = useAuthLogic();
  const { register, handleSubmit, formState: { errors } } = loginForm;

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/30">
      {/* Left Side (Form Area) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        {/* Background Gradients for Form Side */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-md w-full space-y-8 bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo className="h-10 w-auto" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue building smarter.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleLogin)}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-label="Email Address"
                  className={`block w-full pl-11 pr-4 py-3 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all ${errors.email ? 'border-destructive animate-shake' : ''}`}
                  placeholder="Email Address"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-label="Password"
                  className={`block w-full pl-11 pr-4 py-3 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all ${errors.password ? 'border-destructive animate-shake' : ''}`}
                  placeholder="Password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
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

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                {isLoading ? 'Signing In...' : 'Sign In'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card/50 text-muted-foreground backdrop-blur-xl">Or continue with</span>
              </div>
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 bg-background/5 border-border text-muted-foreground hover:bg-background/10 hover:text-foreground hover:border-border/20 rounded-xl transition-all"
              >
                <GoogleLogo className="h-5 w-5 mr-3" /> Google
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side (Visual Area) */}
      <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/20"></div>
        <div className="blueprint-grid absolute inset-0 opacity-20"></div>

        {/* Abstract Shapes */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse-slow delay-1000"></div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <div className="relative bg-card/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-2">124</div>
              <div className="text-muted-foreground text-sm">Active Projects Managed</div>
            </div>
          </div>

          <blockquote className="text-xl font-medium text-muted-foreground leading-relaxed mb-6">
            "ArchitectAI transformed our design process, cutting lead times by 30%! It's the essential tool for modern construction."
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              SC
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">Sarah Chen</div>
              <div className="text-primary text-sm">Lead Architect, NovaBuild</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
