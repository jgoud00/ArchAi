import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { GoogleLogo } from '../components/ui/GoogleLogo';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-slate-950 text-white selection:bg-cyan-500/30">
      {/* Left Side (Form Area) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        {/* Background Gradients for Form Side */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-md w-full space-y-8 bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo className="h-10 w-auto" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to continue building smarter.
            </p>
          </div>

          <form className="mt-8 space-y-6" action="#" method="POST">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl transition-all"
                  placeholder="Email Address"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-700 bg-slate-900 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:-translate-y-0.5">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/50 text-slate-500 backdrop-blur-xl">Or continue with</span>
              </div>
            </div>

            <div>
              <Button variant="outline" className="w-full py-3 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 rounded-xl transition-all">
                <GoogleLogo className="h-5 w-5 mr-3" /> Google
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side (Visual Area) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20"></div>
        <div className="blueprint-grid absolute inset-0 opacity-20"></div>

        {/* Abstract Shapes */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] animate-pulse-slow delay-1000"></div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Zap className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <div className="text-2xl font-bold text-white mb-2">124</div>
              <div className="text-slate-400 text-sm">Active Projects Managed</div>
            </div>
          </div>

          <blockquote className="text-xl font-medium text-slate-300 leading-relaxed mb-6">
            "ArchitectAI transformed our design process, cutting lead times by 30%! It's the essential tool for modern construction."
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              SC
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">Sarah Chen</div>
              <div className="text-cyan-400 text-sm">Lead Architect, NovaBuild</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
