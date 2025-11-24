import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Logo } from '@/components/Logo'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { 
  LayoutDashboard, 
  FileText, 
  Camera, 
  Package, 
  FolderOpen, 
  Users, 
  Shield,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { elementRef: heroObserverRef, isVisible: heroVisible } = useIntersectionObserver({ triggerOnce: true })
  const { elementRef: featuresObserverRef, isVisible: featuresVisible } = useIntersectionObserver({ triggerOnce: true })
  const { elementRef: benefitsObserverRef, isVisible: benefitsVisible } = useIntersectionObserver({ triggerOnce: true })
  const { elementRef: ctaObserverRef, isVisible: ctaVisible } = useIntersectionObserver({ triggerOnce: true })

  const features = [
    {
      icon: FileText,
      title: 'Blueprint Sketcher',
      description: 'Create and edit architectural blueprints with precision tools and real-time collaboration.',
      color: 'text-blue-600'
    },
    {
      icon: Camera,
      title: 'Drone Scan Processor',
      description: 'Upload and analyze drone scans with AI-powered progress tracking and issue detection.',
      color: 'text-cyan-600'
    },
    {
      icon: Package,
      title: 'Inventory Manager',
      description: 'Track materials, equipment, and resources across all your construction projects.',
      color: 'text-indigo-600'
    },
    {
      icon: FolderOpen,
      title: 'Document Manager',
      description: 'Centralized document storage with version control and secure access management.',
      color: 'text-slate-600'
    },
    {
      icon: LayoutDashboard,
      title: 'Project Dashboard',
      description: 'Real-time project overview with budgets, timelines, and progress tracking.',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Supervisor and Admin roles with granular permissions for team collaboration.',
      color: 'text-cyan-600'
    },
  ]

  const benefits = [
    'Streamlined project management',
    'Real-time collaboration',
    'AI-powered insights',
    'Secure cloud storage',
    'Mobile-responsive design',
    'Comprehensive reporting'
  ]

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle animated blueprint grid background for entire page */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0" style={{ opacity: 0.3 }} />
      {/* Hero Section */}
      <section 
        ref={heroObserverRef}
        className="relative overflow-hidden border-b border-border/50 z-10"
      >
        {/* Premium gradient background */}
        <div className="absolute inset-0 hero-gradient" />
        
        {/* Animated blueprint grid background - subtle and slow */}
        <div className="absolute inset-0 blueprint-grid" />
        
        {/* Subtle parallax overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231e40af' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
            animation: 'parallax 25s ease-in-out infinite alternate'
          }}
        />
        
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40 ${heroVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="text-center hero-glow">
            {/* Logo with float animation */}
            <div className="flex justify-center mb-12">
              <div className="icon-float">
                <Logo size="lg" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-10 animate-slide-in-up tracking-tight text-glow" style={{ animationDelay: '0.2s' }}>
              Architect<span className="text-[#00E5FF]">AI</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-in-up font-medium" style={{ animationDelay: '0.4s' }}>
              Smart Construction. Smarter Decisions.
            </p>
            <p className="text-lg text-muted-foreground mb-16 max-w-3xl mx-auto animate-slide-in-up leading-relaxed" style={{ animationDelay: '0.6s' }}>
              The all-in-one construction management platform for architects, engineers, and supervisors.
              Manage projects, track progress, and collaborate seamlessly.
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-5 justify-center animate-slide-in-up`} style={{ animationDelay: '0.8s' }}>
              {user ? (
                <>
                  <Button 
                    size="lg" 
                    className="btn-primary-enhanced text-lg px-10 py-7 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg font-semibold"
                    onClick={() => navigate('/dashboard')}
                    aria-label="Navigate to dashboard"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" aria-hidden="true" />
                    Go to Dashboard
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="btn-outline-enhanced text-lg px-10 py-7 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg font-semibold"
                    onClick={() => navigate('/dashboard')}
                    aria-label="Create a new project"
                  >
                    Create Project
                    <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="btn-primary-enhanced text-lg px-10 py-7 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg font-semibold"
                    onClick={() => navigate('/login')}
                    aria-label="Get started with ArchitectAI"
                  >
                    Get Started
                    <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="btn-outline-enhanced text-lg px-10 py-7 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg font-semibold"
                    onClick={() => navigate('/signup')}
                    aria-label="Sign up for a new account"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresObserverRef}
        className={`relative py-24 lg:py-36 bg-background z-10 ${featuresVisible ? 'fade-in-on-scroll visible' : 'fade-in-on-scroll'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to manage construction projects from start to finish
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index} 
                  className="glass hover-lift border-border/50 shadow-soft cursor-pointer group focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-xl overflow-hidden"
                  tabIndex={0}
                  role="article"
                  aria-label={feature.title}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <CardHeader className="pb-4">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br from-accent to-accent/50 mb-5 ${feature.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-soft`}>
                      <Icon className="h-6 w-6 stroke-[1.5]" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl font-semibold leading-tight mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        ref={benefitsObserverRef}
        className={`relative py-24 lg:py-36 bg-gradient-to-b from-accent/20 to-background border-t border-border/50 z-10 ${benefitsVisible ? 'fade-in-on-scroll visible' : 'fade-in-on-scroll'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-7 tracking-tight">
                Why Choose ArchitectAI?
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Built specifically for construction professionals, ArchitectAI combines powerful project management 
                tools with intuitive design to help you stay on top of every aspect of your projects.
              </p>
              <ul className="space-y-6">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <div className="mt-0.5 flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-[#00E5FF] stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-lg text-foreground font-medium leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="glass-dark rounded-2xl p-10 shadow-soft-xl">
                <div className="space-y-8">
                  <div className="flex items-center gap-5 group">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#00E5FF]/10 to-[#00E5FF]/5 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-7 w-7 text-[#00E5FF] stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Secure & Reliable</h3>
                      <p className="text-muted-foreground leading-relaxed">Enterprise-grade security for your projects</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 group">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#00E5FF]/10 to-[#00E5FF]/5 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-7 w-7 text-[#00E5FF] stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Team Collaboration</h3>
                      <p className="text-muted-foreground leading-relaxed">Work together seamlessly with role-based access</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 group">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#00E5FF]/10 to-[#00E5FF]/5 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
                      <LayoutDashboard className="h-7 w-7 text-[#00E5FF] stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Real-Time Insights</h3>
                      <p className="text-muted-foreground leading-relaxed">Make data-driven decisions with live analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaObserverRef}
        className={`relative py-24 lg:py-36 bg-background border-t border-border/50 z-10 ${ctaVisible ? 'fade-in-on-scroll visible' : 'fade-in-on-scroll'}`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-7 tracking-tight">
            Ready to Transform Your Construction Management?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Join architects, engineers, and supervisors who trust ArchitectAI for their projects.
          </p>
          {user ? (
            <Button 
              size="lg" 
              className="btn-primary-enhanced text-lg px-10 py-7 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg font-semibold"
              onClick={() => navigate('/dashboard')}
              aria-label="Navigate to dashboard"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button 
                size="lg" 
                className="btn-primary-enhanced text-lg px-10 py-7 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg font-semibold"
                onClick={() => navigate('/signup')}
                aria-label="Start free trial"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="btn-outline-enhanced text-lg px-10 py-7 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg font-semibold"
                onClick={() => navigate('/login')}
                aria-label="Sign in to your account"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

