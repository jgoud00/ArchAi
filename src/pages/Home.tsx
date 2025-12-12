import React, { useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



export const Home: React.FC = () => {
  const navigate = useNavigate();

  // OPTIMIZATION: Memoized navigation handlers
  const handleSignup = useCallback(() => navigate('/signup'), [navigate]);
  const handleLogin = useCallback(() => navigate('/login'), [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="blueprint-grid absolute inset-0 opacity-[0.15]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-12 lg:gap-20">
          <div className="w-full max-w-4xl text-center mx-auto animate-fade-in-up">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              The Future of Construction Tech
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              Build Smarter with <br />
              <span className="text-primary">
                Intelligent AI
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
              Revolutionize your architectural workflow. Generate blueprints, optimize resources, and manage projects with next-gen AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                ripple
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                onClick={handleSignup}
              >
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border/80"
                onClick={handleLogin}
              >
                View Live Demo
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-primary" /> No credit card required</div>
              <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-primary" /> 14-day free trial</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
