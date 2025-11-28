import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { Mail, Lock } from 'lucide-react';
import { GoogleLogo } from '../components/ui/GoogleLogo';
import { Zap } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side (Work Area) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-white text-slate-900 relative z-10">
        <div className="max-w-md w-full space-y-8">
          <div className="flex justify-center">
            <Logo className="h-10 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Sign in to continue building smarter.
          </p>
          <form className="mt-8 space-y-6" action="#" method="POST">
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-4 pt-6 pb-2 border-slate-200 focus:border-cyan-500 rounded-md shadow-sm placeholder-transparent peer"
                placeholder=" " // Important for floating label
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-1 text-sm text-slate-400 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-focus:top-1 peer-focus:text-sm peer-focus:text-cyan-600"
              >
                Email address
              </label>
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 pt-6 pb-2 border-slate-200 focus:border-cyan-500 rounded-md shadow-sm placeholder-transparent peer"
                placeholder=" "
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-1 text-sm text-slate-400 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-focus:top-1 peer-focus:text-sm peer-focus:text-cyan-600"
              >
                Password
              </label>
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-cyan-600 hover:text-cyan-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white hover-lift">
                Sign in
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <div>
            <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover-lift">
              <GoogleLogo className="h-5 w-5 mr-3" /> Continue with Google
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-cyan-600 hover:text-cyan-500">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Right Side (Brand Area) */}
      <div className="hidden lg:flex lg:w-3/5 bg-slate-900 relative overflow-hidden items-center justify-center p-8">
        <div className="blueprint-grid absolute inset-0 z-0 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10"></div>
        <div className="relative z-20 glass-dark p-8 rounded-xl max-w-sm text-white text-center space-y-4 shadow-xl animate-fade-in-up">
          <p className="text-xl font-semibold text-cyan-300">"ArchitectAI transformed our design process, cutting lead times by 30%!"</p>
          <p className="text-slate-400">— Sarah Chen, Lead Architect at NovaBuild</p>
          <div className="flex items-center justify-center space-x-2 text-cyan-400">
            <Zap size={20} />
            <span className="text-2xl font-bold">124</span>
            <span className="text-slate-400">Active Projects</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
